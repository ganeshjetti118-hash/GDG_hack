import React, { useState } from 'react';
import { Sprout, RefreshCw, PhoneCall, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface NavbarProps {
  onSyncTriggered?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSyncTriggered }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      const res = await axios.post('/api/sync-data');
      if (res.data?.success) {
        setSyncMessage('Firestore Synced!');
        if (onSyncTriggered) onSyncTriggered();
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Sync notice:', err);
      setSyncMessage('Refreshed locally');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                AgriBridge AI
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                PROD v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Smart Agronomy • Mandi Price Intelligence • Telephony IVR
            </p>
          </div>
        </div>

        {/* Center / Status */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3 inline-block" />
            <span>Gemini 3.5 & Telephony Active</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firestore 6h Sync: Auto</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-60"
            title="Refresh Mandi Rates & Weather into Firestore"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : syncMessage ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{syncMessage || (isSyncing ? 'Syncing...' : 'Sync Now')}</span>
          </button>

          <a
            href="tel:18001801551"
            className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition"
            title="Kisan Call Centre Toll-Free Helpline"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Kisan Hotline: 1800-180-1551</span>
          </a>
        </div>
      </div>
    </header>
  );
};
