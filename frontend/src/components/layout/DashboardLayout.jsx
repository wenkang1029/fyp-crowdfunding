import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { LayoutDashboard, LogOut, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-60';

    return (
        <div className="min-h-screen bg-aidwise-light flex">
            {/* Added overflow-x-hidden to prevent horizontal scrollbars during animation */}
            <aside className={`${sidebarWidth} bg-white border-r border-aidwise-border flex flex-col shadow-sm transition-all duration-300 relative z-10 overflow-x-hidden`}>
                
                {/* Header Section with Integrated Toggle Button */}
                <div className={`p-6 flex ${isCollapsed ? 'flex-col items-center gap-6' : 'flex-row items-center justify-between'}`}>
                    
                    {/* Logo/Text Area */}
                    <div>
                        {isCollapsed ? (
                            <h2 className="text-2xl font-bold text-aidwise-blue tracking-tight leading-none mt-2">AW</h2>
                        ) : (
                            <div>
                                <h2 className="text-3xl font-extrabold text-aidwise-blue tracking-tight whitespace-nowrap">AidWise</h2>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 whitespace-nowrap block">
                                    {user?.role} Portal
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Collapse Toggle Button (Safely inside the flex container) */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-aidwise-blue transition-colors focus:outline-none shrink-0"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    
                </div>
                
                <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto overflow-x-hidden">
                    <Link 
                        to={user?.role === 'admin' ? '/admin/dashboard' : '/ngo/dashboard'}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                            location.pathname.includes('/dashboard') // FIXED: This ensures the button stays blue!
                            ? 'bg-aidwise-blue text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                        }`}
                        title="Dashboard"
                    >
                        <LayoutDashboard size={20} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
                    </Link>

                    {/* Only show Campaigns link to NGOs */}
                    {user?.role === 'ngo' && (
                        <Link 
                            to="/ngo/campaigns/create" 
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                location.pathname.includes('/campaigns/create') 
                                ? 'bg-aidwise-blue text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                            }`}
                            title="Create Campaign"
                        >
                            <Megaphone size={20} className="shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap">Create Campaign</span>}
                        </Link>
                    )}
                </nav>

                <div className="p-3 border-t border-aidwise-border bg-white">
                    <div className={`flex items-center gap-3 px-2 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <Avatar name={user?.name} className="h-8 w-8 text-sm shrink-0" />
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-aidwise-text truncate leading-tight">
                                    {user?.name}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate leading-tight">
                                    {user?.email}
                                </p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors ${isCollapsed ? '' : 'justify-start'}`}
                        title="Sign Out"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;