import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar'

const CampaignDetails = () => {
    const { id } = useParams();
    
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Donation Form & Modal State
    const [donationAmount, setDonationAmount] = useState('');
    const [isDonating, setIsDonating] = useState(false);
    
    // Modal Controllers
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await axiosInstance.get(`/campaigns/${id}`);
                setCampaign(response.data);
            } catch (err) {
                setError('Campaign not found.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    // Step 1: User clicks "Donate" on the form. We don't send to API yet, we just open the Confirm Modal!
    const handleInitialSubmit = (e) => {
        e.preventDefault();
        if (Number(donationAmount) > 0) {
            setIsConfirmModalOpen(true);
        }
    };

    // Step 2: User clicks "Yes, Confirm" inside the modal. NOW we call the API.
    const executeDonation = async () => {
        setError('');
        setIsDonating(true);

        try {
            const response = await axiosInstance.post(`/campaigns/${id}/donate`, {
                amount: Number(donationAmount)
            });
            
            // Success! Update the campaign data, close confirm modal, open success modal!
            setCampaign(response.data.campaign);
            setIsConfirmModalOpen(false);
            setIsSuccessModalOpen(true);
            
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to process donation. Please try again.');
            }
            setIsConfirmModalOpen(false); // Close modal so they can see the error
        } finally {
            setIsDonating(false);
        }
    };

    // Helper to close everything and reset the form
    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setDonationAmount('');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div></div>;
    }

    if (!campaign) {
        return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><p className="text-xl text-gray-500">Campaign not found.</p></div>;
    }

    const target = Number(campaign.target_amount) || 1;
    const raised = Number(campaign.current_amount) || 0;
    const progressPercentage = Math.min(Math.round((raised / target) * 100), 100);

    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            <Navbar />

            <main className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
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

                    <div className="relative">
                        <div className="sticky top-8">
                            <Card className="shadow-apple border-aidwise-border">
                                
                                <div className="mb-6">
                                    {/* Changed currency to RM */}
                                    <h3 className="text-3xl font-extrabold text-aidwise-text">RM {raised.toLocaleString()}</h3>
                                    <p className="text-gray-500 mt-1">raised of RM {target.toLocaleString()} goal</p>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                                    <div 
                                        className="bg-aidwise-blue h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>

                                <hr className="my-6 border-aidwise-border" />

                                {/* We now call handleInitialSubmit instead of sending it straight to the API */}
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
                                        placeholder="Amount in RM" // Updated placeholder
                                        required
                                        min="1"
                                    />
                                    
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="w-full py-3 text-lg"
                                    >
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

            {/* --- MODALS --- */}

            {/* 1. Confirmation Modal */}
            <Modal 
                isOpen={isConfirmModalOpen} 
                onClose={() => setIsConfirmModalOpen(false)} 
                title="Confirm Donation"
            >
                <div className="text-center">
                    <p className="text-gray-600 mb-6 text-lg">
                        Are you sure you want to donate <strong className="text-aidwise-text text-xl border-b-2 border-aidwise-blue pb-1">RM {Number(donationAmount).toLocaleString()}</strong> to this campaign?
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" className="flex-1" onClick={executeDonation} disabled={isDonating}>
                            {isDonating ? 'Processing...' : 'Yes, Confirm'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* 2. Appreciation Modal */}
            <Modal 
                isOpen={isSuccessModalOpen} 
                onClose={closeSuccessModal} 
                title="Donation Successful!"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        🎉
                    </div>
                    
                    {/* The carefully crafted appreciation text matching your exact feedback */}
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Thank you for your generous support of <strong className="text-aidwise-text">{campaign.title}</strong> organized by <strong className="text-aidwise-text">{campaign.user?.name || 'Verified NGO'}</strong>. 
                        <br/><br/>
                        Your donation of <strong className="text-aidwise-blue text-xl">RM {Number(donationAmount).toLocaleString()}</strong> has been securely received and will make a real difference.
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