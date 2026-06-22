import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { LogOut, LayoutDashboard, Compass, PlusCircle, User as UserIcon } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/'); 
    };

    // Smooth scroll helper for public pages
    const handleExploreClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById('campaigns-section');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 flex justify-between items-center">
                {/* Branding Logo */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-aidwise-blue text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform duration-200">
                            A
                        </span>
                        <span className="text-2xl font-black text-aidwise-text tracking-tight group-hover:text-aidwise-blue transition-colors duration-200">
                            Aid<span className="text-aidwise-blue">Wise</span>
                        </span>
                    </Link>

                    {/* Navigation Menu */}
                    <div className="hidden md:flex items-center gap-5 border-l border-gray-100 pl-6">
                        <Link 
                            to="/" 
                            onClick={handleExploreClick}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-aidwise-blue transition-colors"
                        >
                            <Compass size={16} />
                            Explore Campaigns
                        </Link>
                        {user?.role === 'ngo' && (
                            <Link 
                                to="/ngo/campaigns/create" 
                                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-aidwise-blue transition-colors animate-pulse"
                            >
                                <PlusCircle size={16} />
                                Create Campaign
                            </Link>
                        )}
                    </div>
                </div>
                
                {/* Right Action Panel */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3.5">
                            {/* User Account Capsule */}
                            <Link 
                                to="/profile" 
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all duration-200 group"
                                title="Edit Profile settings"
                            >
                                <Avatar name={user.name} className="h-7 w-7 text-xs shadow-sm" />
                                <div className="hidden sm:flex flex-col text-left">
                                    <span className="text-xs font-bold text-aidwise-text leading-none group-hover:text-aidwise-blue transition-colors">{user.name}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none mt-1">{user.role}</span>
                                </div>
                            </Link>

                            {/* Dashboard Shortcut */}
                            <Link 
                                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard'} 
                                className="flex items-center gap-1.5 px-4 py-2 bg-aidwise-blue/5 text-aidwise-blue text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-aidwise-blue hover:text-white transition-all duration-200 border border-aidwise-blue/10 shadow-sm"
                            >
                                <LayoutDashboard size={14} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>

                            <NotificationDropdown />

                            {/* Sign Out Button */}
                            <button 
                                onClick={handleLogout}
                                className="flex items-center justify-center w-8.5 h-8.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 border border-gray-100 rounded-xl transition-all duration-200"
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/login" 
                                className="text-xs font-extrabold uppercase tracking-wider text-gray-500 hover:text-aidwise-blue px-4 py-2.5 transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/register" 
                                className="text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 bg-aidwise-blue text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;