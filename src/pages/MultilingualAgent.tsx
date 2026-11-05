import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  User, 
  Globe2, 
  CheckCircle2, 
  Database,
  HelpCircle,
  Mic,
  RotateCcw
} from 'lucide-react';
import type { SupportedLanguageCode, RegionalLanguage, ChatMessage } from '../types/agent.js';

const REGIONAL_LANGUAGES: RegionalLanguage[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', sampleQuery: 'टमाटर का मंडी भाव क्या चल रहा है और पत्ती के धब्बों का इलाज क्या है?' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', sampleQuery: 'వరి పంటలో ఆకు ఎండు తెగులు నివారణ మరియు ప్రస్తుత మార్కెట్ ధరలు చెప్పండి.' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', speechCodeAlt: 'ta-IN', sampleQuery: 'தக்காளி இலை கருகல் நோய் தடுப்பு முறைகள் மற்றும் மண்டி விலை என்ன?' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', sampleQuery: 'लासलगाव मार्केटमध्ये कांद्याचा आजचा भाव आणि फवारणी मार्गदर्शन सांगा.' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', sampleQuery: 'ਕਣਕ ਦੀ ਫਸਲ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ ਦੀ ਰੋਕਥਾਮ ਅਤੇ ਅੱਜ ਦਾ ਮੰਡੀ ਰੇਟ ਕੀ ਹੈ?' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', sampleQuery: 'ಟೊಮೆಟೊ ಬೆಳೆಯ ರೋಗ ನಿಯಂತ್ರಣ ಮತ್ತು ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ತಿಳಿಸಿ.' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', sampleQuery: 'ধানের ব্লাস্ট রোগ প্রতিরোধ ও আজকের মান্ডি বাজার দর কত?' },
  { code: 'en', name: 'English', nativeName: 'English / Hinglish', speechCode: 'en-IN', sampleQuery: 'How much extra profit if I sell 50 quintals of wheat directly, and what fungicide for blight?' },
] as any[];

