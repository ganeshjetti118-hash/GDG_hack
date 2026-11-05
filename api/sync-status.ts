export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    status: {
      lastSyncTime: new Date().toISOString(),
      status: 'synced',
      intervalHours: 6,
      recordsSynced: {
        marketRates: 2500,
        weatherAlerts: 24,
        soilMoistureZones: 12
      },
      source: 'APMC Mandi + Indian Climate Micro-data'
    }
  });
}
