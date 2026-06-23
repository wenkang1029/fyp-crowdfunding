import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { LayoutDashboard, LogOut, ChevronLeft, ChevronRight, Megaphone, Wallet, User, Users } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';

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
        // FIX 1: Changed min-h-screen to h-screen and added overflow-hidden to lock the layout
        <div className="h-screen overflow-hidden bg-aidwise-light flex">
            
            <aside className={`${sidebarWidth} bg-white border-r border-aidwise-border flex flex-col shadow-sm transition-all duration-300 relative z-10`}>
                
                <div className={`p-6 flex ${isCollapsed ? 'flex-col items-center gap-6' : 'flex-row items-center justify-between'}`}>
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

                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-aidwise-blue transition-colors focus:outline-none shrink-0"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Notifications (Always visible outside scroll container to prevent overflow clipping) */}
                <div className="px-3 mb-2 shrink-0">
                    <NotificationDropdown isSidebar={true} isCollapsed={isCollapsed} />
                </div>
                
                {/* FIX 2: Added flex-1 to this nav so it pushes the bottom profile section down, but stays within the screen height */}
                <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto overflow-x-hidden">
                    <Link 
                        to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard'}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                            location.pathname.includes('/dashboard') 
                            ? 'bg-aidwise-blue text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                        }`}
                        title="Dashboard"
                    >
                        <LayoutDashboard size={20} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
                    </Link>
                    
                    {user?.role === 'admin' && (
                        <>
                            <Link 
                                to="/admin/campaigns" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                    location.pathname.startsWith('/admin/campaigns') 
                                    ? 'bg-aidwise-blue text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                                }`}
                                title="Campaigns"
                            >
                                <Megaphone size={20} className="shrink-0" />
                                {!isCollapsed && <span className="whitespace-nowrap">Campaigns</span>}
                            </Link>

                            <Link 
                                to="/admin/users" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                    location.pathname.startsWith('/admin/users') 
                                    ? 'bg-aidwise-blue text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                                }`}
                                title="Users"
                            >
                                <Users size={20} className="shrink-0" />
                                {!isCollapsed && <span className="whitespace-nowrap">Users</span>}
                            </Link>

                            <Link 
                                to="/admin/disbursements" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                    location.pathname.includes('/admin/disbursements') 
                                    ? 'bg-aidwise-blue text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                                }`}
                                title="Payout Requests"
                            >
                                <Wallet size={20} className="shrink-0" />
                                {!isCollapsed && <span className="whitespace-nowrap">Payout Requests</span>}
                            </Link>
                        </>
                    )}
                    
                    {user?.role === 'ngo' && (
                        <>
                            <Link 
                                to="/ngo/campaigns" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                    location.pathname.startsWith('/ngo/campaigns') 
                                    ? 'bg-aidwise-blue text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                                }`}
                                title="Campaign"
                            >
                                <Megaphone size={20} className="shrink-0" />
                                {!isCollapsed && <span className="whitespace-nowrap">Campaign</span>}
                            </Link>

                            {/* THE MISSING LINK WE ARE RESTORING! */}
                            <Link 
                                to="/ngo/disbursements" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                    location.pathname.includes('/disbursements') 
                                    ? 'bg-aidwise-blue text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                                }`}
                                title="Fund Management"
                            >
                                <Wallet size={20} className="shrink-0" />
                                {!isCollapsed && <span className="whitespace-nowrap">Fund Management</span>}
                            </Link>
                        </>
                    )}
                    
                    <Link 
                        to="/profile" 
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                            location.pathname === '/profile' 
                            ? 'bg-aidwise-blue text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-aidwise-text'
                        }`}
                        title="Profile Settings"
                    >
                        <User size={20} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Profile Settings</span>}
                    </Link>
                </nav>

                <div className="p-3 border-t border-aidwise-border bg-white mt-auto shrink-0">
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

            {/* FIX 3: Ensure the main container scrolls independently if content is long */}
            <main className="flex-1 p-8 overflow-y-auto transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;