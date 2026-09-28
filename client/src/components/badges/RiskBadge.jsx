import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export function RiskBadge({ riskLevel, score, showMethod = false, method = 'rule-based', size = 'md' }) {
  const level = (riskLevel || 'UNSCREENED').toUpperCase();

  const configs = {
    LOW: {
      label: 'Low Risk',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    MEDIUM: {
      label: 'Medium Risk',
      icon: AlertTriangle,
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600',
    },
    HIGH: {
      label: 'High Risk (Held)',
      icon: AlertOctagon,
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      iconColor: 'text-rose-600',
    },
    UNSCREENED: {
      label: 'Unscreened',
      icon: HelpCircle,
      bg: 'bg-gray-100 text-gray-700 border-gray-200',
      iconColor: 'text-gray-500',
    },
  };

  const current = configs[level] || configs.UNSCREENED;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-lg border ${current.bg} ${sizeClasses[size]}`}
      >
        <Icon className={`w-3.5 h-3.5 ${current.iconColor}`} />
        <span>{current.label}</span>
        {score !== undefined && score !== null && (
          <span className="opacity-75 font-normal">({Math.round(score)}/100)</span>
        )}
      </span>

      {showMethod && (
        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-surface-subtle text-content-secondary border border-surface-border">
          {method === 'ml' ? 'AI: ML Model' : 'AI: Rule Engine'}
        </span>
      )}
    </div>
  );
}
