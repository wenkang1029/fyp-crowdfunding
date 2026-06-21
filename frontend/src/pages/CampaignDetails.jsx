import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getCampaignById } from '../services/campaignService';
import { useDonationFlow } from '../hooks/useDonationFlow';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';
import CheckoutModal from '../components/ui/CheckoutModal';
import NgoProfileView from '../components/ui/NgoProfileView';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const CampaignDetails = () => {
    const { id } = useParams();
    
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNgoModalOpen, setIsNgoModalOpen] = useState(false);

    const fetchCampaign = useCallback(async () => {
        try {
            const campaignData = await getCampaignById(id);
            setCampaign(campaignData);
        } catch {
            setCampaign(null);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const {
        donationAmount,
        allocationId,
        error,
        successMessage,
        lastCompletedPayment,
        activeModal,
        setDonationAmount,
        setAllocationId,
        setActiveModal,
        handleInitialSubmit,
        proceedToPaymentGateway,
        executeDonation,
        closeSuccessModal,
    } = useDonationFlow(campaign, fetchCampaign);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div></div>;
    if (!campaign) return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><p className="text-xl text-gray-500">Campaign not found.</p></div>;

    const target = Number(campaign.target_amount) || 1;
    const raised = Number(campaign.current_amount) || 0;
    const progressPercentage = Math.min(Math.round((raised / target) * 100), 100);
    const allocations = Array.isArray(campaign.allocations) ? campaign.allocations : [];
    const selectedAllocation = allocations.find((allocation) => allocation.id === Number(allocationId));
    const allocationTotal = allocations.reduce(
        (sum, allocation) => sum + (Number(allocation.amount) || 0),
        0
    );
    const donationAmountValue = Math.max(Number(donationAmount) || 0, 0);
    const allocationShare = allocations.length > 0
        ? donationAmountValue / allocations.length
        : 0;
    const allocationProgressData = allocations.map((allocation) => {
        const targetAmount = Number(allocation.amount) || 0;
        const raisedAmount = Math.min(Number(allocation.current_amount) || 0, targetAmount);
        const progressPercent = targetAmount > 0
            ? Math.min(Math.round((raisedAmount / targetAmount) * 100), 100)
            : 0;

        return {
            id: allocation.id,
            purpose: allocation.purpose,
            targetAmount,
            raisedAmount,
            progressPercent,
        };
    });
    const totalAllocationTarget = allocationProgressData.reduce(
        (sum, item) => sum + item.targetAmount,
        0
    );
    const totalAllocationRaised = allocationProgressData.reduce(
        (sum, item) => sum + item.raisedAmount,
        0
    );
    const donutColors = [
        '#2563eb',
        '#22c55e',
        '#f59e0b',
        '#ef4444',
        '#14b8a6',
        '#0ea5e9',
        '#84cc16',
        '#f97316',
    ];
    let donutCursor = 0;
    const donutStops = totalAllocationTarget > 0
        ? allocationProgressData.map((item, index) => {
            const portion = item.raisedAmount / totalAllocationTarget;
            const start = donutCursor;
            donutCursor += portion * 100;
            return `${donutColors[index % donutColors.length]} ${start}% ${donutCursor}%`;
        })
        : [];
    const donutRemainder = donutCursor < 100
        ? [`#e5e7eb ${donutCursor}% 100%`]
        : [];
    const donutStyle = totalAllocationTarget > 0
        ? { background: `conic-gradient(${[...donutStops, ...donutRemainder].join(', ')})` }
        : { background: '#e5e7eb' };
    const totalAllocationProgress = totalAllocationTarget > 0
        ? Math.min(Math.round((totalAllocationRaised / totalAllocationTarget) * 100), 100)
        : 0;

    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-10 lg:px-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column: Story */}
                    <div className="lg:col-span-2 space-y-10">
                        <div>
                            <span 
                                onClick={() => setIsNgoModalOpen(true)}
                                className="text-xs font-semibold text-aidwise-blue uppercase tracking-wider cursor-pointer hover:underline"
                            >
                                Organized by {campaign.user?.name || 'Verified NGO'}
                            </span>
                            <h1 className="text-4xl font-extrabold text-aidwise-text mt-2 leading-tight">
                                {campaign.title}
                            </h1>
                            <p className="mt-3 text-gray-500 text-lg">
                                Help this campaign reach its funding goal and deliver impact on the ground.
                            </p>
                        </div>

                        {campaign.image_path ? (
                            <div className="w-full h-80 rounded-3xl overflow-hidden border border-aidwise-border bg-gray-50">
                                <img 
                                    src={campaign.image_path.startsWith('http') ? campaign.image_path : `${backendUrl}${campaign.image_path}`} 
                                    alt={campaign.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-80 bg-gradient-to-br from-aidwise-blue/10 to-aidwise-blue/5 rounded-3xl border border-aidwise-border flex items-center justify-center">
                                <span className="text-gray-400 font-medium">No Image Provided</span>
                            </div>
                        )}

                        <div>
                            <h2 className="text-2xl font-bold text-aidwise-text mb-4">About this campaign</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                {campaign.description}
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Donation Action */}
                    <div className="relative">
                        <div className="sticky top-8 space-y-6">
                            {/* --- Funding Breakdown & Progress Card --- */}
                            <Card className="shadow-apple border-aidwise-border">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Funding Breakdown</p>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <h3 className="text-3xl font-extrabold text-aidwise-text">RM {raised.toLocaleString()}</h3>
                                    <span className="text-sm text-gray-500">of RM {target.toLocaleString()}</span>
                                </div>
                                <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-aidwise-blue h-2.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                    <span>Overall progress</span>
                                    <span>{progressPercentage}% funded</span>
                                </div>

                                {allocations.length > 0 && (
                                    <div className="mt-6">
                                        <hr className="border-aidwise-border" />
                                        <div className="mt-4 flex items-center justify-between text-sm">
                                            <span className="font-semibold text-aidwise-text">Sub-goals</span>
                                            <span className="text-gray-500">Goal RM {allocationTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-28 w-28 rounded-full" style={donutStyle}>
                                                    <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-aidwise-text">
                                                        {totalAllocationProgress}%
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-xs text-gray-500">
                                                    <div className="text-sm font-semibold text-aidwise-text">
                                                        RM {totalAllocationRaised.toLocaleString()} / RM {totalAllocationTarget.toLocaleString()}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">Total</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto pr-1 text-xs text-gray-500">
                                                {allocationProgressData.map((item, index) => (
                                                    <div key={item.id} className="flex items-center gap-2">
                                                        <span
                                                            className="h-2.5 w-2.5 rounded-full"
                                                            style={{ backgroundColor: donutColors[index % donutColors.length] }}
                                                        ></span>
                                                        <span className="truncate" title={item.purpose}>{item.purpose}</span>
                                                        <span className="ml-auto text-[11px] text-gray-400">
                                                            {item.progressPercent}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* --- Donation Form Card --- */}
                            <Card className="shadow-apple border-aidwise-border">
                                <form onSubmit={handleInitialSubmit} className="space-y-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-aidwise-text">Make a Donation</h4>
                                        <p className="text-sm text-gray-500">Every contribution helps reach the goal.</p>
                                    </div>

                                    {successMessage && (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 text-center">
                                            ✅ {successMessage}
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    {allocations.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-aidwise-text">
                                                    Direct to sub-goal (optional)
                                                </label>
                                                <span className="text-xs font-semibold text-gray-400">Step 1</span>
                                            </div>
                                            <select
                                                value={allocationId}
                                                onChange={(event) => setAllocationId(event.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                                            >
                                                <option value="">Overall campaign goal</option>
                                                {allocations.map((allocation) => (
                                                    <option key={allocation.id} value={allocation.id}>
                                                        {allocation.purpose}
                                                    </option>
                                                ))}
                                            </select>
                                            {allocationId ? (
                                                <div className="rounded-lg border border-aidwise-border bg-gray-50/60 px-3 py-2 text-xs text-gray-500">
                                                    Your donation will go directly to: <span className="font-semibold text-aidwise-text">{selectedAllocation?.purpose}</span>.
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-aidwise-border bg-gray-50/60 px-3 py-2 text-xs text-gray-500">
                                                    Choosing overall campaign splits your donation equally across all sub-goals.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-aidwise-text">
                                            Donation amount (RM)
                                        </label>
                                        <Input
                                            type="number"
                                            name="donationAmount"
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(e.target.value)}
                                            placeholder="e.g., 100"
                                            required
                                            min="1"
                                        />
                                        {allocations.length > 0 && !allocationId && donationAmountValue > 0 && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                Overall campaign donations are split equally across {allocations.length} sub-goals
                                                ({allocationShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each).
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" variant="primary" className="w-full py-3 text-lg" disabled={!(campaign.status === 'active' && (!campaign.start_date || new Date() >= new Date(campaign.start_date)) && (!campaign.end_date || new Date() <= new Date(campaign.end_date)))}>
                                        Donate Now
                                    </Button>
                                    <p className="text-xs text-center text-gray-400">
                                        Secure transaction powered by AidWise.
                                    </p>
                                </form>
                            </Card>
                            {/* Show campaign date status messages */}
                            {!((campaign.status === 'active') && (!campaign.start_date || new Date() >= new Date(campaign.start_date)) && (!campaign.end_date || new Date() <= new Date(campaign.end_date))) && (
                                <div className="mt-4 rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-800">
                                    {campaign.start_date && new Date() < new Date(campaign.start_date) && (
                                        <div>Campaign opens on {new Date(campaign.start_date).toLocaleString()}.</div>
                                    )}
                                    {campaign.end_date && new Date() > new Date(campaign.end_date) && (
                                        <div>Campaign ended on {new Date(campaign.end_date).toLocaleString()}.</div>
                                    )}
                                    {campaign.status !== 'active' && (
                                        <div>Campaign is not active yet.</div>
                                    )}
                                </div>
                            )}
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
                    {selectedAllocation && (
                        <p className="mb-6 text-sm text-gray-500">
                            Directed to: <span className="font-semibold text-aidwise-text">{selectedAllocation.purpose}</span>
                        </p>
                    )}
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
                campaign={campaign}
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

            <NgoProfileView 
                isOpen={isNgoModalOpen}
                onClose={() => setIsNgoModalOpen(false)}
                ngoId={campaign.user_id}
            />

        </div>
    );
};

export default CampaignDetails;