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
                                label="Full Name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    required
                                />

                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Conditional NGO Details */}
                        {role === 'ngo' && (
                            <div className="space-y-4 border-t border-aidwise-border pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h3 className="text-md font-bold text-aidwise-text">Organization Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Organization Name"
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="e.g., Save the Children"
                                        required={role === 'ngo'}
                                    />

                                    <Input
                                        label="Registration Number"
                                        type="text"
                                        value={orgRegNumber}
                                        onChange={(e) => setOrgRegNumber(e.target.value)}
                                        placeholder="e.g., ORG-12345"
                                        required={role === 'ngo'}
                                    />
                                </div>

                                <Textarea
                                    label="Organization Description / Mission"
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    placeholder="Briefly describe your organization's mission and purpose..."
                                    rows={3}
                                />
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
