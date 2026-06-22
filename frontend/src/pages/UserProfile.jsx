import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { useUserProfile } from '../hooks/useUserProfile';
import { User, Mail, MapPin, Shield, Lock, Landmark, CheckCircle, LayoutDashboard } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const UserProfile = () => {
    const {
        user,
        name, setName,
        email,
        identificationNumber, setIdentificationNumber,
        orgName, setOrgName,
        orgRegNumber, setOrgRegNumber,
        orgDescription, setOrgDescription,
        isTaxExempt, setIsTaxExempt,
        lhdnReference, setLhdnReference,
        permitFile, setPermitFile,
        taxCertificateFile, setTaxCertificateFile,
        mailingAddress, setMailingAddress,
        successMessage,
        errorMessage,
        isLoading,
        isConfirmModalOpen, setIsConfirmModalOpen,
        handleSaveClick,
        executeProfileUpdate,
        isPasswordModalOpen, setIsPasswordModalOpen,
        password, setPassword,
        passwordConfirmation, setPasswordConfirmation,
        isSavingPassword,
        passwordError,
        passwordSuccess,
        handleClosePasswordModal,
        handlePasswordSubmit,
    } = useUserProfile();

    if (!user) {
        return (
            <div className="min-h-screen bg-aidwise-light font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
            </div>
        );
    }

    // U1 fix: derive the badge text & colour from the actual account status field
    const statusBadge = user.status === 'suspended'
        ? { label: 'Suspended', className: 'bg-red-50 text-red-600 border-red-100' }
        : { label: 'Active Account', className: 'bg-green-50 text-green-700 border-green-100' };

    // U4: determine the dashboard link for the donor's back-navigation
    const dashboardLink = user.role === 'ngo'
        ? '/ngo/dashboard'
        : user.role === 'admin'
        ? '/admin/dashboard'
        : '/donor/dashboard';

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
                {/* Account Type Banner — U1: reflects actual account status */}
                <div className="p-4 bg-white/60 backdrop-blur border border-aidwise-border/50 rounded-2xl flex items-center justify-between">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block">Account Role</span>
                        <span className="text-lg font-extrabold text-aidwise-text capitalize">{user.role}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusBadge.className}`}>
                        {statusBadge.label}
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
                            label={user.role === 'ngo' ? 'Representative Name' : 'Full Name'}
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

                {/* Section: NGO Organisation Details */}
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

                                <div className="mt-4 pt-4 border-t border-gray-200/60 space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-aidwise-text">
                                            Solicitation Permit Document (PDF / Image)
                                        </label>
                                        {user.permit_path && (
                                            <div className="mb-2 text-xs text-aidwise-blue font-semibold">
                                                <a href={user.permit_path.startsWith('http') ? user.permit_path : `${backendUrl}${user.permit_path}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                    📄 View Current Permit Document
                                                </a>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept=".pdf,image/*"
                                            onChange={(e) => setPermitFile(e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border border-gray-250 rounded-lg p-1.5 bg-white focus:outline-none"
                                        />
                                    </div>

                                    {isTaxExempt && (
                                        <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                                            <label className="block text-sm font-bold text-aidwise-text">
                                                Tax Exemption Certificate (PDF / Image)
                                            </label>
                                            {user.tax_certificate_path && (
                                                <div className="mb-2 text-xs text-aidwise-blue font-semibold">
                                                    <a href={user.tax_certificate_path.startsWith('http') ? user.tax_certificate_path : `${backendUrl}${user.tax_certificate_path}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                        📄 View Current Tax Certificate
                                                    </a>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept=".pdf,image/*"
                                                onChange={(e) => setTaxCertificateFile(e.target.files[0])}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border border-gray-250 rounded-lg p-1.5 bg-white focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
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
            {/* Profile Update Confirmation Modal — H1: stays open while saving */}
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
                            onClick={executeProfileUpdate}
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
                onClose={handleClosePasswordModal}
                title="Change Password"
            >
                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                    <p className="text-xs text-gray-500 mb-4">
                        Please enter your new login password. Password must be at least 8 characters long.
                    </p>

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
                            onClick={handleClosePasswordModal}
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

    // NGOs and Admins use the sidebar dashboard layout
    if (user.role === 'ngo' || user.role === 'admin') {
        return (
            <DashboardLayout>
                {renderFormContent()}
                {renderModals()}
            </DashboardLayout>
        );
    }

    // Donors use the standard top navbar view
    // U4: Add back navigation link to donor dashboard
    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
                {/* U4: Back navigation for donors */}
                <Link
                    to={dashboardLink}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-aidwise-blue mb-6"
                >
                    <LayoutDashboard size={15} />
                    Back to Dashboard
                </Link>
                {renderFormContent()}
            </main>
            {renderModals()}
        </div>
    );
};

export default UserProfile;