export const MultilingualAgent: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguageCode>('hi');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'नमस्ते किसान भाई! मैं आपका रैतुमित्र (RythuMitra) सलाहकार हूँ। आप मुझसे अपनी क्षेत्रीय भाषा या हिंग्लिश में फसल रोग, मंडी भाव, और मौसम की सलाह ले सकते हैं। नीचे अपना सवाल पूछें।',
      language: 'hi',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const activeLangObj = REGIONAL_LANGUAGES.find(l => l.code === selectedLang) || REGIONAL_LANGUAGES[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLanguageSwitch = (code: SupportedLanguageCode) => {
    setSelectedLang(code);
    const lang = REGIONAL_LANGUAGES.find(l => l.code === code);
    if (!lang) return;

    let greeting = 'Hello! I am RythuMitra AI Agronomist. Ask me about mandi prices, weather alerts, or crop treatments.';
    if (code === 'hi') greeting = 'नमस्ते किसान भाई! मैं रैतुमित्र (RythuMitra) सलाहकार हूँ। मंडी भाव या फसल रोग के बारे में पूछें।';
    if (code === 'te') greeting = 'నమస్కారం రైతు సోదరా! నేను మీ రైతుమిత్ర (RythuMitra) AI సలహాదారుని. పంట తెగుళ్లు మరియు మార్కెట్ ధరల గురించి అడగండి.';
    if (code === 'ta') greeting = 'வணக்கம் விவசாய நண்பரே! நான் உங்கள் ரைத்துமித்ரா (RythuMitra) AI ஆலோசகர். உங்கள் கேள்விகளைக் கேளுங்கள்.';
    if (code === 'mr') greeting = 'नमस्कार शेतकरी बंधूंनो! मी आपला रैतुमित्र (RythuMitra) सल्लागार आहे. मंडी भाव आणि पिकांचे रोग याविषयी विचारा.';
    if (code === 'pa') greeting = 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਰੈਤੂਮਿੱਤਰਾ (RythuMitra) ਸਲਾਹਕਾਰ ਹਾਂ। ਆਪਣੀ ਫਸਲ ਜਾਂ ਮੰਡੀ ਰੇਟ ਬਾਰੇ ਪੁੱਛੋ।';
    if (code === 'kn') greeting = 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು ನಿಮ್ಮ ರೈತುಮಿತ್ರ (RythuMitra) ಕೃಷಿ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.';
    if (code === 'bn') greeting = 'নমস্কার কৃষক ভাই! আমি আপনার রাইতুমিত্র (RythuMitra) পরামর্শদাতা। আপনার ফসলের যেকোনো প্রশ্ন করুন।';

    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'system',
        content: `Language switched to ${lang.name} (${lang.nativeName}).`,
        language: code,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: greeting,
        language: code,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      language: selectedLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await axios.post('/api/chat', {
        message: text,
        language: selectedLang,
      });

      if (res.data?.success && res.data?.response) {
        const aiMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: res.data.response,
          language: selectedLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundedContext: {
            mandiRateSample: 'Real APMC Mandi modal benchmark included',
            microClimateAlert: 'Micro-climate fungal / moisture context injected'
          }
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(res.data?.error || 'Chat engine response error');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'सॉरी किसान भाई, नेटवर्क में रुकावट आई है। कृपया दोबारा पूछें।',
        language: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Web Speech API Voice synthesis
  const toggleSpeechPlayback = (message: ChatMessage) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(message.id);

    // Clean text for speech
    const cleanSpeech = message.content
      .replace(/[#*_`]/g, '')
      .replace(/[\n\r]+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = activeLangObj.speechCode || 'hi-IN';
    utterance.rate = 0.95;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(activeLangObj.speechCode.split('-')[0]));
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: `नमस्ते किसान भाई! चैट रीसेट हो गई है। आप अपनी क्षेत्रीय भाषा (${activeLangObj.name}) में कोई भी प्रश्न पूछ सकते हैं।`,
        language: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Multilingual Agronomist Agent
            </h1>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
              RAG Grounded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time advisory grounded in live Firestore Mandi rates, soil moisture, and weather alerts.
          </p>
        </div>

        {/* Reset Chat Button */}
        <button
          onClick={handleResetChat}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition w-fit"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Regional Language Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <div className="flex items-center space-x-1 text-xs text-slate-400 px-2 shrink-0">
          <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">Language:</span>
        </div>
        {REGIONAL_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSwitch(lang.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
              selectedLang === lang.code
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {lang.nativeName} ({lang.name})
          </button>
        ))}
      </div>

      {/* Grounding Context Status Bar */}
      <div className="glass-card rounded-2xl px-4 py-2 border border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Active Grounding: <span className="text-white font-medium">Firestore Mandi Rates + Micro-Climate Warnings</span></span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Gemini 3.5 Active</span>
        </div>
      </div>

      {/* Chat Messages Log Area */}
      <div className="glass-card rounded-3xl p-4 md:p-6 border border-slate-800 flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="text-[11px] bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          const isUser = msg.role === 'user';
          const isPlaying = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md ${
                  isUser
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-600/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs md:text-sm space-y-2 leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className={`flex items-center justify-between pt-1 text-[10px] ${isUser ? 'text-emerald-100' : 'text-slate-500'}`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => toggleSpeechPlayback(msg)}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg border transition ${
                        isPlaying
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title={isPlaying ? "Stop Voice Playback" : "Listen to Advisory"}
                    >
                      {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isPlaying ? 'Speaking...' : 'Listen Audio'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="glass-card px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Grounding query with live Mandi rates & formulating advisory...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Prompt */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs shrink-0 scrollbar-none">
        <span className="text-slate-500 shrink-0 font-medium">Quick prompt:</span>
        <button
          onClick={() => handleSendMessage(activeLangObj.sampleQuery)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 shrink-0 text-[11px] transition text-left"
        >
          💡 "{activeLangObj.sampleQuery.substring(0, 48)}..."
        </button>
      </div>

      {/* Input Bar */}
      <div className="glass-card rounded-2xl p-2 border border-slate-800 flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          placeholder={`Ask anything in ${activeLangObj.name} or code-switched text (e.g. Mandi rate, leaf disease remedy)...`}
          className="flex-1 bg-transparent px-3 py-2 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
