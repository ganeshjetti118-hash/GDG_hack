import { GoogleGenAI } from '@google/genai';
import { callLogsStore } from './call-logs.js';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    body = body || {};

    const fromNumber = body.fromNumber || '+91 98480 99887';
    const speechInput = (body.speechInput || '').trim() || 'What is the current tomato mandi price and early blight remedy?';
    const language = body.language || 'English';

    const langCodes: Record<string, { code: string; voice: string }> = {
      Hindi: { code: 'hi-IN', voice: 'Polly.Aditi' },
      Telugu: { code: 'te-IN', voice: 'Polly.Aditi' },
      Tamil: { code: 'ta-IN', voice: 'Polly.Aditi' },
      Marathi: { code: 'mr-IN', voice: 'Polly.Aditi' },
      English: { code: 'en-IN', voice: 'Polly.Raveena' }
    };

    const langConfig = langCodes[language] || { code: 'en-IN', voice: 'Polly.Raveena' };

    let aiAdvisory = '';

    if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are RythuMitra AI Voice Assistant speaking to an Indian farmer over a phone call.
Provide a concise, highly practical spoken advisory in 2 to 3 sentences answering their query.
Language: ${language}.
Farmer Question: ${speechInput}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        aiAdvisory = (response.text || '').replace(/[#*_`]/g, '').replace(/\n+/g, ' ').trim();
      } catch (e: any) {
        console.warn('Gemini telephony prompt notice:', e.message);
      }
    }

    if (!aiAdvisory) {
      if (language === 'Hindi') {
        aiAdvisory = 'नमस्ते किसान भाई! RythuMitra के अनुसार टमाटर का मंडी भाव ₹1,250 प्रति क्विंटल है। अगेती झुलसा रोग के लिए मैंकोजेब 75% WP का 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।';
      } else if (language === 'Telugu') {
        aiAdvisory = 'నమస్కారం రైతు సోదరా! RythuMitra ప్రకారం టమాటా మార్కెట్ ధర క్వింటాలుకు ₹1,250. ఆకుమచ్చ లేదా తెగులు నివారణకు ట్రైసైక్లాజోల్ లేదా మాంకోజెబ్ మందును లీటరు నీటికి 2.5 గ్రాములు కలిపి పిచికారీ చేయండి.';
      } else if (language === 'Marathi') {
        aiAdvisory = 'नमस्कार शेतकरी बंधू! RythuMitra नुसार कांद्याचा लासलगाव बाजारभाव ₹1,120 प्रति क्विंटल आहे. रोग नियंत्रणासाठी त्वरित ट्रायकोडर्मा किंवा कॉपर ऑक्सीक्लोराईडची फवारणी करा.';
      } else if (language === 'Tamil') {
        aiAdvisory = 'வணக்கம் விவசாயி நண்பரே! RythuMitra தகவலின்படி தக்காளி சந்தை விலை குவிண்டாலுக்கு ₹1,250. இலை கருகல் நோய்க்கு மாங்கோசெப் மருந்தை தெளிக்கவும்.';
      } else {
        aiAdvisory = 'Namaste Farmer! According to RythuMitra APMC Mandi, tomato modal price is ₹1,250 per quintal. For early blight, spray Mancozeb 75% WP @ 2.5g/L water.';
      }
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${langConfig.code}" voice="${langConfig.voice}">${aiAdvisory}</Say>
  <Gather input="speech" action="/api/voice-call" method="POST" timeout="5" language="${langConfig.code}">
    <Say language="${langConfig.code}" voice="${langConfig.voice}">Do you have any other questions?</Say>
  </Gather>
</Response>`;

    const callRecord = {
      id: `call-${Date.now()}`,
      callSid: `SIM-${Date.now().toString(36)}`,
      fromNumber,
      toNumber: '+91 80000 12345',
      durationSeconds: Math.floor(Math.random() * 25) + 30,
      language,
      status: 'completed',
      speechTranscript: speechInput,
      aiResponseSummary: aiAdvisory,
      fullResponseTwiml: twiml,
      timestamp: new Date().toISOString(),
      confidenceScore: 0.96
    };

    // Prepend to in-memory call logs store
    try {
      callLogsStore.unshift(callRecord);
    } catch (e) {}

    return res.status(200).json({ success: true, callRecord, twiml });
  } catch (err: any) {
    console.error('Call simulator error:', err);
    return res.status(500).json({ error: 'Call simulation failed', details: err.message });
  }
}
