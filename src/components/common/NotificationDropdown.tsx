import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { useStore } from "../../lib/store";

export const NotificationDropdown: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { notifications, currentUser, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifications = notifications.filter((n) => {
    if (!currentUser) return true;
    return n.user_id === currentUser.id || currentUser.role === "placement_admin";
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />;
      case "alert":
        return <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />;
      default:
        return <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cbBorder bg-white p-2 text-slate-600 shadow-sm transition hover:bg-[#F5F3FF] hover:text-deepIndigo dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-cbBorder bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-cbBorder dark:border-slate-800 px-4 py-3 bg-[#F5F3FF]/80 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#172033] dark:text-slate-300">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#D8EAFB] border border-blue-200/60 px-2 py-0.5 text-[10px] font-extrabold text-blue-900 dark:bg-blue-900/60 dark:text-blue-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1 text-[11px] font-extrabold text-deepIndigo hover:text-electricIndigo dark:text-indigo-400 transition"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-cbBorder dark:divide-slate-800">
            {userNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No notifications right now.
              </div>
            ) : (
              userNotifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.link && onNavigate) {
                      onNavigate(n.link);
                      setOpen(false);
                    }
                  }}
                  className={`flex gap-3 p-3.5 text-left text-xs transition cursor-pointer hover:bg-[#F5F3FF]/60 dark:hover:bg-slate-800/50 ${
                    !n.read ? "bg-[#F5F3FF]/40 dark:bg-indigo-950/20" : ""
                  }`}
                >
                  {getIcon(n.type)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-bold truncate ${!n.read ? "text-[#172033] dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                        {new Date(n.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-cbBorder dark:border-slate-800 bg-[#F5F3FF]/50 dark:bg-slate-800/40 px-4 py-2 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
            CampusBridge Live Activity System
          </div>
        </div>
      )}
    </div>
  );
};
