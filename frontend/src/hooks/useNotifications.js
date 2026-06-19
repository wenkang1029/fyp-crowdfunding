import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getNotifications();
            // In Laravel, the return structure is: { unread_count: X, notifications: [...] }
            // Let's support both array representation or standard objects.
            const list = Array.isArray(data.notifications) 
                ? data.notifications 
                : Object.values(data.notifications || {});
            
            setNotifications(list);
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markNotificationRead = async (id) => {
        // Optimistic UI update for instant feedback
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await markAsRead(id);
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            // Re-fetch to restore state if the API request failed
            fetchNotifications();
        }
    };

    const clearAllNotifications = async () => {
        // Optimistic UI update
        setNotifications([]);
        setUnreadCount(0);

        try {
            await markAllAsRead();
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
            fetchNotifications();
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead: markNotificationRead,
        markAllAsRead: clearAllNotifications,
    };
};
