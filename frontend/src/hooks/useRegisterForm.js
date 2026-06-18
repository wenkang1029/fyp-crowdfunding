import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';

export const useRegisterForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('donor');
    const [orgName, setOrgName] = useState('');
    const [orgRegNumber, setOrgRegNumber] = useState('');
    const [orgDescription, setOrgDescription] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role,
            };

            if (role === 'ngo') {
                payload.org_name = orgName;
                payload.org_reg_number = orgRegNumber;
                payload.org_description = orgDescription;
            }

            const { user, token } = await registerUser(payload);

            if (!user || !token) {
                throw new Error('Invalid registration response.');
            }

            login(user, token);
            
            if (user.role === 'ngo') {
                navigate('/ngo/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            const message = err?.response?.data?.message || 'Registration failed. Please check inputs.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        name,
        email,
        password,
        passwordConfirmation,
        role,
        orgName,
        orgRegNumber,
        orgDescription,
        error,
        isLoading,
        setName,
        setEmail,
        setPassword,
        setPasswordConfirmation,
        setRole,
        setOrgName,
        setOrgRegNumber,
        setOrgDescription,
        handleRegister,
    };
};
