import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Award,
  TrendingUp,
  MapPin,
  Truck,
  Layers,
  HeartHandshake,
  ShieldAlert,
  Sliders,
  FileText,
  BarChart3,
  LogOut,
  Sparkles,
  Search,
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role || 'DONOR';

  const menuItems = {
    DONOR: [
      { label: 'Overview', to: '/donor', icon: LayoutDashboard },
      { label: 'Create Donation', to: '/donor/create', icon: PlusCircle, badge: 'New' },
      { label: 'My Donations', to: '/donor/donations', icon: Package },
      { label: 'Trust Profile', to: '/donor/trust', icon: Award },
      { label: 'Surplus Forecast', to: '/donor/forecast', icon: TrendingUp },
    ],
    DELIVERY_PARTNER: [
      { label: 'Overview', to: '/delivery', icon: LayoutDashboard },
      { label: 'Available Pickups', to: '/delivery/requests', icon: Layers },
      { label: 'Active Delivery', to: '/delivery/active', icon: Truck, highlight: true },
      { label: 'Route Optimizer', to: '/delivery/route', icon: MapPin },
    ],
    RECEIVER: [
      { label: 'Overview', to: '/receiver', icon: LayoutDashboard },
      { label: 'Available Food', to: '/receiver/available', icon: Search, badge: 'Live' },
      { label: 'Post Requirement', to: '/receiver/requirement', icon: PlusCircle },
      { label: 'Incoming Deliveries', to: '/receiver/incoming', icon: Truck },
      { label: 'Demand Insights', to: '/receiver/insights', icon: TrendingUp },
    ],
    ADMIN: [
      { label: 'Admin Overview', to: '/admin', icon: LayoutDashboard },
      { label: 'Verification Center', to: '/admin/verifications', icon: HeartHandshake },
      { label: 'Food Safety Reviews', to: '/admin/safety-reviews', icon: ShieldAlert, highlight: true },
      { label: 'Fraud & Abuse', to: '/admin/fraud', icon: ShieldAlert },
      { label: 'Safety Rules Matrix', to: '/admin/rules', icon: Sliders },
      { label: 'Audit Log Trail', to: '/admin/audit', icon: FileText },
      { label: 'Impact Analytics', to: '/analytics', icon: BarChart3 },
    ],
  };

  const currentMenu = menuItems[role] || menuItems.DONOR;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-content-primary/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-border flex flex-col z-40 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="p-5 border-b border-surface-border flex items-center gap-3">
          <img src="/logo.svg" alt="AnnSarthi Logo" className="w-9 h-9" />
          <div className="text-left">
            <span className="font-extrabold text-lg font-heading text-brand-900 tracking-tight leading-none block">
              AnnSarthi
            </span>
            <span className="text-[10px] text-brand-700 font-semibold uppercase tracking-wider block mt-0.5">
              SIH26234
            </span>
          </div>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-5 py-3 bg-surface-subtle border-b border-surface-border flex items-center justify-between text-left">
          <div>
            <p className="text-[10px] uppercase font-bold text-content-light tracking-wider">Active Portal</p>
            <p className="text-xs font-bold text-brand-800 capitalize">
              {role.toLowerCase().replace('_', ' ')}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            Online
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/${role.toLowerCase()}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-900 border border-brand-200/80 shadow-soft'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                  } ${item.highlight ? 'ring-1 ring-amber-400/40' : ''}`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-brand-600 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-surface-border bg-surface-subtle/50 text-left">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-content-primary truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-content-light truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-content-light hover:text-risk-high hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
