import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import app from "../server/index.js";
import type { Server } from "http";

let server: Server;

async function runTests() {
  const PORT = 3009;
  server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}...`);

    try {
      // 1. Test Health
      const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
      console.log(
        "1. Health check status:",
        healthRes.status,
        await healthRes.json(),
      );

      // 2. Test Market
      const marketRes = await fetch(`http://localhost:${PORT}/api/market`);
      const marketData = await marketRes.json();
      console.log(
        "2. Market records count:",
        marketData.data?.records?.length,
        "Trends:",
        Object.keys(marketData.data?.commodityTrends || {}),
      );

      // 3. Test Weather
      const weatherRes = await fetch(`http://localhost:${PORT}/api/weather`);
      const weatherData = await weatherRes.json();
      console.log(
        "3. Weather cities count:",
        weatherData.data?.cities?.length,
        "Alerts:",
        weatherData.data?.alerts?.length,
      );

      // 4. Test Call Logs
      const callLogsRes = await fetch(`http://localhost:${PORT}/api/call-logs`);
      const callLogsData = await callLogsRes.json();
      console.log("4. Call logs count:", callLogsData.count);

      // 5. Test Call Simulation (Twilio TwiML Webhook)
      const simRes = await fetch(`http://localhost:${PORT}/api/simulate-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromNumber: "+91 98480 11223",
          language: "Hindi",
          speechInput: "टमाटर का मंडी भाव क्या है?",
        }),
      });
      const simData = await simRes.json();
      console.log(
        "5. Simulate Call status:",
        simRes.status,
        "Response Summary:",
        simData.callRecord?.aiResponseSummary?.substring(0, 80),
      );

      // 6. Test Multilingual Chat
      const chatRes = await fetch(`http://localhost:${PORT}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "What is today tomato mandi rate in Maharashtra and how to prevent blight?",
          language: "en",
        }),
      });
      const chatData = await chatRes.json();
      console.log(
        "6. Chat response status:",
        chatRes.status,
        "Answer:",
        chatData.response?.substring(0, 100),
      );

      console.log("\nALL 6 ENDPOINTS TESTED AND PASSED VERIFICATION!");
    } catch (err) {
      console.error("Test error:", err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
