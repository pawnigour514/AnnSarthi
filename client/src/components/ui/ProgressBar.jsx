import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function ProgressBar({ value = 0, max = 100, color = 'bg-brand-600', height = 'h-2', label, showPercent = false }) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className="w-full space-y-1">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs text-content-secondary font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span>{percent}%</span>}
        </div>
      )}
      <div className={`w-full bg-surface-subtle border border-surface-border rounded-full overflow-hidden ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function Skeleton({ className = '', rounded = 'rounded-xl' }) {
  return (
    <div className={`animate-pulse bg-surface-muted ${rounded} ${className}`} />
  );
}

export function EmptyState({
  title = 'No items found',
  description = 'There are currently no records available in this view.',
  icon: Icon = Inbox,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-surface-border rounded-xl">
      <div className="p-3 rounded-2xl bg-brand-50 text-brand-700 mb-3 shadow-soft">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold font-heading text-content-primary">{title}</h4>
      <p className="text-xs sm:text-sm text-content-secondary max-w-sm mt-1">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-soft transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load data. Please check your connection and retry.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/40 border border-rose-200 rounded-xl">
      <AlertCircle className="w-8 h-8 text-risk-high mb-2" />
      <h4 className="text-sm font-bold font-heading text-rose-900">{title}</h4>
      <p className="text-xs text-rose-700 max-w-xs mt-0.5">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
