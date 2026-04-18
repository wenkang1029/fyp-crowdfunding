import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

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
                // Fetch the user's profile from the backend
                const response = await axiosInstance.get('/user');
                setUser(response.data);
            } catch (error) {
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
            await axiosInstance.post('/logout');
        } catch (error) {
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

// Custom hook to easily use this context in any file (DRY)
export const useAuth = () => useContext(AuthContext);