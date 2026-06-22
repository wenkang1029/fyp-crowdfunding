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
    
    // NGO Documents
    const [isTaxExempt, setIsTaxExempt] = useState(false);
    const [permitFile, setPermitFile] = useState(null);
    const [taxCertificateFile, setTaxCertificateFile] = useState(null);

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
            const payload = new FormData();
            payload.append('name', name);
            payload.append('email', email);
            payload.append('password', password);
            payload.append('password_confirmation', passwordConfirmation);
            payload.append('role', role);

            if (role === 'ngo') {
                payload.append('org_name', orgName);
                payload.append('org_reg_number', orgRegNumber);
                payload.append('org_description', orgDescription);
                payload.append('is_tax_exempt', isTaxExempt ? '1' : '0');
                if (permitFile) {
                    payload.append('permit_file', permitFile);
                }
                if (isTaxExempt && taxCertificateFile) {
                    payload.append('tax_exemption_file', taxCertificateFile);
                }
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
        isTaxExempt,
        permitFile,
        taxCertificateFile,
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
        setIsTaxExempt,
        setPermitFile,
        setTaxCertificateFile,
        handleRegister,
    };
};
