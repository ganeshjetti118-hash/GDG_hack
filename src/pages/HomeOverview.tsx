import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ScanLine, 
  TrendingUp, 
  CloudSun, 
  Bot, 
  PhoneCall, 
  AlertTriangle, 
  DollarSign, 
  Droplet, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { StatCard } from '../components/StatCard.js';
import { RiskBadge } from '../components/RiskBadge.js';
import type { AgriRiskAlert } from '../types/weather.js';
import type { MandiRecord } from '../types/market.js';

export const HomeOverview: React.FC = () => {
  const [alerts, setAlerts] = useState<AgriRiskAlert[]>([]);
  const [recentMandi, setRecentMandi] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [weatherRes, marketRes] = await Promise.all([
          axios.get('/api/weather').catch(() => ({ data: { data: { alerts: [] } } })),
          axios.get('/api/market').catch(() => ({ data: { data: { records: [] } } }))
        ]);

        if (weatherRes.data?.data?.alerts) {
          setAlerts(weatherRes.data.data.alerts.slice(0, 3));
        }
        if (marketRes.data?.data?.records) {
          setRecentMandi(marketRes.data.data.records.slice(0, 5));
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Precision Agriculture & Mandi Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Bridging Smallholder Farmers to <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Direct Markets</span> & <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">AI Diagnostics</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Eliminate predatory middleman margins, detect crop leaf pathogens in seconds with Gemini Multimodal Vision, and receive micro-climate advisories in 8 Indian regional languages via web & phone IVR.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/diagnostics"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
            >
              <ScanLine className="w-4 h-4" />
              <span>Diagnose Crop Leaf</span>
            </Link>
            <Link
              to="/market"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 transition"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Direct vs Middleman Calculator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Mandis"
          value="2,500+"
          subtitle="Real APMC price feeds updated"
          icon={DollarSign}
          trend={{ value: "+12.4% Vol", isPositive: true }}
          accentColor="emerald"
        />
        <StatCard
          title="Root-Zone Moisture"
          value="48.5%"
          subtitle="Avg topsoil (0-10cm) status: Optimal"
          icon={Droplet}
          trend={{ value: "Stable", isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Early Warning Alerts"
          value={alerts.length > 0 ? `${alerts.length} Active` : "2 Active"}
          subtitle="Fungal & Heatwave risks tracked"
          icon={AlertTriangle}
          trend={{ value: "High Alert", isPositive: false }}
          accentColor="amber"
        />
        <StatCard
          title="IVR Voice Sessions"
          value="184 Calls"
          subtitle="Handled in Hindi, Telugu, Tamil, Marathi"
          icon={PhoneCall}
          trend={{ value: "98.2% Resolution", isPositive: true }}
          accentColor="purple"
        />
      </div>

      {/* Live Warning Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">Active Micro-Climate Risk Advisories</h2>
            </div>
            <Link to="/weather" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1">
              <span>View all micro-climate stations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="glass-card rounded-2xl p-4 border border-amber-500/20 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <RiskBadge severity={alert.severity} size="sm" />
                    <span className="text-[11px] text-slate-400">{alert.location}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{alert.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{alert.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between font-medium">
                  <span>Crops: {alert.affectedCrops.slice(0, 3).join(', ')}</span>
                  <Link to="/weather" className="hover:underline flex items-center space-x-0.5">
                    <span>Advisory</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/market"
          className="glass-card glass-card-hover rounded-2xl p-6 border group block relative overflow-hidden"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-4 group-hover:scale-110 transition">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition">
            Direct vs. Middleman Calculator
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Compare what local brokers pay against official APMC Mandi rates and direct buyer contracts. Calculate your net profit gain per quintal.
          </p>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400">
            <span>Calculate now</span>
            <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to="/diagnostics"
          className="glass-card glass-card-hover rounded-2xl p-6 border group block relative overflow-hidden"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-4 group-hover:scale-110 transition">
            <ScanLine className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition">
            Gemini Multimodal Leaf Diagnostics
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Upload or snap a photo of diseased plant leaves. Gemini Vision identifies blight, blast, rust, and suggests immediate organic and chemical cures.
          </p>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
            <span>Scan leaf photo</span>
            <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to="/agent"
          className="glass-card glass-card-hover rounded-2xl p-6 border group block relative overflow-hidden"
        >
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-4 group-hover:scale-110 transition">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition">
            Multilingual Agronomist Agent
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Conversational AI grounded in real-time Mandi rates and micro-climates. Speaks Hindi, Telugu, Tamil, Marathi, Punjabi, Bengali with audio playback.
          </p>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-400">
            <span>Start voice/text chat</span>
            <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Real-time Mandi Rates Snapshot */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Live APMC Mandi Ticker Preview</h3>
            <p className="text-xs text-slate-400">Real-time spot prices per quintal from major Indian Mandis</p>
          </div>
          <Link
            to="/market"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Full Market Table ({recentMandi.length > 0 ? '2,500+ items' : 'Loading...'}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Commodity</th>
                <th className="py-3 px-3">Market / District</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3 text-right">Min Price</th>
                <th className="py-3 px-3 text-right">Max Price</th>
                <th className="py-3 px-3 text-right">Modal Price</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentMandi.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{item.commodity}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.variety})</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{item.market} <span className="text-xs text-slate-500">({item.district})</span></td>
                  <td className="py-3 px-3 text-slate-400">{item.state}</td>
                  <td className="py-3 px-3 text-right text-slate-400">₹{item.minPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-slate-400">₹{item.maxPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">₹{item.modalPrice.toLocaleString()}/Q</td>
                  <td className="py-3 px-3 text-center">
                    <Link
                      to={`/market?commodity=${encodeURIComponent(item.commodity)}`}
                      className="text-xs text-amber-400 hover:underline font-medium"
                    >
                      Compare Margin
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
