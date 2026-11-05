export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'online',
    service: 'RythuMitra AI Engine',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/weather',
      '/api/market',
      '/api/call-logs',
      '/api/diagnose',
      '/api/chat',
      '/api/simulate-call',
      '/api/voice-call',
      '/api/sync-data',
      '/api/sync-status'
    ]
  });
}
