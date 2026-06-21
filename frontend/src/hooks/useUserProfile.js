import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';

/**
 * Custom hook that owns all UserProfile state and logic.
 * The UserProfile page component is a pure presenter that calls this hook.
 */
export const useUserProfile = () => {
    const { user, setUser } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Donor-specific fields
    const [identificationNumber, setIdentificationNumber] = useState('');

    // NGO-specific fields
    const [orgName, setOrgName] = useState('');
    const [orgRegNumber, setOrgRegNumber] = useState('');
    const [orgDescription, setOrgDescription] = useState('');
    const [isTaxExempt, setIsTaxExempt] = useState(false);
    const [lhdnReference, setLhdnReference] = useState('');

    // Shared fields
    const [mailingAddress, setMailingAddress] = useState('');

    // Profile save states
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Password modal states
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setIdentificationNumber(user.identification_number || '');
            setMailingAddress(user.mailing_address || '');
            setOrgName(user.org_name || '');
            setOrgRegNumber(user.org_reg_number || '');
            setOrgDescription(user.org_description || '');
            setIsTaxExempt(!!user.is_tax_exempt);
            setLhdnReference(user.lhdn_reference || '');
        }
    }, [user]);

    // H2 fix: auto-dismiss password errors after 5 seconds
    useEffect(() => {
        if (!passwordError) return;
        const timer = setTimeout(() => setPasswordError(''), 5000);
        return () => clearTimeout(timer);
    }, [passwordError]);

    // T1 fix: single named function handles password modal close (DRY)
    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPassword('');
        setPasswordConfirmation('');
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        setIsConfirmModalOpen(true);
    };

    // H1 fix: keep modal open while saving, close it only after resolve
    const executeProfileUpdate = async () => {
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const payload = {
                name,
                identification_number: identificationNumber,
                mailing_address: mailingAddress,
            };

            if (user?.role === 'ngo') {
                payload.org_name = orgName;
                payload.org_reg_number = orgRegNumber;
                payload.org_description = orgDescription;
                payload.is_tax_exempt = isTaxExempt;
                payload.lhdn_reference = lhdnReference;
            }

            const response = await updateProfile(payload);

            if (response) {
                setUser(response);
                setSuccessMessage('Profile details updated successfully!');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false); // H1: close after resolve, not before
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setIsSavingPassword(true);

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            setIsSavingPassword(false);
            return;
        }

        if (password !== passwordConfirmation) {
            setPasswordError('Passwords do not match.');
            setIsSavingPassword(false);
            return;
        }

        try {
            await updateProfile({
                password,
                password_confirmation: passwordConfirmation,
            });
            setPasswordSuccess('Password updated successfully!');
            setPassword('');
            setPasswordConfirmation('');
            setTimeout(() => {
                handleClosePasswordModal();
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update password.';
            setPasswordError(msg);
        } finally {
            setIsSavingPassword(false);
        }
    };

    return {
        user,
        // Field values
        name, setName,
        email,
        identificationNumber, setIdentificationNumber,
        orgName, setOrgName,
        orgRegNumber, setOrgRegNumber,
        orgDescription, setOrgDescription,
        isTaxExempt, setIsTaxExempt,
        lhdnReference, setLhdnReference,
        mailingAddress, setMailingAddress,
        // Profile save
        successMessage,
        errorMessage,
        isLoading,
        isConfirmModalOpen, setIsConfirmModalOpen,
        handleSaveClick,
        executeProfileUpdate,
        // Password modal
        isPasswordModalOpen, setIsPasswordModalOpen,
        password, setPassword,
        passwordConfirmation, setPasswordConfirmation,
        isSavingPassword,
        passwordError,
        passwordSuccess,
        handleClosePasswordModal,
        handlePasswordSubmit,
    };
};
