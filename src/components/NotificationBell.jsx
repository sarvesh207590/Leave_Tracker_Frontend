import { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationsRead } from '../services/managerService';

/**
 * NotificationBell
 * Shows a bell icon with an unread count badge.
 * Clicking opens a dropdown with the notification list.
 * Marks all as read when the dropdown is opened.
 */
const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data.notifications);
        } catch {
            // Silently fail — bell is non-critical
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpen = async () => {
        setOpen((prev) => !prev);
        // Mark all as read when opening
        if (!open && unreadCount > 0) {
            try {
                await markNotificationsRead();
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            } catch {
                // Silently fail
            }
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-full text-blue-100 hover:bg-blue-700 transition-colors"
                aria-label="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-w-[calc(100vw-2rem)]">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">Notifications</p>
                        {notifications.length > 0 && (
                            <span className="text-xs text-gray-400">{notifications.length} total</span>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-2xl mb-1">🔔</p>
                                <p className="text-xs">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n, i) => (
                                <div
                                    key={i}
                                    className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50' : ''}`}
                                >
                                    <p className="text-sm text-gray-700">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.createdAt)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
