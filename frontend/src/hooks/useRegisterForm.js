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
    const [mailingAddress, setMailingAddress] = useState('');
    
    // NGO Documents
    const [isTaxExempt, setIsTaxExempt] = useState(false);
    const [permitFile, setPermitFile] = useState(null);
    const [taxCertificateFile, setTaxCertificateFile] = useState(null);

    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setError('');
        setFieldErrors({});

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            setFieldErrors({ password_confirmation: ['Passwords do not match.'] });
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
                payload.append('mailing_address', mailingAddress);
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
            if (err?.response?.data?.errors) {
                const errors = err.response.data.errors;
                setFieldErrors(errors);

                // Auto-scroll to the first field with an error
                const fieldMapping = {
                    name: 'name',
                    email: 'email',
                    password: 'password',
                    org_name: 'org_name',
                    org_reg_number: 'org_reg_number',
                    org_description: 'org_description',
                    mailing_address: 'mailing_address',
                    permit_file: 'permit_file',
                    tax_exemption_file: 'tax_exemption_file'
                };

                setTimeout(() => {
                    for (const key of Object.keys(fieldMapping)) {
                        if (errors[key]) {
                            const element = document.getElementById(fieldMapping[key]);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                element.focus?.();
                                break;
                            }
                        }
                    }
                }, 100);
            }
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
        mailingAddress,
        isTaxExempt,
        permitFile,
        taxCertificateFile,
        error,
        fieldErrors,
        isLoading,
        setName,
        setEmail,
        setPassword,
        setPasswordConfirmation,
        setRole,
        setOrgName,
        setOrgRegNumber,
        setOrgDescription,
        setMailingAddress,
        setIsTaxExempt,
        setPermitFile,
        setTaxCertificateFile,
        handleRegister,
    };
};
