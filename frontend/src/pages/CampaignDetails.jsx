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
import { FileText, X } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const CampaignDetails = () => {
    const { id } = useParams();
    
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNgoModalOpen, setIsNgoModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
    const [activeTab, setActiveTab] = useState('story');
    const [activeLightboxImage, setActiveLightboxImage] = useState(null);

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

    const [destinationType, setDestinationType] = useState('overall'); // 'overall' or 'specific'
    const [selectedAllocationIds, setSelectedAllocationIds] = useState([]);

    const handleToggleAllocation = (id) => {
        setSelectedAllocationIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleCloseSuccess = () => {
        closeSuccessModal();
        setSelectedAllocationIds([]);
        setDestinationType('overall');
    };

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div></div>;
    if (!campaign) return <div className="min-h-screen flex items-center justify-center bg-aidwise-light"><p className="text-xl text-gray-500">Campaign not found.</p></div>;

    const target = Number(campaign.target_amount) || 1;
    const raised = Number(campaign.current_amount) || 0;
    const progressPercentage = Math.min(Math.round((raised / target) * 100), 100);
    const rawProgressPercentage = Math.round((raised / target) * 100);
    const disbursements = Array.isArray(campaign.disbursements) ? campaign.disbursements : [];
    const disbursedAmount = disbursements
        .filter((item) => item.status === 'approved')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const disbursedPercent = Math.min((disbursedAmount / target) * 100, 100);
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

    const surplusAmount = Math.max(raised - totalAllocationRaised, 0);
    const displayAllocationProgressData = [...allocationProgressData];
    if (surplusAmount > 0.01) {
        displayAllocationProgressData.push({
            id: 'surplus',
            purpose: 'General Surplus',
            targetAmount: 0,
            raisedAmount: surplusAmount,
            progressPercent: 100,
            isSurplus: true
        });
    }

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
    const donutDenominator = Math.max(raised, totalAllocationRaised) || 1;
    let donutCursor = 0;
    const donutStops = donutDenominator > 0
        ? displayAllocationProgressData.map((item, index) => {
            const portion = item.raisedAmount / donutDenominator;
            const start = donutCursor;
            donutCursor += portion * 100;
            const color = item.isSurplus ? '#d97706' : donutColors[index % donutColors.length];
            return `${color} ${start}% ${donutCursor}%`;
        })
        : [];
    const donutRemainder = donutCursor < 100
        ? [`#e5e7eb ${donutCursor}% 100%`]
        : [];
    const donutStyle = donutDenominator > 0
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

                        {(() => {
                            const images = Array.isArray(campaign.image_paths) && campaign.image_paths.length > 0
                                ? campaign.image_paths
                                : campaign.image_path
                                    ? [campaign.image_path]
                                    : [];

                            if (images.length === 0) {
                                return (
                                    <div className="w-full h-80 bg-gradient-to-br from-aidwise-blue/10 to-aidwise-blue/5 rounded-3xl border border-aidwise-border flex items-center justify-center">
                                        <span className="text-gray-400 font-medium">No Image Provided</span>
                                    </div>
                                );
                            }

                            if (images.length === 1) {
                                return (
                                    <div className="w-full h-80 rounded-3xl overflow-hidden border border-aidwise-border bg-gray-50 relative shadow-sm">
                                        <img 
                                            src={images[0].startsWith('http') ? images[0] : `${backendUrl}${images[0]}`} 
                                            alt={campaign.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                );
                            }

                            return (
                                <div className="w-full h-80 rounded-3xl overflow-hidden border border-aidwise-border bg-gray-50 relative group shadow-sm">
                                    {/* Current Image */}
                                    <img 
                                        src={images[currentImageIndex].startsWith('http') ? images[currentImageIndex] : `${backendUrl}${images[currentImageIndex]}`} 
                                        alt={`${campaign.title} - ${currentImageIndex + 1}`} 
                                        className="w-full h-full object-cover transition-all duration-300"
                                    />

                                    {/* Prev Navigation Arrow */}
                                    <button 
                                        type="button"
                                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-aidwise-text flex items-center justify-center shadow-md hover:scale-105 transition-all focus:outline-none opacity-0 group-hover:opacity-100 duration-300 font-bold text-xl select-none"
                                        title="Previous Image"
                                    >
                                        ‹
                                    </button>

                                    {/* Next Navigation Arrow */}
                                    <button 
                                        type="button"
                                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-aidwise-text flex items-center justify-center shadow-md hover:scale-105 transition-all focus:outline-none opacity-0 group-hover:opacity-100 duration-300 font-bold text-xl select-none"
                                        title="Next Image"
                                    >
                                        ›
                                    </button>

                                    {/* Indicators (Dots) */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
                                        {images.map((_, i) => (
                                            <button
                                                type="button"
                                                key={i}
                                                onClick={() => setCurrentImageIndex(i)}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                    i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Image Counter Badge */}
                                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-6" aria-label="Tabs">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('story')}
                                    className={`pb-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
                                        activeTab === 'story'
                                            ? 'border-aidwise-blue text-aidwise-blue'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    📖 Story
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('transparency')}
                                    className={`pb-4 text-sm font-bold border-b-2 transition-all focus:outline-none flex items-center gap-1.5 ${
                                        activeTab === 'transparency'
                                            ? 'border-aidwise-blue text-aidwise-blue'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    🛡️ Transparency & Payouts
                                    {disbursements.length > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-blue-50 text-aidwise-blue font-extrabold rounded-md text-[10px]">
                                            {disbursements.length}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        </div>

                        {/* Tab Contents */}
                        {activeTab === 'story' ? (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-2xl font-bold text-aidwise-text mb-4">About this campaign</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                    {campaign.description}
                                </p>
                            </div>
                        ) : (() => {
                            const campaignDisbursed = disbursedAmount;
                            const campaignRaised = raised;
                            const utilizationPercent = campaignRaised > 0 ? Math.min(Math.round((campaignDisbursed / campaignRaised) * 100), 100) : 0;
                            const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

                            return (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div>
                                        <h2 className="text-2xl font-bold text-aidwise-text mb-2">Escrow Release & Payout Verification</h2>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            All donations are held in secure escrow. Payouts are only approved by the SJAM KMT board upon reviewing supplier invoices and real-world impact evidence.
                                        </p>
                                    </div>

                                    {/* Utilization rate breakdown */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-150 rounded-2xl">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fund Utilization Rate</span>
                                            <div className="text-2xl font-black text-aidwise-text">
                                                {utilizationPercent}% <span className="text-xs font-semibold text-gray-500">of raised funds used</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mt-2">
                                                <div className="bg-emerald-500 h-full" style={{ width: `${utilizationPercent}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                                                <span>USED: {formatRM(campaignDisbursed)}</span>
                                                <span>ESCROW: {formatRM(campaignRaised - campaignDisbursed)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ledger */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-aidwise-text uppercase tracking-wider text-gray-400">Verified Payout Ledger</h3>
                                        {disbursements.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl text-sm text-gray-400 font-medium">
                                                No disbursements recorded yet. All raised funds remain securely in the escrow account.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {disbursements.map((d) => {
                                                    const proofImages = Array.isArray(d.proof_images) ? d.proof_images : [];
                                                    return (
                                                        <div key={d.id} className="p-5 bg-white border border-gray-150 rounded-2xl shadow-apple-xs hover:shadow-apple-sm transition-all flex flex-col gap-4">
                                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                                <div>
                                                                    <span className="text-[10px] text-gray-400 font-bold">{formatDate(d.created_at)}</span>
                                                                    <h4 className="text-base font-extrabold text-aidwise-text mt-0.5">{d.purpose}</h4>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-sm font-black text-emerald-600 block">{formatRM(d.amount)}</span>
                                                                    <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold text-emerald-600 mt-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                                                        ✓ Verified Payout
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                                                                {d.details || 'Disbursement breakdown and logistics details.'}
                                                            </p>

                                                            {/* Physical Proof Gallery */}
                                                            <div className="border-t border-gray-50 pt-3">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                                                                    Impact Proof Gallery:
                                                                </span>
                                                                {proofImages.length === 0 ? (
                                                                    <div className="text-xs text-amber-600 font-semibold italic bg-amber-50 px-3 py-2 rounded-xl border border-amber-100/50">
                                                                        ⚠️ Payout released to NGO. Verification photos of distribution on the ground are pending upload by the NGO.
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-3 flex-wrap">
                                                                        {proofImages.map((path, idx) => (
                                                                            <div 
                                                                                key={idx} 
                                                                                onClick={() => setActiveLightboxImage(path.startsWith('http') ? path : `${backendUrl}${path}`)}
                                                                                className="h-16 w-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:scale-105 hover:border-aidwise-blue transition-all cursor-pointer shadow-apple-sm relative group"
                                                                            >
                                                                                <img 
                                                                                    src={path.startsWith('http') ? path : `${backendUrl}${path}`} 
                                                                                    alt={`Proof Photo ${idx + 1}`} 
                                                                                    className="h-full w-full object-cover" 
                                                                                />
                                                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {d.receipt_path && (
                                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                                    <a 
                                                                        href={d.receipt_path.startsWith('http') ? d.receipt_path : `${backendUrl}${d.receipt_path}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-aidwise-blue hover:underline bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-blue-100/50"
                                                                    >
                                                                        <FileText size={12} />
                                                                        <span>View Official Receipt/Invoice</span>
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                    </div>

                    {/* Right Column: Donation Action */}
                    <div className="relative">
                        <div className="sticky top-8 space-y-6">
                            {/* --- Funding Breakdown & Progress Card --- */}
                            <Card className="shadow-apple border-aidwise-border">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Funding Breakdown</p>
                                
                                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50/50 rounded-xl p-2.5 border border-gray-100/50 mb-4">
                                    <div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase">Target</div>
                                        <div className="text-sm font-extrabold text-aidwise-text mt-0.5">RM {target.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase">Raised</div>
                                        <div className="text-sm font-extrabold text-aidwise-blue mt-0.5">RM {raised.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase">Fund Used</div>
                                        <div className="text-sm font-extrabold text-emerald-600 mt-0.5">RM {disbursedAmount.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="mt-4 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div className="h-full flex">
                                        <div className="h-full bg-emerald-500" style={{ width: `${disbursedPercent}%` }} title={`Fund Used: RM ${disbursedAmount.toLocaleString()}`}></div>
                                        <div className="h-full bg-aidwise-blue" style={{ width: `${Math.max(progressPercentage - disbursedPercent, 0)}%` }} title={`Available: RM ${(raised - disbursedAmount).toLocaleString()}`}></div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                    <span>Overall Progress</span>
                                    <span className="font-semibold text-aidwise-blue">{rawProgressPercentage}% funded</span>
                                </div>
                                <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-gray-500 border-t border-gray-50 pt-2">
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                        <span>Fund Used: RM {disbursedAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-aidwise-blue"></span>
                                        <span>Available: RM {(raised - disbursedAmount).toLocaleString()}</span>
                                    </div>
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
                                                <div className="relative h-28 w-28 rounded-full shrink-0" style={donutStyle}>
                                                    <div className="absolute inset-2.5 rounded-full bg-white flex flex-col items-center justify-center text-center p-1">
                                                        <span className="text-[8px] font-extrabold text-aidwise-blue tracking-wider leading-none">RAISED</span>
                                                        <span className="text-[10px] font-extrabold text-aidwise-text mt-0.5 leading-none shrink-0 truncate max-w-full" title={`RM ${raised.toLocaleString()}`}>
                                                            RM {raised.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-xs text-gray-500">
                                                    <div className="text-sm font-semibold text-aidwise-text">
                                                        RM {(totalAllocationRaised + surplusAmount).toLocaleString()} / RM {totalAllocationTarget.toLocaleString()}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">Total Campaign Raised</div>
                                                </div>
                                            </div>

                                            <div className="space-y-2.5 max-h-48 overflow-auto pr-1 text-xs text-gray-500">
                                                {displayAllocationProgressData.map((item, index) => {
                                                    const color = item.isSurplus ? '#d97706' : donutColors[index % donutColors.length];
                                                    return (
                                                        <div key={item.id} className="flex items-start gap-2">
                                                            <span
                                                                className="h-2.5 w-2.5 rounded-full shrink-0 mt-1"
                                                                style={{ backgroundColor: color }}
                                                            ></span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between font-medium text-aidwise-text">
                                                                    <span className="truncate" title={item.purpose}>{item.purpose}</span>
                                                                    <span className="font-semibold text-gray-700 shrink-0 ml-2">
                                                                        {item.isSurplus ? '—' : `${item.progressPercent}%`}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                                    {item.isSurplus 
                                                                        ? `Raised: RM ${item.raisedAmount.toLocaleString()}`
                                                                        : `RM ${item.raisedAmount.toLocaleString()} / RM ${item.targetAmount.toLocaleString()}`
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <Button
                                    onClick={() => {
                                        setDestinationType('overall');
                                        setSelectedAllocationIds([]);
                                        setHasAgreedTerms(false);
                                        setActiveModal('donate_form');
                                    }}
                                    variant="primary"
                                    className="w-full mt-6 py-3.5 text-base font-bold shadow-lg shadow-aidwise-blue/20 hover:shadow-aidwise-blue/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                    disabled={!(campaign.status === 'active' && (!campaign.start_date || new Date() >= new Date(campaign.start_date)) && (!campaign.end_date || new Date() <= new Date(campaign.end_date)))}
                                >
                                    ❤️ Donate Now
                                </Button>
                            </Card>
                            
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
                isOpen={activeModal === 'donate_form'}
                onClose={() => setActiveModal(null)}
                title="Make a Donation"
            >
                <form onSubmit={handleInitialSubmit} className="space-y-5">

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
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-aidwise-text">
                                Fund Destination
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDestinationType('overall');
                                        setSelectedAllocationIds([]);
                                    }}
                                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 focus:outline-none ${
                                        destinationType === 'overall'
                                            ? 'border-aidwise-blue bg-aidwise-blue/5 ring-1 ring-aidwise-blue shadow-sm'
                                            : 'border-gray-200 bg-white hover:bg-gray-50/80'
                                    }`}
                                >
                                    <div className="text-xs font-bold text-aidwise-text">Overall Campaign</div>
                                    <div className="text-[10px] text-gray-400 mt-1">Split equally across all sub-goals</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDestinationType('specific');
                                        setSelectedAllocationIds(allocations.map(a => a.id));
                                    }}
                                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 focus:outline-none ${
                                        destinationType === 'specific'
                                            ? 'border-aidwise-blue bg-aidwise-blue/5 ring-1 ring-aidwise-blue shadow-sm'
                                            : 'border-gray-200 bg-white hover:bg-gray-50/80'
                                    }`}
                                >
                                    <div className="text-xs font-bold text-aidwise-text">Specific Sub-goals</div>
                                    <div className="text-[10px] text-gray-400 mt-1">Select one or more categories</div>
                                </button>
                            </div>

                            {destinationType === 'specific' ? (
                                <div className="space-y-2 border border-gray-150 rounded-2xl p-3 bg-gray-50/50 max-h-48 overflow-y-auto">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Select sub-goals to support</p>
                                    {allocations.map((allocation) => {
                                        const isChecked = selectedAllocationIds.includes(allocation.id);
                                        const allocTarget = Number(allocation.amount) || 0;
                                        const allocRaised = Number(allocation.current_amount) || 0;
                                        return (
                                            <label 
                                                key={allocation.id} 
                                                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all duration-150 ${
                                                    isChecked 
                                                        ? 'border-aidwise-blue/30 bg-white shadow-sm' 
                                                        : 'border-transparent hover:bg-white/50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleAllocation(allocation.id)}
                                                    className="mt-0.5 h-4 w-4 text-aidwise-blue focus:ring-aidwise-blue border-gray-300 rounded cursor-pointer"
                                                />
                                                <div className="flex-1 min-w-0 text-xs">
                                                    <div className="font-bold text-aidwise-text truncate">{allocation.purpose}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                                        Goal: RM {allocTarget.toLocaleString()} (Raised: RM {allocRaised.toLocaleString()})
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-aidwise-border bg-gray-50/60 p-4 space-y-3">
                                    <p className="text-xs font-bold text-aidwise-text">
                                        Overall Campaign Terms & Funding Rules:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-gray-500 leading-normal">
                                        <li>
                                            <span className="font-medium text-gray-600">Equal Distribution:</span> Your donation is split equally across all campaign sub-goals.
                                        </li>
                                        <li>
                                            <span className="font-medium text-gray-600">Surplus Waterfall:</span> Any contributions exceeding a sub-goal's target are dynamically redirected to remaining underfunded categories, with final overflows directed to the campaign's General Surplus.
                                        </li>
                                        <li>
                                            <span className="font-medium text-gray-600">Escrow Hold:</span> All donated funds are securely held in platform escrow, requiring the NGO to request verified disbursements before any funds are released.
                                        </li>
                                    </ul>
                                    <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={hasAgreedTerms}
                                            onChange={(e) => setHasAgreedTerms(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 text-aidwise-blue focus:ring-aidwise-blue border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="text-[11px] font-semibold text-aidwise-text leading-tight">
                                            I understand and agree to these donation distribution and escrow disbursement rules.
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-aidwise-text">
                            Donation Amount (RM)
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
                        {allocations.length > 0 && donationAmountValue > 0 && (
                            <div className="mt-2 text-xs">
                                {destinationType === 'overall' ? (
                                    <p className="text-emerald-600 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl">
                                        ✨ Your <strong>RM {donationAmountValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> donation will be split equally: <strong>RM {allocationShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> each to all {allocations.length} sub-goals.
                                    </p>
                                ) : (
                                    selectedAllocationIds.length > 0 ? (
                                        <p className="text-emerald-600 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl leading-relaxed">
                                            ✨ Your <strong>RM {donationAmountValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> donation will be split equally: <strong>RM {(donationAmountValue / selectedAllocationIds.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> each to: {
                                                allocations
                                                    .filter(a => selectedAllocationIds.includes(a.id))
                                                    .map(a => a.purpose)
                                                    .join(', ')
                                            }.
                                        </p>
                                    ) : (
                                        <p className="text-amber-600 bg-amber-50/50 border border-amber-150 p-2.5 rounded-xl">
                                            ⚠️ Please select at least one sub-goal to proceed.
                                        </p>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full py-3.5 text-base font-bold" 
                        disabled={
                            !(campaign.status === 'active' && 
                              (!campaign.start_date || new Date() >= new Date(campaign.start_date)) && 
                              (!campaign.end_date || new Date() <= new Date(campaign.end_date))) || 
                            donationAmountValue <= 0 ||
                            (destinationType === 'overall' && !hasAgreedTerms) ||
                            (destinationType === 'specific' && selectedAllocationIds.length === 0)
                        }
                    >
                        Proceed to Payment
                    </Button>
                </form>
            </Modal>

            <Modal 
                isOpen={activeModal === 'confirm'} 
                onClose={() => setActiveModal(null)} 
                title="Confirm Donation"
            >
                <div className="text-center">
                    <p className="text-gray-600 mb-6 text-lg">
                        Are you sure you want to donate <strong className="text-aidwise-text text-xl border-b-2 border-aidwise-blue pb-1">RM {Number(donationAmount).toLocaleString()}</strong> to this campaign?
                    </p>
                    {destinationType === 'specific' && selectedAllocationIds.length > 0 && (
                        <p className="mb-6 text-sm text-gray-500">
                            Split equally across: <span className="font-semibold text-aidwise-text">
                                {allocations
                                    .filter(a => selectedAllocationIds.includes(a.id))
                                    .map(a => a.purpose)
                                    .join(', ')
                                }
                            </span>
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
                allocationId={null}
                allocationIds={destinationType === 'specific' ? selectedAllocationIds : []}
            />

            <Modal 
                isOpen={activeModal === 'success'} 
                onClose={handleCloseSuccess} 
                title="Donation Successful!"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Thank you for your generous support of <strong className="text-aidwise-text">{campaign.title}</strong> organized by <strong className="text-aidwise-text">{campaign.user?.name || 'Verified NGO'}</strong>. 
                        <br/><br/>
                        Your donation of <strong className="text-aidwise-blue text-xl">RM {Number(lastCompletedPayment?.amount).toLocaleString()}</strong> has been securely received and will make a real difference.
                    </p>
                    <Button variant="primary" className="w-full" onClick={handleCloseSuccess}>
                        Close
                    </Button>
                </div>
            </Modal>

            <NgoProfileView 
                isOpen={isNgoModalOpen}
                onClose={() => setIsNgoModalOpen(false)}
                ngoId={campaign.user_id}
            />

            {/* Lightbox Modal for Proof Images */}
            {activeLightboxImage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <button 
                        type="button"
                        onClick={() => setActiveLightboxImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        title="Close Image"
                    >
                        <X size={20} />
                    </button>
                    <div className="max-w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
                        <img 
                            src={activeLightboxImage} 
                            alt="Proof Large View" 
                            className="object-contain max-w-full max-h-[85vh]"
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default CampaignDetails;