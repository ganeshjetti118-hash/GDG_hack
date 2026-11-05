import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PhoneCall, 
  PhoneIncoming, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  Code, 
  Play, 
  RefreshCw, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  Globe
} from 'lucide-react';
import type { CallLogRecord, CallStatus } from '../types/telephony.js';

export const TelephonyLogs: React.FC = () => {
  const [logs, setLogs] = useState<CallLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTwiml, setSelectedTwiml] = useState<string | null>(null);

  // Simulation Form State
  const [simPhoneNumber, setSimPhoneNumber] = useState('+91 98480 99887');
  const [simLanguage, setSimLanguage] = useState('Hindi');
  const [simSpeechInput, setSimSpeechInput] = useState('मेरे खेत में टमाटर की पत्तियों पर भूरे धब्बे हैं, क्या दवा स्प्रे करें?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<CallLogRecord | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/call-logs');
      if (res.data?.success && res.data?.logs) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load call logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSimulateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simSpeechInput.trim() || isSimulating) return;

    try {
      setIsSimulating(true);
      const res = await axios.post('/api/simulate-call', {
        fromNumber: simPhoneNumber,
        language: simLanguage,
        speechInput: simSpeechInput
      });

      if (res.data?.success && res.data?.callRecord) {
        setSimResult(res.data.callRecord);
        // Prepend to logs
        setLogs(prev => [res.data.callRecord, ...prev]);

        // Speak audio simulation
        if ('speechSynthesis' in window) {
          const langMap: Record<string, string> = {
            Hindi: 'hi-IN',
            Telugu: 'te-IN',
            Tamil: 'ta-IN',
            Marathi: 'mr-IN',
            English: 'en-IN'
          };
          const speechCode = langMap[simLanguage] || 'hi-IN';
          const utterance = new SpeechSynthesisUtterance(res.data.callRecord.aiResponseSummary);
          utterance.lang = speechCode;
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error('Call simulation failed:', err);
      alert('Call simulation failed. Please ensure backend server is active.');
    } finally {
      setIsSimulating(false);
    }
  };

  const setPreset = (lang: string, speech: string) => {
    setSimLanguage(lang);
    setSimSpeechInput(speech);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Telephony IVR Call Logs & Voice Webhook
            </h1>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
              Twilio TwiML Live
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time monitoring of inbound feature-phone calls from farmers, voice transcripts, and regional speech responses.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          <span>Refresh Calls</span>
        </button>
      </div>

      {/* SECTION 1: Interactive Call Simulator Drawer */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <PhoneIncoming className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Simulate Inbound Farmer Phone Call (IVR Webhook Tester)
              </h2>
              <p className="text-xs text-slate-400">
                Test the `/api/voice-call` webhook live in the browser without needing a physical phone.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TwiML &lt;Response&gt; Validated</span>
          </div>
        </div>

        <form onSubmit={handleSimulateCall} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Farmer Phone Number:</label>
              <input
                type="text"
                value={simPhoneNumber}
                onChange={(e) => setSimPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Spoken Language:</label>
              <select
                value={simLanguage}
                onChange={(e) => setSimLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="English">English / Hinglish</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Quick Voice Presets:</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPreset('Hindi', 'टमाटर की पत्तियों पर काले धब्बे हैं, क्या दवा छिड़कें?')}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
                >
                  Hindi Tomato
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('Telugu', 'వరి పంటలో ఆకు ఎండు తెగులు నివారణ చెప్పండి?')}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
                >
                  Telugu Paddy
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('Marathi', 'लासलगाव मार्केटमध्ये कांद्याचा आजचा भाव काय आहे?')}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
                >
                  Marathi Onion
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Caller Voice Input (Transcribed Speech):</label>
            <textarea
              rows={2}
              value={simSpeechInput}
              onChange={(e) => setSimSpeechInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              placeholder="Enter what the farmer speaks into the feature-phone..."
            />
          </div>

          <button
            type="submit"
            disabled={isSimulating}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Twilio TwiML Webhook & Synthesizing Audio...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>Simulate Inbound Call & Hear Audio Response</span>
              </>
            )}
          </button>
        </form>

        {/* Live Simulation Audio Response Preview */}
        {simResult && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Telephony Spoken Output (Playing Audio in Browser):</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Call SID: {simResult.callSid}</span>
            </div>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans bg-purple-950/20 p-3 rounded-xl border border-purple-500/20">
              "{simResult.aiResponseSummary}"
            </p>
            {simResult.fullResponseTwiml && (
              <div className="pt-2">
                <button
                  onClick={() => setSelectedTwiml(simResult.fullResponseTwiml || '')}
                  className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 font-mono"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Inspect Generated TwiML XML</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Call Monitoring Log Table */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Inbound Call Records ({logs.length})
            </h2>
            <p className="text-xs text-slate-400">
              Live log stream of feature-phone IVR sessions across Indian states
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Call SID</th>
                <th className="py-3 px-3">Caller Number</th>
                <th className="py-3 px-3">Language</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Speech Transcript (Farmer)</th>
                <th className="py-3 px-3">AI Advisory Spoken</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">TwiML</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((call) => (
                <tr key={call.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">
                    {call.callSid.substring(0, 14)}...
                  </td>
                  <td className="py-3 px-3 font-semibold text-white text-xs">
                    {call.fromNumber}
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                      {call.language}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-400 font-mono">
                    {call.durationSeconds}s
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-200 max-w-xs truncate" title={call.speechTranscript}>
                    {call.speechTranscript}
                  </td>
                  <td className="py-3 px-3 text-xs text-emerald-300 max-w-sm truncate" title={call.aiResponseSummary}>
                    {call.aiResponseSummary}
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold text-[10px]">
                      {call.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedTwiml(call.fullResponseTwiml || `<Response><Say>${call.aiResponseSummary}</Say></Response>`)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="View TwiML XML"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TwiML XML Modal */}
      {selectedTwiml && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 border border-slate-700 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Generated Twilio TwiML Markup</h3>
              </div>
              <button
                onClick={() => setSelectedTwiml(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              {selectedTwiml}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
