import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';
import CheckoutModal from '../components/ui/CheckoutModal';

const CampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form & Message State
    const [donationAmount, setDonationAmount] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [lastCompletedPayment, setLastCompletedPayment] = useState(null);
    
    // THE FIX: Finite State Machine for Modals (Prevents overlapping glitches)
    // Can be: null | 'confirm' | 'checkout' | 'success'
    const [activeModal, setActiveModal] = useState(null);

    const fetchCampaign = async () => {
        try {
            const response = await axiosInstance.get(`/campaigns/${id}`);
            setCampaign(response.data.data || response.data);
        } catch (err) {
            setError('Campaign not found.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaign();
    }, [id]);

    // FLOW STEP 1: Form Submit -> Open Confirm Modal
    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setSuccessMessage(''); // Clear any old messages
        if (Number(donationAmount) > 0) {
            setActiveModal('confirm');
        }
    };

    // FLOW STEP 2: Confirm Clicked -> Switch to Checkout Modal
    const proceedToPaymentGateway = () => {
        setActiveModal('checkout');
    };

    // FLOW STEP 3: Checkout Finished -> Hit API -> Switch to Success Modal
    const executeDonation = async (paymentDetails) => {
        setError('');

        try {
            await axiosInstance.post('/donations', {
                campaign_id: id,
                amount: Number(donationAmount),
                transaction_id: paymentDetails.transaction_id,
                payment_method: paymentDetails.method
            });
            
            // Save details for the inline message
            setLastCompletedPayment({
                amount: donationAmount,
                method: paymentDetails.method
            });

            // Smooth transition to success modal
            setActiveModal('success');
            fetchCampaign(); // Refresh the progress bar instantly
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process donation.');
            setActiveModal(null); // Close everything so they see the error
        }
    };

    // FLOW STEP 4: Close Success Modal -> Display Inline Message
    const closeSuccessModal = () => {
        setActiveModal(null);
        if (lastCompletedPayment) {
            setSuccessMessage(`Successful Donation: RM ${lastCompletedPayment.amount} via ${lastCompletedPayment.method?.toUpperCase()}. Thank you!`);
        }
        setDonationAmount(''); // Reset input field
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div></div>;
    if (!campaign) return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><p className="text-xl text-gray-500">Campaign not found.</p></div>;

    const target = Number(campaign.target_amount) || 1;
    const raised = Number(campaign.current_amount) || 0;
    const progressPercentage = Math.min(Math.round((raised / target) * 100), 100);

    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            <Navbar />

            <main className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Column: Story */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <span className="text-sm font-bold text-aidwise-blue uppercase tracking-wider">
                                Organized by {campaign.user?.name || 'Verified NGO'}
                            </span>
                            <h1 className="text-4xl font-extrabold text-aidwise-text mt-2 leading-tight">
                                {campaign.title}
                            </h1>
                        </div>
                        <div className="w-full h-80 bg-gray-200 rounded-3xl border border-gray-300 flex items-center justify-center overflow-hidden">
                            <span className="text-gray-400">Campaign Image / Video</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-aidwise-text mb-4">About this campaign</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                {campaign.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Donation Action */}
                    <div className="relative">
                        <div className="sticky top-8">
                            <Card className="shadow-apple border-aidwise-border">
                                
                                <div className="mb-6">
                                    <h3 className="text-3xl font-extrabold text-aidwise-text">RM {raised.toLocaleString()}</h3>
                                    <p className="text-gray-500 mt-1">raised of RM {target.toLocaleString()} goal</p>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                                    <div 
                                        className="bg-aidwise-blue h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>

                                {/* THE INLINE SUCCESS MESSAGE */}
                                {successMessage && (
                                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 text-center">
                                        ✅ {successMessage}
                                    </div>
                                )}

                                <hr className="my-6 border-aidwise-border" />

                                <form onSubmit={handleInitialSubmit}>
                                    <h4 className="font-bold text-aidwise-text mb-4">Make a Donation</h4>
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                            {error}
                                        </div>
                                    )}
                                    <Input 
                                        type="number"
                                        name="donationAmount"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        placeholder="Amount in RM"
                                        required
                                        min="1"
                                    />
                                    <Button type="submit" variant="primary" className="w-full py-3 text-lg mt-2">
                                        Donate Now
                                    </Button>
                                    <p className="text-xs text-center text-gray-400 mt-4">
                                        Secure transaction powered by AidWise.
                                    </p>
                                </form>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>

            {/* --- STATE MACHINE MODALS --- */}

            <Modal 
                isOpen={activeModal === 'confirm'} 
                onClose={() => setActiveModal(null)} 
                title="Confirm Donation"
            >
                <div className="text-center">
                    <p className="text-gray-600 mb-6 text-lg">
                        Are you sure you want to donate <strong className="text-aidwise-text text-xl border-b-2 border-aidwise-blue pb-1">RM {Number(donationAmount).toLocaleString()}</strong> to this campaign?
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setActiveModal(null)}>Cancel</Button>
                        <Button variant="primary" className="flex-1" onClick={proceedToPaymentGateway}>Yes, Confirm</Button>
                    </div>
                </div>
            </Modal>

            <CheckoutModal 
                isOpen={activeModal === 'checkout'}
                onClose={() => setActiveModal(null)}
                amount={donationAmount}
                onSuccessfulPayment={executeDonation} 
            />

            <Modal 
                isOpen={activeModal === 'success'} 
                onClose={closeSuccessModal} 
                title="Donation Successful!"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Thank you for your generous support of <strong className="text-aidwise-text">{campaign.title}</strong> organized by <strong className="text-aidwise-text">{campaign.user?.name || 'Verified NGO'}</strong>. 
                        <br/><br/>
                        Your donation of <strong className="text-aidwise-blue text-xl">RM {Number(lastCompletedPayment?.amount).toLocaleString()}</strong> has been securely received and will make a real difference.
                    </p>
                    <Button variant="primary" className="w-full" onClick={closeSuccessModal}>
                        Close
                    </Button>
                </div>
            </Modal>

        </div>
    );
};

export default CampaignDetails;