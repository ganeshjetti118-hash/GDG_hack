# 🌱 AgriBridge AI - Integrated Smart Agriculture Platform

AgriBridge AI is an enterprise-grade precision agriculture and market intelligence platform designed to empower smallholder Indian farmers. It eliminates predatory middleman margins, detects crop leaf diseases in seconds via Gemini Multimodal Vision, monitors micro-climates and root-zone soil moisture (0-10cm), and delivers real-time voice advisories in 8 Indian regional languages over both web chat and standard feature-phone telephone lines via Twilio Voice IVR.

---

## 🚀 Key Modules & Capabilities

### 1. 🏠 Home Overview (`/`)
- **Executive Agri-KPIs:** Real-time counts of monitored Mandis (2,500+), active pathogen risk warnings, root-zone soil moisture status, and resolved phone IVR calls.
- **Active Advisory Banners:** Dynamic alerts for high fungal risk and heatwave stress with direct actionable advice.
- **Live Mandi Ticker Preview:** Spot rates per quintal from major APMC Mandis across Indian states.
- **Quick Action Launchers:** 1-click access to Leaf Diagnostics, Profit Calculator, and Multilingual Voice Advisor.

### 2. 🌦️ Weather & Micro-Climate Early Warning (`/weather`)
- **Regional Station Switcher:** Micro-climate stations across Maharashtra, Telangana, Karnataka, Tamil Nadu, Uttar Pradesh, Rajasthan, Gujarat, Madhya Pradesh, West Bengal, and Delhi.
- **Micro-Climate Telemetry:** Temperature (Max/Min/Avg), Relative Humidity, 24h Precipitation, Wind Speed, Atmospheric Pressure, Cloud Cover, and AQI.
- **Soil Moisture Gauge (0-10cm Root Zone):** Physical infiltration model tracking root-zone saturation with automated irrigation recommendations (Optimal, Waterlogged, or Moisture Deficit).
- **7-Day Predictive Forecast Cards:** Daily high/low curves, rain probability, and anticipated soil moisture.
- **Predictive Agronomic Risk Warnings:** Automated trigger thresholds for Fungal Blast Risk, Heatwave/Transpiration Deficit, Waterlogging Alert, and Drought Stress.

### 3. 📈 Live Mandi Ticker & Direct vs. Middleman Profit Calculator (`/market`)
- **Searchable Real-Time Mandi Table:** Filter and sort 2,500+ verified spot rates by Commodity, State, Market, or Modal Price.
- **Daily Price Trend Curves:** Interactive Recharts visualizer charting Min, Max, and Modal price trajectories over time.
- **Interactive Direct vs. Middleman Profit Calculator:**
  - Dynamic sliders for harvest quantity (Quintals), broker deduction cut (10% to 45%), direct buyer premium (0% to 15%), and freight/bagging logistics.
  - Automatically calculates net pocket gain in ₹ and percentage profit increase when selling direct via AgriBridge.

### 4. 🔬 Gemini Multimodal Crop Diagnostics (`/diagnostics`)
- **Drag-and-Drop Leaf Specimen Zone:** Upload or drop leaf photos (JPG, PNG, WEBP).
- **1-Click Specimen Presets:** Curated sample leaves (Tomato Early Blight, Rice Blast, Cotton Leaf Curl Virus, and Healthy Leaf) for instant zero-upload testing.
- **AI Pathogen Diagnostic Engine:** Powered by Google GenAI (`gemini-3.5-flash`), returning structured JSON:
  - Crop Name & Identified Pathogen (e.g. *Alternaria solani*)
  - Confidence Score (%) & Severity Gauge (0-100)
  - Observable Symptoms Checklist
  - Dual Treatment Matrix: **Organic / Bio-Control Remedies** vs. **Chemical / Systemic Fungicides**
  - Preventive Cultural & Irrigation Practices
  - Recovery Prognosis & Yield Preservation Timeline.

### 5. 🤖 Multilingual Agronomist Agent (`/agent`)
- **8 Indian Regional Languages:** Hindi (हिन्दी), Telugu (తెలుగు), Tamil (தமிழ்), Marathi (मराठी), Punjabi (ਪੰਜਾਬੀ), Kannada (ಕನ್ನಡ), Bengali (বাংলা), and English / Hinglish.
- **Code-Switched Text Understanding:** Seamlessly handles natural mixed queries (e.g. *"Khet me tamatar me peela daag aa raha hai, mandi bhav kya chal raha hai?"*).
- **Web Speech API Audio Playback:** Listen to the AI's advice in regional voice synthesis with one click.
- **RAG Context Grounding:** Queries are dynamically grounded in live Firestore Mandi rates and micro-climate advisories.

### 6. 📞 Telephony IVR Voice Webhook & Call Logs (`/call-logs`)
- **Twilio TwiML Webhook (`/api/voice-call`):** Fully compliant `<Response><Say voice="Polly.Aditi">...</Say><Gather .../></Response>` endpoint for feature-phone callers.
- **Live Call Records Table:** Monitoring caller numbers, call durations, language detected, transcribed speech, and advisory summary.
- **Interactive In-Browser Call Simulator:** Allows developers and evaluators to test the telephony webhook pipeline live in the browser with real audio playback without needing a physical phone!

### 7. 🔄 Real-Time Database Sync (Firebase Firestore)
- **6-Hour Scheduled Refresh Scheduler:** Background service updating Firestore collections `market_rates` and `weather_alerts` every 6 hours.
- **Instant On-Demand Sync:** Accessible via the "Sync Now" button in the navigation bar or `POST /api/sync-data`.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS, Lucide Icons, Recharts
- **Backend / API:** Node.js, Express, Multer, Twilio TwiML Voice SDK
- **AI & Vision:** Google GenAI SDK (`@google/genai` & `@google/generative-ai`)
- **Database:** Firebase Firestore (`market_rates`, `weather_alerts`, `call_logs`)
- **Datasets:** Verified 55MB APMC Mandi agricultural pricing dataset (737k+ records) and Indian micro-climate dataset.

---

## ⚙️ Environment Configuration (`.env.local`)

```env
# Google AI Studio / Gemini API
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=290620471776
VITE_FIREBASE_APP_ID=1:290620471776:web:...

# Twilio Telephony Configuration
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
PORT=3000
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Prepare / Index Datasets
```bash
npx tsx scripts/prepare-data.ts
```

### 3. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser. The Vite server serves both the React application and mounts all `/api` endpoints simultaneously.

### 4. Run Standalone API Server
```bash
npm run server
```

---

## 🧪 Testing the API Suite

Run the automated endpoint test suite:
```bash
npx tsx scripts/test-api.ts
```
Verifies:
- `GET /api/health`
- `GET /api/market`
- `GET /api/weather`
- `GET /api/call-logs`
- `POST /api/simulate-call`
- `POST /api/chat`
