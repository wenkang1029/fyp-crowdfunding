import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { Heart, Landmark } from 'lucide-react';

const Register = () => {
    const {
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
    } = useRegisterForm();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-aidwise-light font-sans">
            <div className="w-full max-w-xl my-8">
                
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-extrabold tracking-tight text-aidwise-blue">
                        AidWise
                    </Link>
                    <p className="mt-2 text-gray-500">Create an account to start your journey.</p>
                </div>

                <Card className="shadow-apple border border-aidwise-border p-8">
                    <form onSubmit={handleRegister} className="space-y-6">
                        
                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Role Selection Tabs */}
                        <div>
                            <label className="block text-sm font-bold text-aidwise-text mb-3">
                                Select Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('donor')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        role === 'donor'
                                            ? 'border-aidwise-blue bg-blue-50/50 text-aidwise-blue'
                                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                                    }`}
                                >
                                    <Heart className="mb-2" size={24} />
                                    <span className="font-bold text-sm">Donor</span>
                                    <span className="text-[10px] opacity-80 text-center mt-1">Support verified campaigns</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('ngo')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        role === 'ngo'
                                            ? 'border-aidwise-blue bg-blue-50/50 text-aidwise-blue'
                                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                                    }`}
                                >
                                    <Landmark className="mb-2" size={24} />
                                    <span className="font-bold text-sm">NGO / Charity</span>
                                    <span className="text-[10px] opacity-80 text-center mt-1">Raise funds and manage goals</span>
                                </button>
                            </div>
                        </div>

                        {/* General User Info */}
                        <div className="space-y-4">
                            <Input
                                id="name"
                                label="Full Name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                error={fieldErrors.name?.[0]}
                            />

                            <Input
                                id="email"
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                error={fieldErrors.email?.[0]}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    id="password"
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    required
                                    error={fieldErrors.password?.[0]}
                                />

                                <Input
                                    id="password_confirmation"
                                    label="Confirm Password"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Repeat password"
                                    required
                                    error={fieldErrors.password_confirmation?.[0]}
                                />
                            </div>
                        </div>

                        {/* Conditional NGO Details */}
                        {role === 'ngo' && (
                            <div className="space-y-4 border-t border-aidwise-border pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h3 className="text-md font-bold text-aidwise-text">Organization Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        id="org_name"
                                        label="Organization Name"
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="e.g., Save the Children"
                                        required={role === 'ngo'}
                                        error={fieldErrors.org_name?.[0]}
                                    />

                                    <Input
                                        id="org_reg_number"
                                        label="Registration Number"
                                        type="text"
                                        value={orgRegNumber}
                                        onChange={(e) => setOrgRegNumber(e.target.value)}
                                        placeholder="e.g., ORG-12345"
                                        required={role === 'ngo'}
                                        error={fieldErrors.org_reg_number?.[0]}
                                    />
                                </div>

                                <Textarea
                                    id="org_description"
                                    label="Organization Description / Mission"
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    placeholder="Briefly describe your organization's mission and purpose..."
                                    rows={3}
                                    error={fieldErrors.org_description?.[0]}
                                />

                                <Textarea
                                    id="mailing_address"
                                    label="Mailing & Billing Address"
                                    value={mailingAddress}
                                    onChange={(e) => setMailingAddress(e.target.value)}
                                    placeholder="Enter your organization's physical mailing & billing address..."
                                    rows={3}
                                    required={role === 'ngo'}
                                    error={fieldErrors.mailing_address?.[0]}
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-aidwise-text">
                                        Permit to Solicit Public Donation (PDF / Image) <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        id="permit_file"
                                        type="file" 
                                        accept=".pdf,image/*"
                                        onChange={(e) => setPermitFile(e.target.files[0])}
                                        className={`w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border rounded-lg p-1.5 bg-gray-50/50 focus:outline-none transition-all duration-200 ${
                                            fieldErrors.permit_file ? 'border-red-400 focus:ring-red-400 bg-red-50/10' : 'border-gray-250 bg-gray-50/50'
                                        }`}
                                        required={role === 'ngo'}
                                    />
                                    {fieldErrors.permit_file && (
                                        <p className="mt-1.5 text-sm text-red-500 font-medium">{fieldErrors.permit_file[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
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
                                        <div className="space-y-2 pt-2 border-t border-gray-200/60 animate-in fade-in duration-200">
                                            <label className="block text-sm font-bold text-aidwise-text">
                                                Tax Exemption Certificate (PDF / Image) <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                id="tax_exemption_file"
                                                type="file" 
                                                accept=".pdf,image/*"
                                                onChange={(e) => setTaxCertificateFile(e.target.files[0])}
                                                className={`w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border rounded-lg p-1.5 bg-white focus:outline-none transition-all duration-200 ${
                                                    fieldErrors.tax_exemption_file ? 'border-red-400 focus:ring-red-400 bg-red-50/10' : 'border-gray-250 bg-white'
                                                }`}
                                                required={role === 'ngo' && isTaxExempt}
                                            />
                                            {fieldErrors.tax_exemption_file && (
                                                <p className="mt-1.5 text-sm text-red-500 font-medium">{fieldErrors.tax_exemption_file[0]}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full py-3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        {/* Redirect to Login */}
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-aidwise-blue hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Register;
