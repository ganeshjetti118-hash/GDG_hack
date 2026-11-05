export interface CallLogRecord {
  id: string;
  callSid: string;
  fromNumber: string;
  toNumber: string;
  durationSeconds: number;
  language: string;
  status: string;
  speechTranscript: string;
  aiResponseSummary: string;
  fullResponseTwiml?: string;
  timestamp: string;
  confidenceScore?: number;
}

export const callLogsStore: CallLogRecord[] = [
  {
    id: 'call-101',
    callSid: 'CA98a72f091c3491ba681289fe81240a',
    fromNumber: '+91 98480 22334',
    toNumber: '+91 80000 12345',
    durationSeconds: 48,
    language: 'Hindi',
    status: 'completed',
    speechTranscript: 'नमस्ते, मेरे खेत में टमाटर के पत्तों पर गोल भूरे धब्बे पड़ रहे हैं। क्या उपाय करें?',
    aiResponseSummary: 'Advised early blight protocol: spray Trichoderma viride @ 5g/L or Mancozeb 75% WP @ 2.5g/L; ensure drainage.',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    confidenceScore: 0.94
  },
  {
    id: 'call-102',
    callSid: 'CA71b23e89a4511ba9081239fe1290b',
    fromNumber: '+91 94401 55667',
    toNumber: '+91 80000 12345',
    durationSeconds: 32,
    language: 'Telugu',
    status: 'completed',
    speechTranscript: 'వరి పంటలో ఆకులపై మచ్చలు వస్తున్నాయి, నివారణ చెప్పండి?',
    aiResponseSummary: 'Advised paddy blast management: spray Tricyclazole 75% WP @ 0.6g/L; avoid excess urea.',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    confidenceScore: 0.91
  },
  {
    id: 'call-103',
    callSid: 'CA45c67d12f8901aa7891238ea9810c',
    fromNumber: '+91 98220 88991',
    toNumber: '+91 80000 12345',
    durationSeconds: 27,
    language: 'Marathi',
    status: 'completed',
    speechTranscript: 'लासलगाव मार्केटमध्ये कांद्याचा आजचा भाव काय आहे?',
    aiResponseSummary: 'Provided Lasalgaon onion modal price: ₹1,120/Quintal; direct buyer offering ₹1,350/Q.',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    confidenceScore: 0.96
  }
];

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    if (body) {
      const newRecord: CallLogRecord = {
        id: `call-${Date.now()}`,
        callSid: body.callSid || `CALL-${Date.now().toString(36)}`,
        fromNumber: body.fromNumber || '+91 98000 00000',
        toNumber: body.toNumber || '+91 80000 12345',
        durationSeconds: body.durationSeconds || 30,
        language: body.language || 'English',
        status: body.status || 'completed',
        speechTranscript: body.speechTranscript || '(Recorded query)',
        aiResponseSummary: body.aiResponseSummary || 'Query addressed via RythuMitra voice system.',
        fullResponseTwiml: body.fullResponseTwiml,
        timestamp: new Date().toISOString(),
        confidenceScore: body.confidenceScore || 0.95
      };
      callLogsStore.unshift(newRecord);
      return res.status(200).json({ success: true, record: newRecord });
    }
  }

  return res.status(200).json({ success: true, count: callLogsStore.length, logs: callLogsStore });
}
