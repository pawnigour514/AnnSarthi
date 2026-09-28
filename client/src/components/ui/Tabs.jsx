import React from 'react';

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 border-b border-surface-border overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-brand-600 text-brand-800 bg-brand-50/50 rounded-t-xl'
                : 'border-transparent text-content-secondary hover:text-content-primary hover:border-surface-border'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-content-light'}`} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-surface-subtle text-content-secondary'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
