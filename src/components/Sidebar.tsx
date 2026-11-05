import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CloudSun, 
  TrendingUp, 
  ScanLine, 
  Bot, 
  PhoneCall, 
  Sparkles,
  Calculator
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      to: '/',
      label: 'Home Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/weather',
      label: 'Weather & Warnings',
      icon: CloudSun,
      badge: 'Live'
    },
    {
      to: '/market',
      label: 'Market & Profit Calc',
      icon: TrendingUp,
      badge: 'APMC'
    },
    {
      to: '/diagnostics',
      label: 'Crop Diagnostics',
      icon: ScanLine,
      badge: 'AI Vision'
    },
    {
      to: '/agent',
      label: 'Multilingual Agent',
      icon: Bot,
      badge: '8 Langs'
    },
    {
      to: '/call-logs',
      label: 'Telephony Call Logs',
      icon: PhoneCall,
      badge: 'IVR'
    }
  ];

  return (
    <aside className="w-full lg:w-64 glass-card border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Core Modules
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white/90">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Direct vs Middleman Quick Callout */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold">
          <Calculator className="w-4 h-4" />
          <span>Fair Farmer Income</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Cut out unnecessary broker deductions. Direct selling increases net farmer profit by 22-38%.
        </p>
        <NavLink
          to="/market"
          className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium text-[11px] pt-1"
        >
          <span>Calculate your crop margin</span>
          <span>→</span>
        </NavLink>
      </div>
    </aside>
  );
};
