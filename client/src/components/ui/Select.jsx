import React from 'react';

export function Select({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  required,
  children,
  ...props
}) {
  const selectId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-content-primary">
          {label} {required && <span className="text-risk-high">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`w-full bg-white text-content-primary text-sm rounded-xl border ${
          error ? 'border-risk-high focus:border-risk-high' : 'border-surface-border focus:border-brand-600'
        } px-3.5 py-2.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && <p className="text-xs font-medium text-risk-high">{error}</p>}
      {!error && helperText && <p className="text-xs text-content-secondary">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  required,
  rows = 3,
  ...props
}) {
  const textareaId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-content-primary">
          {label} {required && <span className="text-risk-high">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={`w-full bg-white text-content-primary placeholder-content-light text-sm rounded-xl border ${
          error ? 'border-risk-high focus:border-risk-high' : 'border-surface-border focus:border-brand-600'
        } px-3.5 py-2.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-surface-subtle disabled:cursor-not-allowed resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-risk-high">{error}</p>}
      {!error && helperText && <p className="text-xs text-content-secondary">{helperText}</p>}
    </div>
  );
}
