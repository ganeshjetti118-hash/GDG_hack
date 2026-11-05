import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { analyzeCropLeaf, generateGroundedResponse } from "./gemini-service.js";
import { handleVoiceWebhook, callLogsStore } from "./twilio-service.js";
import {
  performDataSync,
  getLatestSyncStatus,
  startScheduledSyncJob,
} from "./sync-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const app = express(); // Changed from export const app
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const CLIMATE_PATH = path.resolve(__dirname, "../src/data/climate-data.json");
const MANDI_PATH = path.resolve(__dirname, "../src/data/mandi-sample.json");

// --- API ROUTES ---

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "AgriBridge AI Engine",
    version: "1.0.0",
  });
});

// 2. Crop Leaf Diagnostics (Gemini Multimodal Vision)
app.post("/api/diagnose", upload.single("image"), async (req, res) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = "image/jpeg";

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(
        /^data:image\/\w+;base64,/,
        "",
      );
      imageBuffer = Buffer.from(base64Data, "base64");
      const match = req.body.imageBase64.match(/^data:(image\/\w+);base64,/);
      if (match) mimeType = match[1];
    }

    if (!imageBuffer) {
      return res
        .status(400)
        .json({ error: "No image uploaded or base64 provided." });
    }

    const diagnosis = await analyzeCropLeaf(imageBuffer, mimeType);
    res.json({ success: true, data: diagnosis });
  } catch (err: any) {
    console.error("Diagnosis error:", err);
    res.status(500).json({ error: "Diagnosis failed", details: err.message });
  }
});

// 3. Multilingual RAG Conversational Agent
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language = "en", context = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Query message is required." });
    }

    let groundedMandi = context.mandiContext;
    let groundedWeather = context.weatherContext;

    if (!groundedMandi && fs.existsSync(MANDI_PATH)) {
      try {
        const mandi = JSON.parse(fs.readFileSync(MANDI_PATH, "utf-8"));
        const samples = mandi.records?.slice(0, 5) || [];
        groundedMandi = samples
          .map(
            (r: any) =>
              `${r.commodity} at ${r.market} (${r.state}): Modal ₹${r.modalPrice}/Q (Min ₹${r.minPrice}, Max ₹${r.maxPrice})`,
          )
          .join("\n");
      } catch (e) {}
    }

    if (!groundedWeather && fs.existsSync(CLIMATE_PATH)) {
      try {
        const climate = JSON.parse(fs.readFileSync(CLIMATE_PATH, "utf-8"));
        const alerts = climate.alerts?.slice(0, 3) || [];
        groundedWeather = alerts
          .map(
            (a: any) =>
              `[${a.severity.toUpperCase()}] ${a.title}: ${a.description}`,
          )
          .join("\n");
      } catch (e) {}
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
    res
      .status(500)
      .json({ error: "Chat resolution failed", details: err.message });
  }
});

// 4. Twilio Telephony Voice Webhook (TwiML)
app.all("/api/voice-call", async (req, res) => {
  try {
    const payload = req.method === "POST" ? req.body : req.query;
    console.log("[Twilio Webhook Received]", payload);

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

// 5. Inbound Call Simulator
app.post("/api/simulate-call", async (req, res) => {
  try {
    const { fromNumber, speechInput, language } = req.body;
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
    res
      .status(500)
      .json({ error: "Call simulation failed", details: err.message });
  }
});

// 6. Call Logs
app.get("/api/call-logs", (req, res) => {
  res.json({ success: true, count: callLogsStore.length, logs: callLogsStore });
});

// 7. Market Data API
app.get("/api/market", (req, res) => {
  if (!fs.existsSync(MANDI_PATH)) {
    return res.status(404).json({ error: "Market data not initialized yet." });
  }
  const data = JSON.parse(fs.readFileSync(MANDI_PATH, "utf-8"));
  res.json({ success: true, data });
});

// 8. Weather & Micro-climate API
app.get("/api/weather", (req, res) => {
  if (!fs.existsSync(CLIMATE_PATH)) {
    return res.status(404).json({ error: "Weather data not initialized yet." });
  }
  const data = JSON.parse(fs.readFileSync(CLIMATE_PATH, "utf-8"));
  res.json({ success: true, data });
});

// 9. Sync Data
app.post("/api/sync-data", async (req, res) => {
  const result = await performDataSync();
  res.json({ success: true, result });
});

app.get("/api/sync-status", (req, res) => {
  res.json({ success: true, status: getLatestSyncStatus() });
});

// Start scheduler only if not running inside serverless environment
if (!process.env.VERCEL) {
  startScheduledSyncJob();
}

const PORT = process.env.PORT || 3000;
if (
  process.env.NODE_ENV !== "test" &&
  !process.env.VITE &&
  !process.env.VERCEL
) {
  app.listen(PORT, () => {
    console.log(`[AgriBridge AI Server] Running on http://localhost:${PORT}`);
  });
}

// Crucial: Default export required for Vercel Serverless execution
export default app;
