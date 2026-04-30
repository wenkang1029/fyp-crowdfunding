import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthenticatedUser, logoutUser } from '../services/authService';

// Create the context
const AuthContext = createContext();

// Create the Provider component that will wrap our app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Run this once when the app starts
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('aidwise_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await getAuthenticatedUser();
                setUser(userData);
            } catch {
                // If token is invalid/expired, clean it up (Security Principle)
                localStorage.removeItem('aidwise_token');
                setUser(null);
            } finally {
                setLoading(false); // Stop the loading spinner
            }
        };

        fetchUser();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('aidwise_token', token);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch {
            console.error("Server logout failed, clearing local session.");
        } finally {
            localStorage.removeItem('aidwise_token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* HCI: Prevent rendering protected routes until we know who the user is */}
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-aidwise-light text-aidwise-text">
                    <span className="animate-pulse font-medium">Validating session...</span>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);