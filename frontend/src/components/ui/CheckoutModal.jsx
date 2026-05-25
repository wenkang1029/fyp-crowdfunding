import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, QrCode, Loader2, CheckCircle, X } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const CheckoutModal = ({ isOpen, onClose, amount, onSuccessfulPayment }) => {
    const [activeTab, setActiveTab] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Mock Form States
    const [cardNumber, setCardNumber] = useState('');
    const [bank, setBank] = useState('');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setActiveTab('card');
        setIsProcessing(false);
        setIsSuccess(false);
        setCardNumber('');
        setBank('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSimulatePayment = (e) => {
        e.preventDefault();
        
        // 1. Start processing (Simulate sending data to bank)
        setIsProcessing(true);

        // 2. Simulate 2.5 seconds of network latency 
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);

            // 3. Generate a realistic mock receipt ID
            const prefix = activeTab === 'card' ? 'CRD' : activeTab === 'fpx' ? 'FPX' : 'DQR';
            const mockReceiptId = `${prefix}_${Math.floor(100000000 + Math.random() * 900000000)}`;

            // 4. Wait 1 second on the success screen so the user sees the green checkmark
            setTimeout(() => {
                // FIX: We REMOVED `setIsSuccess(false)` from here!
                // We keep the green checkmark permanently on screen while the API call 
                // runs in the background, until the parent page unmounts this modal.
                onSuccessfulPayment({
                    method: activeTab,
                    transaction_id: mockReceiptId
                });
            }, 1200);

        }, 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-aidwise-text">Complete Donation</h3>
                        <p className="text-sm text-gray-500 font-medium">Amount: <span className="text-aidwise-blue font-bold">RM {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                    </div>
                    {!isProcessing && !isSuccess && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Processing State (Takes over the whole modal body) */}
                {isProcessing && (
                    <div className="p-12 flex flex-col items-center justify-center text-center h-[350px]">
                        <Loader2 size={48} className="text-aidwise-blue animate-spin mb-4" />
                        <h4 className="text-lg font-bold text-aidwise-text">Authorizing Payment...</h4>
                        <p className="text-sm text-gray-500 mt-2">Please do not close this window or click back.</p>
                    </div>
                )}

                {/* Success State */}
                {isSuccess && (
                    <div className="p-12 flex flex-col items-center justify-center text-center h-[350px]">
                        <CheckCircle size={56} className="text-green-500 mb-4 animate-bounce" />
                        <h4 className="text-xl font-bold text-gray-900">Payment Successful!</h4>
                        <p className="text-sm text-gray-500 mt-2">Redirecting to receipt...</p>
                    </div>
                )}

                {/* Interactive Payment Selection (Hidden during processing) */}
                {!isProcessing && !isSuccess && (
                    <div className="p-6">
                        
                        {/* Tab Navigation */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                            <button 
                                onClick={() => setActiveTab('card')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'card' ? 'bg-white text-aidwise-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <CreditCard size={16} /> Card
                            </button>
                            <button 
                                onClick={() => setActiveTab('fpx')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'fpx' ? 'bg-white text-aidwise-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Building2 size={16} /> FPX
                            </button>
                            <button 
                                onClick={() => setActiveTab('qr')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'qr' ? 'bg-white text-aidwise-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <QrCode size={16} /> QR
                            </button>
                        </div>

                        {/* Payment Forms */}
                        <form onSubmit={handleSimulatePayment}>
                            
                            {/* 1. Credit Card View */}
                            {activeTab === 'card' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Input 
                                        label="Card Number" 
                                        placeholder="0000 0000 0000 0000" 
                                        maxLength="16"
                                        required 
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} // Digits only
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Expiry (MM/YY)" placeholder="MM/YY" maxLength="5" required />
                                        <Input label="CVC" placeholder="123" maxLength="3" required />
                                    </div>
                                    <Input label="Cardholder Name" placeholder="John Doe" required />
                                </div>
                            )}

                            {/* 2. FPX View */}
                            {activeTab === 'fpx' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="mb-4">
                                        <label className="block mb-1.5 text-sm font-medium text-aidwise-text">Select Bank</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                                            required
                                            value={bank}
                                            onChange={(e) => setBank(e.target.value)}
                                        >
                                            <option value="" disabled>Choose your bank...</option>
                                            <option value="maybank">Maybank2U</option>
                                            <option value="cimb">CIMB Clicks</option>
                                            <option value="rhb">RHB Now</option>
                                            <option value="public">Public Bank</option>
                                            <option value="hongleong">Hong Leong Connect</option>
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">You will be securely redirected to your bank's portal.</p>
                                </div>
                            )}

                            {/* 3. DuitNow QR View */}
                            {activeTab === 'qr' && (
                                <div className="space-y-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-48 h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center p-2">
                                        {/* Mock QR graphic using an icon */}
                                        <QrCode size={120} className="text-gray-400 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Scan this code using any banking app or e-wallet.</p>
                                    <p className="text-xs text-gray-400">Supports Touch 'n Go, GrabPay, Boost, & major banks.</p>
                                </div>
                            )}

                            <Button type="submit" variant="primary" className="w-full mt-8 h-12 text-base font-bold shadow-md hover:shadow-lg transition-all">
                                Pay RM {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;