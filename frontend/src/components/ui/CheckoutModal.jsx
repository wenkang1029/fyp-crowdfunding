import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Loader2, CheckCircle, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import axiosInstance from '../../api/axios';

// Initialize stripe outside component to avoid re-instantiation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const StripeForm = ({ amount, onSuccessfulPayment, campaign, onClose, requestTaxReceipt, taxName, taxIdNumber, taxAddress, allocationId, allocationIds }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const isSubmitting = React.useRef(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || isSubmitting.current || isProcessing) {
            return;
        }

        isSubmitting.current = true;
        setIsProcessing(true);
        setErrorMessage('');

        try {
            const payload = {
                campaign_id: Number(campaign?.id),
                amount: Number(amount),
                request_tax_receipt: requestTaxReceipt,
                tax_name: requestTaxReceipt ? taxName : null,
                tax_id_number: requestTaxReceipt ? taxIdNumber : null,
                tax_address: requestTaxReceipt ? taxAddress : null
            };

            if (allocationIds && allocationIds.length > 0) {
                payload.allocation_ids = allocationIds.map(Number);
            } else if (allocationId) {
                payload.allocation_id = Number(allocationId);
            }

            // 1. Create donation draft & get client_secret from backend
            const response = await axiosInstance.post('/donations', payload);

            const { client_secret, donation } = response.data.data;

            // 2. Confirm the payment with Stripe
            const cardElement = elements.getElement(CardElement);
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: taxName || 'Donor',
                    },
                },
            });

            if (result.error) {
                setErrorMessage(result.error.message || 'Payment failed.');
                setIsProcessing(false);
                isSubmitting.current = false;
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // Payment succeeded, invoke callback to update UI
                    onSuccessfulPayment({
                        method: 'card',
                        transaction_id: result.paymentIntent.id,
                        request_tax_receipt: requestTaxReceipt,
                        tax_name: taxName,
                        tax_id_number: taxIdNumber,
                        tax_address: taxAddress
                    });
                }
            }
        } catch (err) {
            setErrorMessage(err?.response?.data?.message || 'Failed to initialize payment.');
            setIsProcessing(false);
            isSubmitting.current = false;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Credit or Debit Card
                </label>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '15px',
                                    color: '#1F2937',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    '::placeholder': {
                                        color: '#9CA3AF',
                                    },
                                },
                                invalid: {
                                    color: '#EF4444',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                disabled={!stripe || isProcessing}
                className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <ShieldCheck className="w-5 h-5" />
                        Pay RM {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </>
                )}
            </Button>
        </form>
    );
};

const CheckoutModal = ({ isOpen, onClose, amount, onSuccessfulPayment, campaign, allocationId, allocationIds }) => {
    const { user } = useAuth();
    const [isSuccess, setIsSuccess] = useState(false);

    // Tax Exemption States
    const [requestTaxReceipt, setRequestTaxReceipt] = useState(false);
    const [taxName, setTaxName] = useState('');
    const [taxIdNumber, setTaxIdNumber] = useState('');
    const [taxAddress, setTaxAddress] = useState('');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setIsSuccess(false);

        // Pre-fill tax fields if user is authenticated and is a donor
        if (user) {
            setTaxName(user.name || '');
            setTaxIdNumber(user.identification_number || '');
            setTaxAddress(user.mailing_address || '');
        } else {
            setTaxName('');
            setTaxIdNumber('');
            setTaxAddress('');
        }
        setRequestTaxReceipt(false);
    }, [isOpen, user]);

    if (!isOpen) return null;

    const isTaxExemptCampaign = campaign?.user?.is_tax_exempt === true;

    const handleSuccessCallback = (paymentDetails) => {
        setIsSuccess(true);
        setTimeout(() => {
            onSuccessfulPayment(paymentDetails);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative border border-gray-100">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-aidwise-text">Complete Donation</h3>
                        <p className="text-sm text-gray-500 font-medium">Amount: <span className="text-aidwise-blue font-bold">RM {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                    </div>
                    {!isSuccess && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full">
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Success State */}
                {isSuccess ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center h-[350px]">
                        <CheckCircle size={56} className="text-green-500 mb-4 animate-bounce" />
                        <h4 className="text-xl font-bold text-gray-900">Payment Successful!</h4>
                        <p className="text-sm text-gray-500 mt-2">Updating your receipt...</p>
                    </div>
                ) : (
                    <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                        {/* LHDN Tax Exemption Request Section */}
                        {isTaxExemptCampaign && (
                            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-4">
                                <div className="flex items-start gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="requestTaxReceipt"
                                        checked={requestTaxReceipt}
                                        onChange={(e) => setRequestTaxReceipt(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-aidwise-blue focus:ring-aidwise-blue border-gray-300 rounded"
                                    />
                                    <div>
                                        <label htmlFor="requestTaxReceipt" className="font-bold text-sm text-aidwise-text cursor-pointer block">
                                            Request LHDN Tax Exemption Receipt
                                        </label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            This organization supports Section 44(6) tax deductions.
                                        </p>
                                    </div>
                                </div>

                                {requestTaxReceipt && (
                                    <div className="space-y-3 pt-3 border-t border-gray-200 animate-in fade-in duration-200">
                                        <Input 
                                            label="Tax Receipt Name" 
                                            placeholder="John Doe"
                                            value={taxName}
                                            onChange={(e) => setTaxName(e.target.value)}
                                            required={requestTaxReceipt}
                                        />
                                        <Input 
                                            label="Identification Number (IC / PASSPORT / REG NO)" 
                                            placeholder="960101-10-1234"
                                            value={taxIdNumber}
                                            onChange={(e) => setTaxIdNumber(e.target.value)}
                                            required={requestTaxReceipt}
                                        />
                                        <Textarea
                                            label="Complete Mailing Address"
                                            placeholder="Enter address..."
                                            value={taxAddress}
                                            onChange={(e) => setTaxAddress(e.target.value)}
                                            required={requestTaxReceipt}
                                            rows={2}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mount Stripe Elements Form */}
                        <Elements stripe={stripePromise}>
                            <StripeForm
                                amount={amount}
                                campaign={campaign}
                                onSuccessfulPayment={handleSuccessCallback}
                                onClose={onClose}
                                requestTaxReceipt={requestTaxReceipt}
                                taxName={taxName}
                                taxIdNumber={taxIdNumber}
                                taxAddress={taxAddress}
                                allocationId={allocationId}
                                allocationIds={allocationIds}
                            />
                        </Elements>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;