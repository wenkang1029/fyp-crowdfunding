import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { User, Mail, MapPin, Shield, Lock, Landmark, CheckCircle } from 'lucide-react';

const UserProfile = () => {
    const { user, setUser } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    // Donor specific fields
    const [identificationNumber, setIdentificationNumber] = useState('');
    
    // NGO specific fields
    const [orgName, setOrgName] = useState('');
    const [orgRegNumber, setOrgRegNumber] = useState('');
    const [orgDescription, setOrgDescription] = useState('');
    const [isTaxExempt, setIsTaxExempt] = useState(false);
    const [lhdnReference, setLhdnReference] = useState('');
    
    // Shared fields
    const [mailingAddress, setMailingAddress] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Password Modal States
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Profile Update Confirmation Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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

    const handleSaveClick = (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        setIsConfirmModalOpen(true);
    };

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
            
            // Update local auth state
            if (response) {
                setUser(response);
                setSuccessMessage('Profile details updated successfully!');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
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
                setIsPasswordModalOpen(false);
                setPasswordSuccess('');
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update password.';
            setPasswordError(msg);
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-aidwise-light font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
            </div>
        );
    }

    const renderFormContent = () => (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text flex items-center gap-2">
                    <User className="text-aidwise-blue" size={32} />
                    Profile Settings
                </h1>
                <p className="mt-1 text-gray-500">Update your account information and preferences.</p>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle size={20} />
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 animate-in fade-in">
                    ⚠️ {errorMessage}
                </div>
            )}

            <form onSubmit={handleSaveClick} className="space-y-8">
                {/* Account Type Banner */}
                <div className="p-4 bg-white/60 backdrop-blur border border-aidwise-border/50 rounded-2xl flex items-center justify-between">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block">Account Role</span>
                        <span className="text-lg font-extrabold text-aidwise-text capitalize">{user.role}</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-aidwise-blue font-bold text-xs rounded-full border border-blue-100">
                        Verified Status
                    </span>
                </div>

                {/* Section: Basic Information */}
                <Card className="p-8 shadow-apple border border-aidwise-border">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                        <Shield className="text-aidwise-blue" size={20} />
                        <h3 className="font-extrabold text-lg text-aidwise-text">Basic Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label={user.role === 'ngo' ? "Representative Name" : "Full Name"}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        
                        <div>
                            <label className="block text-sm font-medium text-aidwise-text mb-1">Email Address</label>
                            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 cursor-not-allowed">
                                <Mail className="mr-2 opacity-60" size={18} />
                                <span>{email}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 block">Email address cannot be changed.</span>
                        </div>

                        {user.role === 'donor' && (
                            <div className="md:col-span-2">
                                <Input
                                    label="Identification Number (IC / Passport)"
                                    type="text"
                                    value={identificationNumber}
                                    onChange={(e) => setIdentificationNumber(e.target.value)}
                                    placeholder="e.g. 960101-10-1234"
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Section: NGO details */}
                {user.role === 'ngo' && (
                    <Card className="p-8 shadow-apple border border-aidwise-border">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                            <Landmark className="text-aidwise-blue" size={20} />
                            <h3 className="font-extrabold text-lg text-aidwise-text">Organisation Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Organisation Name"
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="e.g. Helping Hands Trust"
                                required
                            />

                            <Input
                                label="Registration Number"
                                type="text"
                                value={orgRegNumber}
                                onChange={(e) => setOrgRegNumber(e.target.value)}
                                placeholder="e.g. NGO-12345-KL"
                                required
                            />

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Organisation Description"
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    placeholder="Describe the mission and scope of your organisation..."
                                    rows={4}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="isTaxExempt"
                                        checked={isTaxExempt}
                                        onChange={(e) => setIsTaxExempt(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-aidwise-blue focus:ring-aidwise-blue border-gray-300 rounded"
                                    />
                                    <div>
                                        <label htmlFor="isTaxExempt" className="font-bold text-sm text-aidwise-text block cursor-pointer">
                                            LHDN Section 44(6) Tax Exemption Organisation
                                        </label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Check this option if your organization is approved by LHDN to support tax exemption receipt generation.
                                        </p>
                                    </div>
                                </div>

                                {isTaxExempt && (
                                    <div className="pt-2 animate-in fade-in duration-200">
                                        <Input
                                            label="LHDN Reference Number"
                                            type="text"
                                            value={lhdnReference}
                                            onChange={(e) => setLhdnReference(e.target.value)}
                                            placeholder="e.g. LHDN.01/35/42/51/1798"
                                            required={isTaxExempt}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Section: Mailing Address */}
                <Card className="p-8 shadow-apple border border-aidwise-border">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                        <MapPin className="text-aidwise-blue" size={20} />
                        <h3 className="font-extrabold text-lg text-aidwise-text">Mailing Address</h3>
                    </div>

                    <div>
                        <Textarea
                            label="Complete Mailing Address"
                            value={mailingAddress}
                            onChange={(e) => setMailingAddress(e.target.value)}
                            placeholder="Enter your full mailing address..."
                            rows={3}
                        />
                    </div>
                </Card>

                {/* Section: Change Password Trigger Banner */}
                <div className="p-6 bg-white border border-aidwise-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl text-aidwise-blue shrink-0">
                            <Lock size={20} />
                        </div>
                        <div>
                            <span className="font-bold text-sm text-aidwise-text block">Security Settings</span>
                            <span className="text-xs text-gray-500">Update your account login password periodically.</span>
                        </div>
                    </div>
                    <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-semibold rounded-xl border border-gray-200 shrink-0"
                    >
                        Change Password
                    </Button>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="px-8 py-3 font-bold rounded-2xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving Changes...' : 'Save Profile Details'}
                    </Button>
                </div>
            </form>
        </div>
    );

    const renderModals = () => (
        <>
            {/* Profile Update Confirmation Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirm Profile Update"
            >
                <div className="text-center">
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to save the updated profile details?
                    </p>
                    <div className="flex gap-3">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            className="flex-1" 
                            onClick={() => setIsConfirmModalOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            variant="primary" 
                            className="flex-1" 
                            onClick={async () => {
                                setIsConfirmModalOpen(false);
                                await executeProfileUpdate();
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Yes, Confirm'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setPassword('');
                    setPasswordConfirmation('');
                    setPasswordError('');
                    setPasswordSuccess('');
                }}
                title="Change Password"
            >
                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                    <p className="text-xs text-gray-500 mb-4">Please enter your new login password. Password must be at least 8 characters long.</p>
                    
                    {passwordError && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="p-3 bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200">
                            {passwordSuccess}
                        </div>
                    )}

                    <Input
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="Retype new password"
                        required
                    />

                    <div className="flex gap-3 pt-2">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            className="flex-1" 
                            onClick={() => {
                                setIsPasswordModalOpen(false);
                                setPassword('');
                                setPasswordConfirmation('');
                                setPasswordError('');
                                setPasswordSuccess('');
                            }}
                            disabled={isSavingPassword}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="flex-1"
                            disabled={isSavingPassword}
                        >
                            {isSavingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );

    // NGOs and Admins operate inside the sidebar dashboard layout
    if (user.role === 'ngo' || user.role === 'admin') {
        return (
            <DashboardLayout>
                {renderFormContent()}
                {renderModals()}
            </DashboardLayout>
        );
    }

    // Donors operate inside the standard top navbar view
    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
                {renderFormContent()}
            </main>
            {renderModals()}
        </div>
    );
};

export default UserProfile;
