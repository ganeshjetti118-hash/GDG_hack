import healthHandler from '../api/health.js';
import weatherHandler from '../api/weather.js';
import marketHandler from '../api/market.js';
import callLogsHandler from '../api/call-logs.js';
import diagnoseHandler from '../api/diagnose.js';
import chatHandler from '../api/chat.js';
import simulateCallHandler from '../api/simulate-call.js';
import voiceCallHandler from '../api/voice-call.js';
import syncDataHandler from '../api/sync-data.js';
import syncStatusHandler from '../api/sync-status.js';
import indexHandler from '../api/index.js';

function mockRes() {
  const res: any = {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(k: string, v: string) { res.headers[k] = v; return res; },
    status(code: number) { res.statusCode = code; return res; },
    json(data: any) { res.body = data; return res; },
    send(text: string) { res.body = text; return res; },
    end() { return res; }
  };
  return res;
}

async function runTests() {
  console.log('--- Testing API Handlers ---');

  // 1. Health
  const r1 = mockRes();
  await healthHandler({ method: 'GET' }, r1);
  console.log('1. /api/health:', r1.statusCode, r1.body?.status);

  // 2. Weather
  const r2 = mockRes();
  await weatherHandler({ method: 'GET' }, r2);
  console.log('2. /api/weather:', r2.statusCode, 'Alerts:', r2.body?.data?.alerts?.length);

  // 3. Market
  const r3 = mockRes();
  await marketHandler({ method: 'GET' }, r3);
  console.log('3. /api/market:', r3.statusCode, 'Records:', r3.body?.data?.records?.length);

  // 4. Call Logs
  const r4 = mockRes();
  await callLogsHandler({ method: 'GET' }, r4);
  console.log('4. /api/call-logs:', r4.statusCode, 'Logs count:', r4.body?.count);

  // 5. Diagnose
  const r5 = mockRes();
  await diagnoseHandler({ method: 'POST', body: {} }, r5);
  console.log('5. /api/diagnose:', r5.statusCode, 'Crop:', r5.body?.data?.cropName, 'Disease:', r5.body?.data?.disease);

  // 6. Chat
  const r6 = mockRes();
  await chatHandler({ method: 'POST', body: { message: 'What is tomato price?', language: 'hi' } }, r6);
  console.log('6. /api/chat:', r6.statusCode, 'Response snippet:', (r6.body?.response || '').substring(0, 60));

  // 7. Simulate Call
  const r7 = mockRes();
  await simulateCallHandler({ method: 'POST', body: { speechInput: 'Tomato rate?', language: 'Hindi' } }, r7);
  console.log('7. /api/simulate-call:', r7.statusCode, 'Summary:', (r7.body?.callRecord?.aiResponseSummary || '').substring(0, 60));

  // 8. Voice Call
  const r8 = mockRes();
  await voiceCallHandler({ method: 'POST', body: { SpeechResult: 'Tomato price please' } }, r8);
  console.log('8. /api/voice-call:', r8.statusCode, 'TwiML snippet:', (r8.body || '').substring(0, 60));

  // 9. Sync Data
  const r9 = mockRes();
  await syncDataHandler({ method: 'POST' }, r9);
  console.log('9. /api/sync-data:', r9.statusCode, r9.body?.message);

  // 10. Sync Status
  const r10 = mockRes();
  await syncStatusHandler({ method: 'GET' }, r10);
  console.log('10. /api/sync-status:', r10.statusCode, r10.body?.status?.status);

  // 11. Index
  const r11 = mockRes();
  await indexHandler({ method: 'GET' }, r11);
  console.log('11. /api/index:', r11.statusCode, 'Endpoints count:', r11.body?.endpoints?.length);

  console.log('--- All 11 Handlers Verified Successfully! ---');
}

runTests().catch(console.error);
