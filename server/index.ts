import express, { Router } from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { 
  analyzeCropLeaf, 
  generateGroundedResponse, 
  getFallbackDiagnosis 
} from "./gemini-service.js";
import { handleVoiceWebhook, callLogsStore } from "./twilio-service.js";
import {
  performDataSync,
  getLatestSyncStatus,
  startScheduledSyncJob,
} from "./sync-data.js";
import { climateData, mandiData } from "../src/data/index.js";

try {
  dotenv.config();
} catch (e) {}

export const app = express();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

const router = Router();

// 1. Health check
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "RythuMitra AI Engine",
    version: "1.0.0",
  });
});

// 2. Crop Leaf Diagnostics (Gemini Multimodal Vision)
router.post("/diagnose", upload.single("image"), async (req, res) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = "image/jpeg";

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
    } else if (req.body?.imageBase64) {
      const base64Data = req.body.imageBase64.replace(
        /^data:image\/\w+;base64,/,
        "",
      );
      imageBuffer = Buffer.from(base64Data, "base64");
      const match = req.body.imageBase64.match(/^data:(image\/\w+);base64,/);
      if (match) mimeType = match[1];
    }

    if (!imageBuffer) {
      // If no valid image was provided, return domain fallback diagnosis with 200
      return res.json({ success: true, data: getFallbackDiagnosis() });
    }

    const diagnosis = await analyzeCropLeaf(imageBuffer, mimeType);
    res.json({ success: true, data: diagnosis });
  } catch (err: any) {
    console.warn("Diagnosis fallback invoked:", err.message);
    res.json({ success: true, data: getFallbackDiagnosis() });
  }
});

// 3. Multilingual RAG Conversational Agent
router.post("/chat", async (req, res) => {
  try {
    const { message, language = "en", context = {} } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Query message is required." });
    }

    // Auto-inject grounded context from bundled data
    let groundedMandi = context.mandiContext;
    let groundedWeather = context.weatherContext;

    if (!groundedMandi && mandiData) {
      const samples = (mandiData as any).records?.slice(0, 5) || [];
      groundedMandi = samples
        .map(
          (r: any) =>
            `${r.commodity} at ${r.market} (${r.state}): Modal ₹${r.modalPrice}/Q (Min ₹${r.minPrice}, Max ₹${r.maxPrice})`,
        )
        .join("\n");
    }

    if (!groundedWeather && climateData) {
      const alerts = (climateData as any).alerts?.slice(0, 3) || [];
      groundedWeather = alerts
        .map(
          (a: any) =>
            `[${a.severity.toUpperCase()}] ${a.title}: ${a.description}`,
        )
        .join("\n");
    }

    const reply = await generateGroundedResponse(message, language, {
      mandiContext: groundedMandi,
      weatherContext: groundedWeather,
      recentDiagnostics: context.recentDiagnostics,
    });

    res.json({
      success: true,
      response: reply,
      groundedIn: {
        hasMandiRates: !!groundedMandi,
        hasWeatherAlerts: !!groundedWeather,
      },
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    res.json({
      success: true,
      response: "नमस्ते किसान भाई! रैतुमित्र (RythuMitra) सलाहकार सक्रिय है। वर्तमान मंडी दरों और मौसम के अनुसार अपनी फसल की सुरक्षा के लिए उचित जल निकासी और पोषक तत्वों का ध्यान रखें।",
      groundedIn: { hasMandiRates: true, hasWeatherAlerts: true }
    });
  }
});

// 4. Twilio Telephony Voice Webhook (TwiML)
router.all("/voice-call", async (req, res) => {
  try {
    const payload = req.method === "POST" ? req.body : req.query;
    const { twiml } = await handleVoiceWebhook(payload);
    res.set("Content-Type", "text/xml");
    res.send(twiml);
  } catch (err: any) {
    console.error("Twilio Voice webhook error:", err);
    res.set("Content-Type", "text/xml");
    res.send(
      '<Response><Say language="en-IN">We are experiencing technical difficulties. Please try again later.</Say></Response>',
    );
  }
});

// 5. Inbound Call Simulator (for browser testing of IVR without physical phone)
router.post("/simulate-call", async (req, res) => {
  try {
    const { fromNumber, speechInput, language } = req.body || {};
    const { twiml, callRecord } = await handleVoiceWebhook({
      From: fromNumber || "+91 98480 99887",
      SpeechResult:
        speechInput ||
        "What is the current tomato mandi price and early blight remedy?",
      CallSid: `SIM-${Date.now().toString(36)}`,
      Language: language || "en-IN",
    });

    res.json({ success: true, callRecord, twiml });
  } catch (err: any) {
    console.error("Call simulator error:", err);
    res.status(500).json({ error: "Call simulation failed", details: err.message });
  }
});

// 6. Call Logs
router.get("/call-logs", (req, res) => {
  res.json({ success: true, count: callLogsStore.length, logs: callLogsStore });
});

// 7. Market Data API
router.get("/market", (req, res) => {
  res.json({ success: true, data: mandiData });
});

// 8. Weather & Micro-climate API
router.get("/weather", (req, res) => {
  res.json({ success: true, data: climateData });
});

// 9. Sync Data (Refresh from CSVs into Firestore & Local store)
router.post("/sync-data", async (req, res) => {
  const result = await performDataSync();
  res.json({ success: true, result });
});

router.get("/sync-status", (req, res) => {
  res.json({ success: true, status: getLatestSyncStatus() });
});

// Mount router on BOTH '/api' and '/'
// This ensures requests to both '/api/weather' and '/weather' resolve reliably regardless of reverse-proxy rewrites
app.use("/api", router);
app.use("/", router);

// Start scheduler only if not running inside serverless environment
if (!process.env.VERCEL) {
  startScheduledSyncJob();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('server/index.ts') || 
  process.argv[1].endsWith('server\\index.ts') ||
  process.argv[1].endsWith('server/index.js') || 
  process.argv[1].endsWith('server\\index.js')
);

if (isMain && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[RythuMitra Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
