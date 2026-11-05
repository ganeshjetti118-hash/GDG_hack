import twilio from 'twilio';
import { generateGroundedResponse } from './gemini-service.js';
import type { CallLogRecord } from '../src/types/telephony.js';

const VoiceResponse = twilio.twiml.VoiceResponse;

// In-memory call log storage with sample records
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

export interface TwilioVoicePayload {
  CallSid?: string;
  From?: string;
  To?: string;
  CallStatus?: string;
  SpeechResult?: string;
  Confidence?: string;
  Language?: string;
}

/**
 * Generates TwiML for incoming farmer calls or interactive voice simulation
 */
export async function handleVoiceWebhook(payload: TwilioVoicePayload, context?: {
  mandiContext?: string;
  weatherContext?: string;
}): Promise<{ twiml: string; callRecord: CallLogRecord }> {
  const twiml = new VoiceResponse();
  const callSid = payload.CallSid || `CALL-${Date.now().toString(36)}`;
  const fromNumber = payload.From || '+91 98000 00000';
  const toNumber = payload.To || '+91 80000 12345';
  const speechInput = payload.SpeechResult?.trim();

  let language = 'Hindi';
  let speechCode = 'hi-IN';
  let voice: any = 'Polly.Aditi';

  if (!speechInput) {
    // Farmer just dialed in: Greet and ask for speech input
    twiml.say(
      { voice, language: speechCode as any },
      'नमस्ते किसान भाई! एग्रीब्रिज एआई किसान हेल्पलाइन में आपका स्वागत है। अपनी फसल की समस्या या मंडी भाव के बारे में अपना सवाल पूछें।'
    );

    const gather = twiml.gather({
      input: ['speech'],
      action: '/api/voice-call',
      method: 'POST',
      timeout: 6,
      speechTimeout: 'auto',
      language: 'hi-IN'
    });

    gather.say(
      { voice, language: speechCode as any },
      'कृपया बीप के बाद बोलें।'
    );

    twiml.say(
      { voice, language: speechCode as any },
      'हमें आपकी आवाज सुनाई नहीं दी। कृपया दोबारा कॉल करें। धन्यवाद!'
    );

    const callRecord: CallLogRecord = {
      id: `call-${Date.now()}`,
      callSid,
      fromNumber,
      toNumber,
      durationSeconds: 15,
      language,
      status: 'in-progress',
      speechTranscript: '(Awaiting farmer speech input)',
      aiResponseSummary: 'Initial greeting delivered; awaiting caller question.',
      fullResponseTwiml: twiml.toString(),
      timestamp: new Date().toISOString(),
      confidenceScore: 1.0
    };

    callLogsStore.unshift(callRecord);
    return { twiml: twiml.toString(), callRecord };
  }

  // Farmer spoke a question!
  // Simple heuristic language detection from text
  if (/[ఀ-౿]/.test(speechInput)) {
    language = 'Telugu';
    speechCode = 'te-IN';
  } else if (/[஀-௿]/.test(speechInput)) {
    language = 'Tamil';
    speechCode = 'ta-IN';
  } else if (/[ऀ-ॿ]/.test(speechInput)) {
    language = 'Hindi';
    speechCode = 'hi-IN';
  } else {
    language = 'English / Hinglish';
    speechCode = 'en-IN';
  }

  const aiAdvisory = await generateGroundedResponse(
    speechInput,
    language === 'Telugu' ? 'te' : language === 'Hindi' ? 'hi' : 'en',
    {
      mandiContext: context?.mandiContext || 'Tomato modal price ₹1,250/Q, Wheat ₹2,300/Q, Onion ₹1,120/Q.',
      weatherContext: context?.weatherContext || 'High humidity warning in effect. Protect against early blight and rust.'
    }
  );

  // Clean advisory for voice speech (strip markdown characters)
  const spokenText = aiAdvisory
    .replace(/[#*_`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  twiml.say({ voice, language: speechCode as any }, spokenText);

  // Allow follow-up question
  const followUp = twiml.gather({
    input: ['speech'],
    action: '/api/voice-call',
    method: 'POST',
    timeout: 5,
    speechTimeout: 'auto',
    language: speechCode as any
  });
  followUp.say(
    { voice, language: speechCode as any },
    'क्या आप कुछ और पूछना चाहते हैं? कृपया बोलें।'
  );

  twiml.say(
    { voice, language: speechCode as any },
    'एग्रीब्रिज से जुड़ने के लिए धन्यवाद। आपकी फसल समृद्ध रहे!'
  );

  const callRecord: CallLogRecord = {
    id: `call-${Date.now()}`,
    callSid,
    fromNumber,
    toNumber,
    durationSeconds: Math.floor(Math.random() * 30) + 25,
    language,
    status: 'completed',
    speechTranscript: speechInput,
    aiResponseSummary: spokenText.length > 140 ? spokenText.substring(0, 140) + '...' : spokenText,
    fullResponseTwiml: twiml.toString(),
    timestamp: new Date().toISOString(),
    confidenceScore: payload.Confidence ? parseFloat(payload.Confidence) : 0.95
  };

  callLogsStore.unshift(callRecord);
  return { twiml: twiml.toString(), callRecord };
}
