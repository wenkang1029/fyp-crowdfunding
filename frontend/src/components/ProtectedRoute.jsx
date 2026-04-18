import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// We now accept 'allowedRoles' as an optional prop
const ProtectedRoute = ({ children, allowedRoles }) => {
    // We fetch the 'user' and 'loading' state from our central brain!
    const { user, loading } = useAuth();
    const token = localStorage.getItem('aidwise_token');

    // 1. Wait for the AuthContext to finish checking the backend
    if (loading) {
        return null; // The AuthProvider already shows a loading spinner
    }

    // 2. Not logged in at all? Boot to login.
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Logged in, but wrong role? Boot to their appropriate home page.
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn(`Access Denied: ${user.role} attempted to access restricted route.`);
        
        // Smart Redirect based on role (HCI principle: don't just show a blank error)
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'ngo') return <Navigate to="/ngo/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    // 4. Everything matches! Let them in.
    return children;
};

export default ProtectedRoute;