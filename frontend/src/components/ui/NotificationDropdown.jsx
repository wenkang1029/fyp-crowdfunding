import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, CheckCircle, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

const NotificationDropdown = ({ isSidebar = false, isCollapsed = false }) => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Toggle dropdown and refresh unread items
    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // Auto-close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (notification) => {
        // Mark as read
        markAsRead(notification.id);
        setIsOpen(false);

        // Routing logic based on notification type
        const type = notification.data?.type;
        switch (type) {
            case 'campaign_approval':
            case 'campaign_goal_reached':
            case 'donation_received':
                navigate('/ngo/campaigns');
                break;
            case 'new_campaign_submitted':
            case 'new_ngo_registered':
                navigate('/admin/dashboard');
                break;
            case 'new_disbursement_request':
                navigate('/admin/disbursements');
                break;
            case 'disbursement_decided':
                navigate('/ngo/disbursements');
                break;
            case 'donation_success':
                navigate('/donor/dashboard');
                break;
            default:
                break;
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'campaign_approval':
                return (
                    <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl flex-shrink-0">
                        <CheckCircle size={16} />
                    </div>
                );
            case 'donation':
            case 'donation_success':
            case 'donation_received':
                return (
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl flex-shrink-0">
                        <Info size={16} />
                    </div>
                );
            default:
                return (
                    <div className="p-2 bg-gray-50 text-gray-400 rounded-xl flex-shrink-0">
                        <Bell size={16} />
                    </div>
                );
        }
    };

    // Responsive class logic for trigger button
    const buttonClass = isSidebar
        ? `${isOpen ? 'bg-blue-50 text-aidwise-blue border-aidwise-blue/10' : 'bg-aidwise-light text-aidwise-text hover:bg-blue-50'} border border-transparent w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl transition-all active:scale-95 focus:outline-none font-semibold text-sm`
        : `${isOpen ? 'bg-blue-50 text-aidwise-blue' : 'bg-aidwise-light text-aidwise-text hover:bg-blue-50'} relative flex items-center justify-center p-2.5 rounded-xl transition-all active:scale-95 focus:outline-none`;

    // Responsive class logic for dropdown positioning
    const dropdownClass = isSidebar
        ? "absolute left-full top-0 ml-2 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden transform origin-top-left transition-all"
        : "absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden transform origin-top-right transition-all";

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button onClick={handleToggle} className={buttonClass} aria-label="Notifications">
                <div className="relative p-0.5">
                    <Bell size={isSidebar ? 20 : 18} className="shrink-0" />
                    {unreadCount > 0 && (isCollapsed || !isSidebar) && (
                        <span className="absolute -top-1.5 -right-1.5 flex min-w-[15px] h-3.5 px-0.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white shadow-sm animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {isSidebar && !isCollapsed && (
                    <>
                        <span className="whitespace-nowrap flex-1 text-left">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ml-auto shrink-0 shadow-sm animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={dropdownClass}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-50">
                        <h4 className="text-sm font-extrabold text-aidwise-text tracking-tight">Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-[11px] font-bold text-aidwise-blue hover:opacity-85 transition-opacity"
                            >
                                <CheckCheck size={12} />
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Notification Scroll List */}
                    <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="flex items-start gap-3 p-4 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                >
                                    {getIcon(notification.data?.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-aidwise-text leading-tight mb-0.5">
                                            {notification.data?.title || 'Notification'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 leading-normal">
                                            {notification.data?.message}
                                        </p>
                                        <span className="text-[9px] font-semibold text-gray-400 mt-1 block">
                                            {formatRelativeTime(notification.created_at)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                        className="p-1 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:outline-none flex-shrink-0"
                                        title="Mark as read"
                                    >
                                        <Check size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl mb-2">
                                    <Bell size={24} className="opacity-60" />
                                </div>
                                <p className="text-xs font-bold text-aidwise-text">All caught up!</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">No unread notifications.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
