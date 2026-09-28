import React from 'react';
import { Menu, Sparkles, UserCheck, Bot } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDemoStore } from '../../store/demoStore';
import { NotificationBell } from './NotificationBell';

export function Topbar({ onMenuClick, onAssistantToggle }) {
  const { user, demoLogin } = useAuthStore();
  const { startWalkthrough } = useDemoStore();

  const handleQuickSwitch = async (e) => {
    const targetRole = e.target.value;
    if (targetRole && targetRole !== user?.role) {
      await demoLogin(targetRole);
      // reload route according to role
      const routeMap = {
        DONOR: '/donor',
        DELIVERY_PARTNER: '/delivery',
        RECEIVER: '/receiver',
        ADMIN: '/admin',
      };
      window.location.href = routeMap[targetRole] || '/donor';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-surface-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Tagline */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-subtle lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="hidden sm:inline-block text-xs font-semibold text-content-secondary">
          🌱 Turn Surplus Food Into Shared Impact
        </span>
      </div>

      {/* Right: Quick Role Switcher, Judge Guide, Assistant & Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Role Switcher (Demo Feature) */}
        <div className="hidden md:flex items-center gap-1.5 bg-surface-subtle border border-surface-border rounded-xl px-2.5 py-1">
          <UserCheck className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-[11px] font-bold text-content-secondary">Demo Switch:</span>
          <select
            value={user?.role || 'DONOR'}
            onChange={handleQuickSwitch}
            className="bg-transparent text-xs font-bold text-brand-900 focus:outline-none cursor-pointer"
          >
            <option value="DONOR">Donor</option>
            <option value="RECEIVER">NGO / Receiver</option>
            <option value="DELIVERY_PARTNER">Delivery Partner</option>
            <option value="ADMIN">Admin / Reviewer</option>
          </select>
        </div>

        {/* Guided Judge Walkthrough Trigger */}
        <button
          type="button"
          onClick={startWalkthrough}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition-all shadow-soft"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Judge Walkthrough</span>
        </button>

        {/* AI Assistant Chat Trigger */}
        <button
          type="button"
          onClick={onAssistantToggle}
          className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-soft transition-all"
          title="Open AI Assistant"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <NotificationBell />
      </div>
    </header>
  );
}
