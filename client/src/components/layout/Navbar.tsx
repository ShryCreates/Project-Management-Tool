import { useState } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

export default function Navbar() {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationStore();
  const [showNotifs, setShowNotifs] = useState(false);

  const handleToggle = () => {
    setShowNotifs((prev) => !prev);
    if (!showNotifs && unreadCount > 0) markAllRead();
  };

  return (
    <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-end px-6 shrink-0">
      <div className="relative">
        <button
          onClick={handleToggle}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="font-semibold text-white text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b border-slate-700 last:border-0 ${
                      !n.read ? 'bg-slate-700/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        n.type === 'task' ? 'bg-indigo-400' :
                        n.type === 'comment' ? 'bg-green-400' :
                        n.type === 'project' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200">{n.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
