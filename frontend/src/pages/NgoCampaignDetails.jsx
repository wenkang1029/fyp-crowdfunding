import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { useNgoCampaignDetails } from '../hooks/useNgoCampaignDetails';
import { 
    ArrowLeft, ListOrdered, Wallet, HandHeart, PieChart, Pencil, 
    FileText, Download, Calendar, Image as ImageIcon, Sparkles 
} from 'lucide-react';
import { downloadCampaignReport } from '../services/campaignService';
import DonorProfileView from '../components/ui/DonorProfileView';
import { useAuth } from '../context/AuthContext';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const NgoCampaignDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const {
        campaign,
        isLoading,
        error,
        successMessage,
        isCampaignModalOpen,
        campaignForm,
        campaignErrors,
        isSavingCampaign,
        isAllocationModalOpen,
        activeAllocation,
        allocationForm,
        allocationErrors,
        isSavingAllocation,
        openCampaignModal,
        closeCampaignModal,
        handleCampaignChange,
        handleCampaignSubmit,
        openAllocationEditModal,
        closeAllocationModal,
        handleAllocationChange,
        handleAllocationSubmit,
        isImagesModalOpen,
        images,
        useDefaultImage,
        isSavingImages,
        imagesErrors,
        openImagesModal,
        closeImagesModal,
        setImages,
        toggleUseDefaultImage,
        handleImagesSubmit,
    } = useNgoCampaignDetails(id);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);
    const [reportError, setReportError] = useState('');
    const [donorModal, setDonorModal] = useState({ open: false, donorId: null });
    const [activeTab, setActiveTab] = useState('overview');

    const openDonorModal = (donorId) => setDonorModal({ open: true, donorId });
    const closeDonorModal = () => setDonorModal({ open: false, donorId: null });

    const handleDownloadReport = async () => {
        setIsLoading(true);
        setReportError('');
        try {
            const { blob, filename } = await downloadCampaignReport(campaign.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setReportError('Failed to generate and download campaign report.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportDonationsCSV = () => {
        const headers = ['Donor Name', 'Allocation Purpose', 'Payment Method', 'Amount (RM)', 'Date'];
        const rows = donations.map((donation) => [
            donation.donor_name || donation.user?.name || 'Anonymous',
            donation.allocation?.purpose || 'General',
            donation.payment_method || '—',
            Number(donation.amount).toFixed(2),
            donation.created_at ? new Date(donation.created_at).toLocaleDateString() : '—'
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Campaign_${campaign.id}_Donations.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const resolveError = (value) => (Array.isArray(value) ? value[0] : value);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
                    <Link to="/ngo/campaigns">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <ArrowLeft size={16} /> Back to Campaigns
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    if (!campaign) {
        return null;
    }

    const allocations = Array.isArray(campaign.allocations) ? campaign.allocations : [];
    const donations = Array.isArray(campaign.donations) ? campaign.donations : [];
    const disbursements = Array.isArray(campaign.disbursements) ? campaign.disbursements : [];
    const raisedAmount = Number(campaign.current_amount || 0);
    const targetAmount = Math.max(Number(campaign.target_amount || 0), 1);
    const disbursedAmount = disbursements
        .filter((item) => item.status === 'approved')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const raisedPercent = Math.min((raisedAmount / targetAmount) * 100, 100);
    const rawRaisedPercent = (raisedAmount / targetAmount) * 100;
    const disbursedPercent = Math.min((disbursedAmount / targetAmount) * 100, 100);
    const availableAmount = Math.max(raisedAmount - disbursedAmount, 0);

    const allocationProgressItems = allocations.map((allocation) => {
        const allocationRaised = Number(allocation.current_amount || 0);
        const allocationTarget = Math.max(Number(allocation.amount || 0), 1);
        const allocationPercent = Math.min((allocationRaised / allocationTarget) * 100, 100);
        const remainingAmount = Math.max(allocationTarget - allocationRaised, 0);

        return {
            ...allocation,
            allocationRaised,
            allocationTarget,
            allocationPercent,
            remainingAmount,
        };
    });
    const totalCappedAllocationRaised = allocationProgressItems.reduce((sum, item) => sum + item.allocationRaised, 0);
    const surplusAmount = Math.max(raisedAmount - totalCappedAllocationRaised, 0);

    return (
        <>
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header and Back Link */}
                <div className="mb-6 space-y-3">
                    <Link to={user?.role === 'admin' ? '/admin/campaigns' : '/ngo/campaigns'} className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-aidwise-blue transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Back to Campaigns
                    </Link>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <Badge status={campaign.status} />
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <Calendar size={12} /> Launched {campaign.created_at ? formatDate(campaign.created_at) : '—'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text">{campaign.title}</h1>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <Button 
                                variant="secondary" 
                                className="flex items-center gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl" 
                                onClick={handleDownloadReport}
                                disabled={isDownloadingReport}
                            >
                                <FileText size={16} /> Export Financial PDF
                            </Button>
                            {user?.role !== 'admin' && (
                                <Button variant="secondary" className="flex items-center gap-2 rounded-xl" onClick={openCampaignModal}>
                                    <Pencil size={16} /> Edit Details
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-in fade-in">
                        {successMessage}
                    </div>
                )}

                {reportError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-between">
                        <span>{reportError}</span>
                        <button type="button" onClick={() => setReportError('')} className="text-xs font-bold text-red-500 hover:text-red-700">Dismiss</button>
                    </div>
                )}

                {/* Sub-Navigation Tabs */}
                <div className="mb-8 flex border-b border-gray-250 overflow-x-auto gap-2">
                    {[
                        { id: 'overview', label: 'Campaign Overview', icon: ImageIcon },
                        { id: 'subgoals', label: 'Budget & Sub-Goals', icon: Sparkles },
                        { id: 'donations', label: `Donations Ledger (${donations.length})`, icon: HandHeart },
                        { id: 'disbursements', label: `Disbursement Trail (${disbursements.length})`, icon: ListOrdered },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'border-aidwise-blue text-aidwise-blue font-bold'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <Icon size={15} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab: Overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Carousel */}
                            {(() => {
                                const images = Array.isArray(campaign.image_paths) && campaign.image_paths.length > 0
                                    ? campaign.image_paths
                                    : campaign.image_path
                                        ? [campaign.image_path]
                                        : [];

                                if (images.length === 0) {
                                    return (
                                        <div className="w-full h-80 bg-gray-50 rounded-2xl border border-gray-150 flex flex-col items-center justify-center relative shadow-apple-sm">
                                            <span className="text-gray-400 font-bold text-sm">No Images Provided</span>
                                            {user?.role !== 'admin' && (
                                                 <button onClick={openImagesModal} className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-xl shadow-apple border border-gray-100">
                                                     <Pencil size={14} />
                                                 </button>
                                             )}
                                        </div>
                                    );
                                }

                                return (
                                    <div className="w-full h-96 rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 relative group shadow-apple-sm">
                                        <img 
                                            src={images[currentImageIndex].startsWith('http') ? images[currentImageIndex] : `${backendUrl}${images[currentImageIndex]}`} 
                                            alt={campaign.title} 
                                            className="w-full h-full object-cover"
                                        />
                                         {user?.role !== 'admin' && (
                                             <button onClick={openImagesModal} className="absolute top-4 right-4 p-2.5 bg-white/95 hover:bg-white text-aidwise-text rounded-full shadow-apple border border-gray-150 transition-transform hover:scale-105">
                                                 <Pencil size={14} />
                                             </button>
                                         )}
                                        {images.length > 1 && (
                                            <>
                                                <button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-apple text-xl font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">‹</button>
                                                <button onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-apple text-xl font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">›</button>
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
                                                    {images.map((_, i) => (
                                                        <button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Campaign Story */}
                            <Card className="border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-aidwise-text mb-3">Campaign Story & Details</h3>
                                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{campaign.description}</p>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            {/* Payout & Escrow Summary Metrics */}
                            <Card className="border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Financial Metrics</h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Campaign Target Goal</span>
                                        <span className="text-lg font-bold text-aidwise-text block mt-0.5">{formatRM(campaign.target_amount)}</span>
                                    </div>
                                    <div className="p-3 bg-blue-50/40 border border-blue-100/50 rounded-xl">
                                        <span className="text-[10px] text-aidwise-blue font-bold uppercase block">Total Funds Raised ({Math.round(rawRaisedPercent)}%)</span>
                                        <span className="text-lg font-bold text-aidwise-blue block mt-0.5">{formatRM(raisedAmount)}</span>
                                    </div>
                                    <div className="p-3 bg-emerald-50/40 border border-emerald-100/50 rounded-xl">
                                        <span className="text-[10px] text-emerald-600 font-bold uppercase block">Disbursed (Withdrawn)</span>
                                        <span className="text-lg font-bold text-emerald-600 block mt-0.5">{formatRM(disbursedAmount)}</span>
                                    </div>
                                    <div className="p-3 bg-amber-50/40 border border-amber-100/50 rounded-xl">
                                        <span className="text-[10px] text-amber-700 font-bold uppercase block">Escrow Balance (Available)</span>
                                        <span className="text-lg font-bold text-amber-700 block mt-0.5">{formatRM(availableAmount)}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Compact Activity Ledger count */}
                            <Card className="border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Activity Ledger Summary</h3>
                                <div className="space-y-3.5 text-sm text-gray-600 font-medium">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><HandHeart size={15} className="text-aidwise-blue" /> Donations</span>
                                        <span className="font-bold text-aidwise-text">{donations.length} recorded</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100/80 pt-3">
                                        <span className="flex items-center gap-2"><Sparkles size={15} className="text-aidwise-blue" /> Sub-Goals</span>
                                        <span className="font-bold text-aidwise-text">{allocations.length} items</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100/80 pt-3">
                                        <span className="flex items-center gap-2"><ListOrdered size={15} className="text-aidwise-blue" /> Disbursements</span>
                                        <span className="font-bold text-aidwise-text">{disbursements.length} requests</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Tab: Sub-goals allocations */}
                {activeTab === 'subgoals' && (
                    <Card className="border border-gray-100 p-6 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-aidwise-text">Budget Allocation Sub-Goals</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Define target budgets. Donors select specific sub-goals during check-out.</p>
                            </div>
                        </div>

                        {allocationProgressItems.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">No sub-goal allocations found.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {allocationProgressItems.map((allocation) => (
                                    <div key={allocation.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="space-y-0.5">
                                                <h4 className="font-bold text-aidwise-text text-sm">{allocation.purpose}</h4>
                                                <p className="text-xs text-gray-400 font-semibold">
                                                    Target: {formatRM(allocation.allocationTarget)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-aidwise-blue bg-blue-50 px-2.5 py-1 rounded-lg">
                                                    {Math.round(allocation.allocationPercent)}% Funded
                                                </span>
                                                {user?.role !== 'admin' && (
                                                     <Button variant="secondary" className="px-2.5 py-2 text-xs flex items-center border border-gray-250 hover:bg-gray-50 rounded-xl" onClick={() => openAllocationEditModal(allocation)}>
                                                         <Pencil size={13} />
                                                     </Button>
                                                 )}
                                            </div>
                                        </div>

                                        <div className="h-2.5 rounded-full bg-gray-150 overflow-hidden mb-2">
                                            <div className="h-full bg-aidwise-blue transition-all" style={{ width: `${allocation.allocationPercent}%` }} />
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                                            <span>Raised: {formatRM(allocation.allocationRaised)}</span>
                                            <span>Remaining: {formatRM(allocation.remainingAmount)}</span>
                                        </div>
                                    </div>
                                ))}

                                {surplusAmount > 0.01 && (
                                    <div className="p-5 border border-amber-100 rounded-2xl bg-amber-50/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-amber-800 text-sm">General Campaign Surplus</h4>
                                                <p className="text-xs text-amber-600/80 font-semibold">Overflow donations outside allocation caps</p>
                                            </div>
                                            <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-lg">
                                                Unallocated
                                            </span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-amber-100 overflow-hidden mb-2">
                                            <div className="h-full bg-amber-500" style={{ width: '100%' }} />
                                        </div>
                                        <div className="text-xs text-amber-700 font-bold">
                                            Surplus Available: {formatRM(surplusAmount)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                )}

                {/* Tab: Donations Ledger */}
                {activeTab === 'donations' && (
                    <Card className="p-0 overflow-hidden border border-gray-100 animate-fade-in">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <HandHeart className="text-aidwise-blue" size={20} />
                                <h3 className="font-bold text-aidwise-text">Donations Ledger</h3>
                            </div>
                            <Button 
                                variant="secondary" 
                                className="flex items-center gap-2 border-gray-250 hover:bg-gray-50 text-xs py-2 px-3 rounded-xl shadow-apple-sm shrink-0"
                                onClick={handleExportDonationsCSV}
                                disabled={donations.length === 0}
                            >
                                <Download size={14} /> Export CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-aidwise-text">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Donor</th>
                                        <th className="px-5 py-3">Allocation Sub-goal</th>
                                        <th className="px-5 py-3">Payment Method</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {donations.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-5 py-12 text-center text-gray-400 font-medium">No donations recorded yet.</td>
                                        </tr>
                                    ) : (
                                        donations.map((donation) => (
                                            <tr key={donation.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openDonorModal(donation.user_id || donation.user?.id)}
                                                        className="font-bold text-aidwise-blue hover:underline cursor-pointer text-left focus:outline-none"
                                                    >
                                                        {donation.donor_name || donation.user?.name || 'Anonymous'}
                                                    </button>
                                                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{donation.created_at ? formatDate(donation.created_at) : '—'}</div>
                                                </td>
                                                <td className="px-5 py-4 text-gray-600 font-semibold text-xs capitalize">
                                                    {donation.allocation?.purpose || 'General'}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600 font-semibold text-xs capitalize">
                                                    {donation.payment_method || '—'}
                                                </td>
                                                <td className="px-5 py-4 text-right font-extrabold text-aidwise-text">
                                                    {formatRM(donation.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Tab: Disbursements Trail */}
                {activeTab === 'disbursements' && (
                    <Card className="p-0 overflow-hidden border border-gray-100 animate-fade-in">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <ListOrdered className="text-aidwise-blue" size={20} />
                            <h3 className="font-bold text-aidwise-text">Disbursement Payout Trail</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-aidwise-text">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Request Date</th>
                                        <th className="px-5 py-3">Purpose / Allocations</th>
                                        <th className="px-5 py-3 text-right">Requested Amount</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                        <th className="px-5 py-3">Audit Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {disbursements.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-5 py-12 text-center text-gray-400 font-medium">No disbursements recorded yet.</td>
                                        </tr>
                                    ) : (
                                        disbursements.map((disbursement) => (
                                            <tr key={disbursement.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-5 py-4 text-gray-500 font-semibold text-xs whitespace-nowrap">
                                                    {disbursement.created_at ? formatDate(disbursement.created_at) : '—'}
                                                </td>
                                                <td className="px-5 py-4 text-gray-700 font-bold text-xs capitalize">
                                                    {disbursement.purpose}
                                                </td>
                                                <td className="px-5 py-4 text-right font-extrabold text-aidwise-text">
                                                    {formatRM(disbursement.amount)}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <Badge status={disbursement.status || 'pending'} />
                                                </td>
                                                <td className="px-5 py-4 text-gray-400 font-medium text-xs leading-normal">
                                                    {disbursement.status === 'rejected' && disbursement.rejection_reason ? (
                                                        <span className="text-red-500 font-semibold">Rejected: {disbursement.rejection_reason}</span>
                                                    ) : (
                                                        disbursement.details || '—'
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal: Edit Campaign Details */}
            <Modal isOpen={isCampaignModalOpen} onClose={closeCampaignModal} title="Edit Campaign Details">
                <form onSubmit={handleCampaignSubmit}>
                    {campaignErrors.global && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {campaignErrors.global}
                        </div>
                    )}
                    <Input
                        label="Campaign Title"
                        type="text"
                        name="title"
                        value={campaignForm.title}
                        onChange={handleCampaignChange}
                        placeholder="Campaign name"
                        required
                        error={resolveError(campaignErrors.title)}
                    />
                    <Textarea
                        label="Campaign Description"
                        name="description"
                        value={campaignForm.description}
                        onChange={handleCampaignChange}
                        placeholder="Describe your campaign"
                        required
                        error={resolveError(campaignErrors.description)}
                    />
                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSavingCampaign}>
                        {isSavingCampaign ? 'Saving...' : 'Update Campaign'}
                    </Button>
                </form>
            </Modal>

            {/* Modal: Edit Sub-goal Allocation */}
            <Modal
                isOpen={isAllocationModalOpen}
                onClose={closeAllocationModal}
                title={activeAllocation ? 'Edit Allocation' : 'Create Allocation'}
            >
                <form onSubmit={handleAllocationSubmit}>
                    {allocationErrors.global && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {allocationErrors.global}
                        </div>
                    )}
                    <Input
                        label="Purpose"
                        type="text"
                        name="purpose"
                        value={allocationForm.purpose}
                        onChange={handleAllocationChange}
                        placeholder="e.g., Medical supplies"
                        required
                        error={resolveError(allocationErrors.purpose)}
                    />
                    <Input
                        label="Target Amount (RM)"
                        type="number"
                        name="amount"
                        value={allocationForm.amount}
                        onChange={handleAllocationChange}
                        placeholder="e.g., 1500"
                        min="1"
                        step="0.01"
                        required
                        disabled={!!activeAllocation}
                        error={resolveError(allocationErrors.amount)}
                    />
                    {activeAllocation && (
                        <p className="text-xs text-gray-400 mt-1 mb-2">
                            The allocation amount is locked and cannot be changed after creation.
                        </p>
                    )}
                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSavingAllocation}>
                        {isSavingAllocation ? 'Saving...' : activeAllocation ? 'Update Allocation' : 'Create Allocation'}
                    </Button>
                </form>
            </Modal>

            {/* Modal: Edit Campaign Cover Images */}
            <Modal isOpen={isImagesModalOpen} onClose={closeImagesModal} title="Edit Campaign Images">
                <form onSubmit={handleImagesSubmit} className="space-y-4">
                    {imagesErrors.global && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {imagesErrors.global}
                        </div>
                    )}

                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-150 rounded-xl">
                         <input 
                             type="checkbox"
                             id="useDefaultImageUpdate"
                             checked={useDefaultImage}
                             onChange={(e) => toggleUseDefaultImage(e.target.checked)}
                             className="h-4 w-4 text-aidwise-blue focus:ring-aidwise-blue border-gray-300 rounded"
                         />
                         <label htmlFor="useDefaultImageUpdate" className="text-sm font-semibold text-aidwise-text cursor-pointer select-none">
                             Use Default Campaign Image
                         </label>
                    </div>

                    {!useDefaultImage && (
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Upload New Images (Max 5)
                            </label>
                            <input 
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    const filesArray = Array.from(e.target.files);
                                    if (filesArray.length > 5) {
                                        alert("You can select up to 5 images.");
                                        return;
                                    }
                                    setImages(filesArray);
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-aidwise-blue/5 file:text-aidwise-blue hover:file:bg-aidwise-blue/10 transition-all border border-gray-200 rounded-xl p-2 bg-white"
                            />
                            {images.length > 0 && (
                                <div className="text-xs text-gray-500 pt-1">
                                    Selected: {images.map(f => f.name).join(', ')}
                                </div>
                            )}
                            {imagesErrors.images && (
                                <div className="text-xs text-red-500 font-medium">
                                    {resolveError(imagesErrors.images)}
                                </div>
                            )}
                        </div>
                    )}

                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSavingImages}>
                        {isSavingImages ? 'Saving...' : 'Update Images'}
                    </Button>
                </form>
            </Modal>
        </DashboardLayout>

        {/* Donor Profile Detail modal */}
        <DonorProfileView
            isOpen={donorModal.open}
            onClose={closeDonorModal}
            donorId={donorModal.donorId}
        />
    </>
    );
};

export default NgoCampaignDetails;
