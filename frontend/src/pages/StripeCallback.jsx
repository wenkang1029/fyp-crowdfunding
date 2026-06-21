import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyStripeOnboarding } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const StripeCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            const flowStatus = searchParams.get('status');

            if (flowStatus === 'success') {
                try {
                    const result = await verifyStripeOnboarding();
                    if (result.success && result.completed) {
                        setStatus('success');
                        if (refreshUser) await refreshUser();
                        setTimeout(() => navigate('/ngo/dashboard'), 4000);
                    } else {
                        setStatus('failed');
                        setErrorMsg(result.message || 'Onboarding not completed yet.');
                    }
                } catch (err) {
                    setStatus('failed');
                    setErrorMsg('An error occurred during verification.');
                }
            } else {
                setStatus('failed');
                setErrorMsg('Onboarding session was refreshed or canceled.');
            }
        };

        checkStatus();
    }, [searchParams, navigate, refreshUser]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-apple text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader className="w-12 h-12 text-aidwise-blue animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-aidwise-text">Verifying stripe connection...</h2>
                        <p className="text-gray-500 mt-2 text-sm">Please wait while we confirm your account details with Stripe.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Connection Successful!</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Your Stripe Connect Express account is linked. You can now accept donations directly.
                        </p>
                        <p className="text-xs text-gray-400 mt-6">Redirecting you to the dashboard...</p>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex flex-col items-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Connection Incomplete</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            {errorMsg || 'We could not complete your Stripe integration onboarding.'}
                        </p>
                        <button
                            onClick={() => navigate('/ngo/dashboard')}
                            className="mt-6 w-full py-2.5 px-4 bg-aidwise-blue hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StripeCallback;
