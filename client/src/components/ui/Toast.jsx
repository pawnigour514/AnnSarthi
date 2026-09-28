import React from 'react';
import { useDemoStore } from '../../store/demoStore';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useDemoStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90',
    warning: 'border-amber-200 bg-amber-50/90',
    error: 'border-rose-200 bg-rose-50/90',
    info: 'border-blue-200 bg-blue-50/90',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-elevated border backdrop-blur-md transition-all ${
            borders[toast.type] || borders.info
          }`}
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1 text-left min-w-0">
            {toast.title && (
              <h5 className="text-xs font-bold text-content-primary font-heading">
                {toast.title}
              </h5>
            )}
            <p className="text-xs text-content-secondary mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-content-light hover:text-content-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
