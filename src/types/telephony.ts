export type CallStatus = 'completed' | 'in-progress' | 'failed' | 'queued';

export interface CallLogRecord {
  id: string;
  callSid: string;
  fromNumber: string;
  toNumber: string;
  durationSeconds: number;
  language: string;
  status: CallStatus;
  speechTranscript: string;
  aiResponseSummary: string;
  fullResponseTwiml?: string;
  timestamp: string;
  confidenceScore?: number;
}
