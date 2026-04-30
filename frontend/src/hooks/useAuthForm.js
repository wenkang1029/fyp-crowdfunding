import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';

const getRedirectPathByRole = (role) => {
    if (role === 'admin') {
        return '/admin/dashboard';
    }

    if (role === 'ngo') {
        return '/ngo/dashboard';
    }

    return '/';
};

export const useAuthForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { user, token } = await loginUser({ email, password });

            if (!user || !token) {
                throw new Error('Invalid login response.');
            }

            login(user, token);
            navigate(getRedirectPathByRole(user.role));
        } catch (err) {
            const message = err?.response?.data?.message || 'Invalid credentials or server error.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email,
        password,
        error,
        isLoading,
        setEmail,
        setPassword,
        handleLogin,
    };
};
