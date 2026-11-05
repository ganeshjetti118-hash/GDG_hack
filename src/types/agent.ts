export type SupportedLanguageCode = 'en' | 'hi' | 'te' | 'ta' | 'mr' | 'pa' | 'kn' | 'bn';

export interface RegionalLanguage {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  speechCode: string; // for Web Speech API & Twilio Voice
  sampleQuery: string;
}

export interface GroundedContext {
  mandiRateSample?: string;
  microClimateAlert?: string;
  soilMoistureStatus?: string;
  cropDiseaseContext?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language: SupportedLanguageCode;
  groundedContext?: GroundedContext;
  audioPlaying?: boolean;
}
