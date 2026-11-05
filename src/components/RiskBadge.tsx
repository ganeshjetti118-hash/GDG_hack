import React from 'react';
import type { RiskSeverity } from '../types/weather.js';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  severity: RiskSeverity;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ severity, size = 'md' }) => {
  const config = {
    critical: {
      label: 'Critical Alert',
      classes: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
      icon: ShieldAlert
    },
    high: {
      label: 'High Risk',
      classes: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: AlertTriangle
    },
    moderate: {
      label: 'Moderate Warning',
      classes: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
      icon: AlertCircle
    },
    low: {
      label: 'Low / Advisory',
      classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: Info
    }
  };

  const current = config[severity] || config.low;
  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center space-x-1.5 font-medium rounded-full border ${current.classes} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
};
