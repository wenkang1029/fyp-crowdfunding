import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
    User, Mail, MapPin, Shield, Lock, Landmark, CheckCircle, 
    LayoutDashboard, FileText, ChevronRight, AlertCircle, Info 
} from 'lucide-react';

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

    const [activeSection, setActiveSection] = useState('profile');

    if (!user) {
        return (
            <div className="min-h-screen bg-aidwise-light font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
            </div>
        );
    }

    const statusBadge = user.status === 'suspended'
        ? { label: 'Suspended', className: 'bg-red-50 text-red-600 border-red-100' }
        : { label: 'Active Account', className: 'bg-green-50 text-green-700 border-green-100' };

    const dashboardLink = user.role === 'ngo'
        ? '/ngo/dashboard'
        : user.role === 'admin'
        ? '/admin/dashboard'
        : '/donor/dashboard';

    const renderTabsNav = () => {
        const sections = [
            { id: 'profile', label: 'Personal Profile', icon: User },
            { id: 'organization', label: 'Organization Details', icon: Landmark, ngoOnly: true },
            { id: 'documents', label: 'Verification Files', icon: Shield, ngoOnly: true },
            { id: 'security', label: 'Security Settings', icon: Lock }
        ];

        return (
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                {sections.map((section) => {
                    if (section.ngoOnly && user.role !== 'ngo') return null;
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSection(section.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                                activeSection === section.id
                                    ? 'bg-aidwise-blue text-white border-aidwise-blue shadow-apple-sm'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-150 hover:text-gray-700'
                            }`}
                        >
                            <Icon size={16} />
                            {section.label}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderActiveSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <Card className="p-8 shadow-apple border border-gray-100 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-2">
                            <User className="text-aidwise-blue" size={20} />
                            <h3 className="font-extrabold text-lg text-aidwise-text">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label={user.role === 'ngo' ? 'Representative Full Name' : 'Full Name'}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <div>
                                <label className="block text-sm font-semibold text-aidwise-text mb-1.5">Email Address</label>
                                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-400 cursor-not-allowed text-sm">
                                    <Mail className="mr-2 opacity-60" size={16} />
                                    <span>{email}</span>
                                </div>
                                <span className="text-[10px] text-gray-450 mt-1 block">Account logins are locked to this address.</span>
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
                );

            case 'organization':
                return (
                    <Card className="p-8 shadow-apple border border-gray-100 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-2">
                            <Landmark className="text-aidwise-blue" size={20} />
                            <h3 className="font-extrabold text-lg text-aidwise-text">Organisation Profile</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Organisation Name"
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="e.g. SJAM KMT Selangor"
                                required
                            />

                            <Input
                                label="Registration Code Number"
                                type="text"
                                value={orgRegNumber}
                                onChange={(e) => setOrgRegNumber(e.target.value)}
                                placeholder="e.g. NGO-12345-KL"
                                required
                            />

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Organisation Description / Mission"
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    placeholder="Describe the scope, volunteers team and targets of your NGO..."
                                    rows={4}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Mailing & Billing Address"
                                    value={mailingAddress}
                                    onChange={(e) => setMailingAddress(e.target.value)}
                                    placeholder="Complete organizational street and city address..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </Card>
                );

            case 'documents':
                return (
                    <Card className="p-8 shadow-apple border border-gray-100 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Shield className="text-aidwise-blue" size={20} />
                            <h3 className="font-extrabold text-lg text-aidwise-text">Onboarding & Tax Files</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 mb-2">Solicitation Permit Document</label>
                                {user.permit_path && (
                                    <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-2xl mb-3">
                                        <div className="flex items-center gap-2.5 text-xs text-aidwise-text font-semibold">
                                            <FileText size={16} className="text-aidwise-blue" />
                                            <span>Solicitation_Permit.pdf</span>
                                        </div>
                                        <a 
                                            href={user.permit_path.startsWith('http') ? user.permit_path : `${backendUrl}${user.permit_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs font-bold text-aidwise-blue hover:underline bg-white border border-gray-150 px-3 py-1.5 rounded-lg shadow-apple-sm"
                                        >
                                            View File
                                        </a>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept=".pdf,image/*"
                                    onChange={(e) => setPermitFile(e.target.files[0])}
                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border border-gray-200 rounded-xl p-1.5 bg-white focus:outline-none"
                                />
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-4">
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
                                            LHDN Section 44(6) Tax Exemption Active
                                        </label>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Check if SJAM KMT / LHDN authorized tax-exempt donation receipts on your campaigns.
                                        </p>
                                    </div>
                                </div>

                                {isTaxExempt && (
                                    <div className="pt-2 border-t border-gray-200/60 space-y-4 animate-fade-in">
                                        <Input
                                            label="LHDN Reference Number"
                                            type="text"
                                            value={lhdnReference}
                                            onChange={(e) => setLhdnReference(e.target.value)}
                                            placeholder="e.g. LHDN.01/35/42/51/1798"
                                            required={isTaxExempt}
                                        />

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 mb-2">Tax Exemption Certificate File</label>
                                            {user.tax_certificate_path && (
                                                <div className="flex items-center justify-between p-3.5 bg-white border border-gray-150 rounded-2xl mb-3">
                                                    <div className="flex items-center gap-2.5 text-xs text-aidwise-text font-semibold">
                                                        <FileText size={16} className="text-emerald-500" />
                                                        <span>LHDN_Certificate.pdf</span>
                                                    </div>
                                                    <a 
                                                        href={user.tax_certificate_path.startsWith('http') ? user.tax_certificate_path : `${backendUrl}${user.tax_certificate_path}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-xs font-bold text-aidwise-blue hover:underline bg-white border border-gray-150 px-3 py-1.5 rounded-lg shadow-apple-sm"
                                                    >
                                                        View File
                                                    </a>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept=".pdf,image/*"
                                                onChange={(e) => setTaxCertificateFile(e.target.files[0])}
                                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border border-gray-200 rounded-xl p-1.5 bg-white focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );

            case 'security':
                return (
                    <Card className="p-8 shadow-apple border border-gray-100 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-2">
                            <Lock className="text-aidwise-blue" size={20} />
                            <h3 className="font-extrabold text-lg text-aidwise-text">Security Settings</h3>
                        </div>

                        <div className="p-5 bg-white border border-gray-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-apple-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-aidwise-blue rounded-xl shrink-0">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <span className="font-bold text-sm text-aidwise-text block">Password Management</span>
                                    <span className="text-xs text-gray-400 font-semibold">Change your dashboard password regularly to prevent unauthorized access.</span>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center gap-2 text-xs font-bold rounded-xl border border-gray-250 shrink-0"
                            >
                                Change Password
                            </Button>
                        </div>
                    </Card>
                );

            default:
                return null;
        }
    };

    const renderFormContent = () => (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text flex items-center gap-2.5">
                        <User className="text-aidwise-blue" size={32} />
                        Profile Settings
                    </h1>
                    <p className="mt-1 text-gray-500">Update account credentials, representative data, LHDN settings and files.</p>
                </div>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle size={20} className="shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 text-red-650 text-sm font-bold rounded-xl border border-red-100 animate-in fade-in flex items-center gap-2">
                    <AlertCircle size={20} className="shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSaveClick} className="space-y-8">
                {/* Account Status and Verification details */}
                <div className="p-5 bg-white border border-gray-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-apple-sm">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold block">Account Role Type</span>
                        <span className="text-lg font-extrabold text-aidwise-text capitalize">{user.role}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${statusBadge.className}`}>
                            {statusBadge.label}
                        </span>
                        {user.role === 'ngo' && (
                            <>
                                {(() => {
                                    const isProfileComplete = user.org_name && user.org_reg_number && user.org_description && user.mailing_address;
                                    const isVerified = isProfileComplete && user.permit_path;
                                    return (
                                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${
                                            isVerified
                                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                                        }`}>
                                            {isVerified ? '✓ Verified NGO' : 'Verification Required'}
                                        </span>
                                    );
                                })()}
                                {user.is_tax_exempt && (
                                    <span className="px-3 py-1 text-xs font-extrabold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-250">
                                        Tax Exempt Section 44(6)
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Tabbed Profile Layout */}
                <div className="space-y-6">
                    <div>
                        {renderTabsNav()}
                    </div>
                    
                    <div className="space-y-6">
                        {renderActiveSectionContent()}
                        
                        {/* Auto-save / Submission buttons */}
                        <div className="flex justify-end gap-4 border-t border-gray-150 pt-6">
                            <Button
                                type="submit"
                                variant="primary"
                                className="px-8 py-3 font-bold rounded-xl shadow-apple-sm"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving Changes...' : 'Save Profile Settings'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );

    const renderModals = () => (
        <>
            {/* Confim modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirm Profile Update"
            >
                <div className="text-center">
                    <p className="text-gray-600 text-sm mb-6">
                        Are you sure you want to commit these settings updates to your profile ledger?
                    </p>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1 rounded-xl"
                            onClick={() => setIsConfirmModalOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="flex-1 rounded-xl"
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
                    <p className="text-xs text-gray-400 mb-4 font-semibold">
                        Enter your new secure login password. Recommended minimum length is 8 characters.
                    </p>

                    {passwordError && (
                        <div className="p-3 bg-red-50 text-red-650 text-xs font-bold rounded-xl border border-red-100">
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200">
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
                        placeholder="Retype password"
                        required
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1 rounded-xl text-xs font-bold"
                            onClick={handleClosePasswordModal}
                            disabled={isSavingPassword}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1 rounded-xl text-xs font-bold"
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
    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            <Navbar />
            <main className="max-w-6xl mx-auto px-6 py-12 lg:px-8">
                <Link
                    to={dashboardLink}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-aidwise-blue mb-6 transition-colors"
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
