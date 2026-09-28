import React from 'react';

export function Card({ children, className = '', hoverable = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-surface-border rounded-xl shadow-soft p-5 transition-all duration-150 ${
        hoverable ? 'hover:shadow-card hover:border-brand-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  unit,
  icon: Icon,
  trend,
  trendPositive = true,
  className = '',
  highlight = false,
}) {
  return (
    <div
      className={`bg-white border ${
        highlight ? 'border-brand-500 ring-1 ring-brand-500/20' : 'border-surface-border'
      } rounded-xl p-5 shadow-soft transition-all duration-200 hover:shadow-card`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-bold font-heading text-brand-900 tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-content-secondary">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold flex items-center ${
                trendPositive ? 'text-brand-600' : 'text-risk-high'
              }`}
            >
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
          {subtitle && <span className="text-content-secondary">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
