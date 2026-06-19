import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { LogOut, LayoutDashboard } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/'); 
    };

    return (
        <nav className="bg-white border-b border-aidwise-border px-8 py-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Link to="/" className="text-2xl font-extrabold text-aidwise-blue tracking-tight hover:opacity-80 transition-opacity">
                    AidWise
                </Link>
            </div>
            
            <div>
                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 border-r border-gray-200 pr-4">
                            <Avatar name={user.name} className="h-8 w-8 text-xs" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-aidwise-text leading-tight">{user.name}</span>
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">{user.role}</span>
                            </div>
                        </div>

                        <Link 
                            to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard'} 
                            className="flex items-center gap-2 px-4 py-2 bg-aidwise-light text-aidwise-blue text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                        >
                            <LayoutDashboard size={16} />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>

                        <NotificationDropdown />

                        <button 
                            onClick={handleLogout}
                            className="flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-semibold px-6 py-2.5 bg-aidwise-blue text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                            Sign In
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;