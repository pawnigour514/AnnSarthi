import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-content-primary">
          {label} {required && <span className="text-risk-high">*</span>}
        </label>
      )}
      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-light">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          required={required}
          className={`w-full bg-white text-content-primary placeholder-content-light text-sm rounded-xl border ${
            error ? 'border-risk-high focus:border-risk-high' : 'border-surface-border focus:border-brand-600'
          } ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-risk-high">{error}</p>}
      {!error && helperText && <p className="text-xs text-content-secondary">{helperText}</p>}
    </div>
  );
}
