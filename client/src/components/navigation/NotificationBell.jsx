import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-subtle border border-surface-border transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-surface-border rounded-2xl shadow-elevated z-50 overflow-hidden">
          <div className="p-3.5 border-b border-surface-border flex items-center justify-between bg-surface-subtle/50">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-900 font-heading">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-brand-700 hover:text-brand-800 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-content-secondary">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3 text-left transition-colors hover:bg-surface-subtle/60 ${
                    !item.read ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-content-primary">{item.title}</h5>
                    <span className="text-[10px] text-content-light whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary mt-0.5 leading-snug">{item.message}</p>
                  {item.link && (
                    <Link
                      to={item.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline mt-1.5"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
