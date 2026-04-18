import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import axiosInstance from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth(); // NEW: Get the login function from our AuthContext
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setError('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/login', {
                email,
                password
            });

            const token = response.data.token;
            const userData = response.data.user;

            // Pass them to our centralized AuthContext
            login(userData, token);

            console.log('Login successful, routing based on role...');
            
            // NEW: Smart Redirect based on role!
            if (userData.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (userData.role === 'ngo') {
                navigate('/ngo/dashboard');
            } else {
                navigate('/');
            }

        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Invalid credentials or server error.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                
                {/* Logo / Header area */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-blue">AidWise</h1>
                    <p className="mt-2 text-gray-500">Welcome back. Please log in to your account.</p>
                </div>

                {/* The assembled Card component */}
                <Card>
                    <form onSubmit={handleLogin}>
                        
                        {/* Error Message Display */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Our reusable Input components */}
                        <Input 
                            label="Email Address" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="name@example.com"
                            required 
                        />
                        
                        <Input 
                            label="Password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required 
                        />

                        {/* Our reusable Button component */}
                        <Button 
                            type="submit" 
                            className="w-full mt-4" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>

                    </form>
                </Card>
                
            </div>
        </div>
    );
};

export default Login;