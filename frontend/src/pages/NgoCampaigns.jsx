import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { useNgoCampaigns } from '../hooks/useNgoCampaigns';
import { 
    ListOrdered, Plus, Wallet, PauseCircle, PlayCircle, Eye, 
    MoreVertical, Search, ArrowUpDown, SlidersHorizontal, AlertCircle 
} from 'lucide-react';

const NgoCampaigns = () => {
    const [statusModal, setStatusModal] = useState({ isOpen: false, campaign: null, nextStatus: null });
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const {
        campaigns,
        isLoading,
        error,
        statusUpdateId,
        successMessage,
        isPayoutModalOpen,
        payoutCampaign,
        payoutForm,
        payoutError,
        isPayoutSubmitting,
        selectedAllocations,
        setSelectedAllocations,
        handleStatusToggle,
        openPayoutModal,
        closePayoutModal,
        handlePayoutChange,
        handlePayoutSubmit,
    } = useNgoCampaigns();

    // Close action menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const getStatusActionLabel = (status, isUpdating) => {
        if (isUpdating) return 'Updating...';
        if (status === 'completed') return 'Resume Donations';
        if (status === 'active') return 'Pause Donations';
        if (status === 'rejected') return 'Rejected';
        return 'Awaiting Approval';
    };
    
    const openStatusModal = (campaign) => {
        const nextStatus = campaign.status === 'active' ? 'completed' : 'active';
        setStatusModal({ isOpen: true, campaign, nextStatus });
        setOpenMenuId(null); // Close dropdown
    };
    
    const closeStatusModal = () => setStatusModal({ isOpen: false, campaign: null, nextStatus: null });
    
    const confirmStatusChange = () => {
        if (!statusModal.campaign) return;
        handleStatusToggle(statusModal.campaign);
        closeStatusModal();
    };

    const handlePayoutClick = (campaign) => {
        openPayoutModal(campaign);
        setOpenMenuId(null); // Close dropdown
    };

    const statusModalTitle = statusModal.nextStatus === 'completed' ? 'Pause Donations' : 'Resume Donations';
    const statusModalMessage = statusModal.nextStatus === 'completed'
        ? 'Pausing will stop all new donations for this campaign. You can resume later.'
        : 'Resuming will allow donors to contribute to this campaign again.';

    // Filter and Sort campaigns
    const filteredCampaigns = campaigns
        .filter((campaign) => {
            // Tab filtering
            if (activeTab === 'active' && campaign.status !== 'active') return false;
            if (activeTab === 'pending' && campaign.status !== 'pending') return false;
            if (activeTab === 'completed' && campaign.status !== 'completed') return false;
            if (activeTab === 'rejected' && campaign.status !== 'rejected') return false;

            // Search filtering
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const titleMatch = campaign.title?.toLowerCase().includes(query);
                const descMatch = campaign.description?.toLowerCase().includes(query);
                return titleMatch || descMatch;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            }
            if (sortBy === 'oldest') {
                return new Date(a.created_at || 0) - new Date(b.created_at || 0);
            }
            if (sortBy === 'highest_goal') {
                return Number(b.target_amount || 0) - Number(a.target_amount || 0);
            }
            if (sortBy === 'progress') {
                const progressA = Number(a.current_amount || 0) / Math.max(Number(a.target_amount || 1), 1);
                const progressB = Number(b.current_amount || 0) / Math.max(Number(b.target_amount || 1), 1);
                return progressB - progressA;
            }
            return 0;
        });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Campaigns</h1>
                        <p className="mt-1 text-gray-500">Manage and monitor your fundraising campaigns, escrow releases, and target metrics.</p>
                    </div>
                    <Link to="/ngo/campaigns/create">
                        <Button variant="primary" className="flex items-center gap-2 shadow-apple-sm rounded-xl">
                            <Plus size={18} /> Create Campaign
                        </Button>
                    </Link>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                        {successMessage}
                    </div>
                )}

                {/* Segmented Tabs Control */}
                <div className="mb-6 flex border-b border-gray-200 overflow-x-auto scrollbar-none gap-2">
                    {[
                        { id: 'all', label: 'All Campaigns' },
                        { id: 'active', label: 'Active' },
                        { id: 'pending', label: 'Pending Approval' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'rejected', label: 'Rejected' },
                    ].map((tab) => {
                        const count = campaigns.filter(c => tab.id === 'all' ? true : c.status === tab.id).length;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setOpenMenuId(null);
                                }}
                                className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'border-aidwise-blue text-aidwise-blue'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    activeTab === tab.id 
                                        ? 'bg-blue-50 text-aidwise-blue' 
                                        : 'bg-gray-150 text-gray-400'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search & Sort Filtering Toolbar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-apple-sm">
                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-aidwise-blue text-aidwise-text"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-end">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                            <SlidersHorizontal size={14} />
                            <span>SORT BY</span>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-sm font-bold text-aidwise-text px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest_goal">Highest Target</option>
                            <option value="progress">Goal Progress %</option>
                        </select>
                    </div>
                </div>

                {/* Campaigns Ledger Card */}
                <Card className="p-0 overflow-hidden border border-gray-100">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <ListOrdered className="text-aidwise-blue" size={20} />
                        <h3 className="font-bold text-aidwise-text">Your Campaigns</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-aidwise-text">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-4 w-3/5">Campaign Details & Progress</th>
                                    <th className="px-5 py-4 w-1/5">Status</th>
                                    <th className="px-5 py-4 w-1/10">Created</th>
                                    <th className="px-5 py-4 w-1/10 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertCircle size={32} className="text-gray-300" />
                                                <p className="text-sm font-medium">No campaigns match the active filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-5 py-5">
                                                <div className="font-bold text-aidwise-text text-base">{campaign.title}</div>
                                                <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 max-w-2xl leading-relaxed">
                                                    {campaign.description || 'No description yet.'}
                                                </p>
                                                
                                                {/* Budget Stacked Indicators */}
                                                <div className="mt-4 max-w-xl">
                                                    {(() => {
                                                        const raisedAmount = Number(campaign.current_amount || 0);
                                                        const goalAmount = Math.max(Number(campaign.target_amount || 0), 1);
                                                        const disbursedAmount = Number(campaign.disbursed_amount || 0);
                                                        const raisedPercent = Math.min((raisedAmount / goalAmount) * 100, 100);
                                                        const disbursedPercent = Math.min((disbursedAmount / goalAmount) * 100, 100);
                                                        const availablePercent = Math.max(raisedPercent - disbursedPercent, 0);

                                                        return (
                                                            <>
                                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                                                    <span className="font-semibold">
                                                                        {formatRM(raisedAmount)} raised of {formatRM(campaign.target_amount)} goal
                                                                    </span>
                                                                    <span className="font-bold text-aidwise-blue">
                                                                        {Math.round(raisedPercent)}%
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-gray-150 overflow-hidden flex">
                                                                    <div
                                                                        className="h-full bg-emerald-500"
                                                                        style={{ width: `${disbursedPercent}%` }}
                                                                    ></div>
                                                                    <div
                                                                        className="h-full bg-aidwise-blue"
                                                                        style={{ width: `${availablePercent}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold tracking-wide mt-2 uppercase">
                                                                    <span className="text-emerald-600">
                                                                        {formatRM(disbursedAmount)} Withdrawn
                                                                    </span>
                                                                    <span className="text-aidwise-blue">
                                                                        {formatRM(raisedAmount - disbursedAmount)} In Escrow
                                                                    </span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            
                                            <td className="px-5 py-5 whitespace-nowrap">
                                                <Badge status={campaign.status} />
                                                {campaign.status === 'pending' && (
                                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                        Awaiting administrator verification.
                                                    </p>
                                                )}
                                            </td>
                                            
                                            <td className="px-5 py-5 text-gray-500 whitespace-nowrap text-xs font-semibold">
                                                {campaign.created_at ? formatDate(campaign.created_at) : '—'}
                                            </td>
                                            
                                            <td className="px-5 py-5 text-right relative" ref={openMenuId === campaign.id ? menuRef : null}>
                                                {/* Ellipsis Actions Toggle */}
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-aidwise-text transition-colors focus:outline-none"
                                                    aria-label="Toggle actions dropdown"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Custom Dropdown Menu */}
                                                {openMenuId === campaign.id && (
                                                    <div className="absolute right-5 mt-1.5 w-44 bg-white border border-gray-150 rounded-2xl shadow-apple p-1.5 z-30 animate-fade-in text-left">
                                                        <Link 
                                                            to={`/ngo/campaigns/${campaign.id}`}
                                                            onClick={() => setOpenMenuId(null)}
                                                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-aidwise-text rounded-lg transition-colors"
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </Link>
                                                        
                                                        {campaign.status === 'active' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePayoutClick(campaign)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-aidwise-text rounded-lg transition-colors"
                                                            >
                                                                <Wallet size={14} /> Record Payout
                                                            </button>
                                                        )}

                                                        {['active', 'completed'].includes(campaign.status) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openStatusModal(campaign)}
                                                                disabled={statusUpdateId === campaign.id}
                                                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                                                                    campaign.status === 'active' 
                                                                        ? 'text-red-500 hover:bg-red-50' 
                                                                        : 'text-emerald-600 hover:bg-emerald-50'
                                                                }`}
                                                            >
                                                                {campaign.status === 'active' ? (
                                                                    <>
                                                                        <PauseCircle size={14} /> Pause Campaign
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <PlayCircle size={14} /> Resume Campaign
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Campaign Pause/Resume Confirmation Modal */}
            <Modal isOpen={statusModal.isOpen} onClose={closeStatusModal} title={statusModalTitle}>
                <div className="text-sm text-gray-600 mb-6">
                    {statusModalMessage}
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" type="button" onClick={closeStatusModal}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant={statusModal.nextStatus === 'completed' ? 'danger' : 'primary'}
                        onClick={confirmStatusChange}
                        disabled={statusUpdateId === statusModal.campaign?.id}
                    >
                        {statusUpdateId === statusModal.campaign?.id ? 'Updating...' : statusModalTitle}
                    </Button>
                </div>
            </Modal>

            {/* Disbursement / Payout Request Modal */}
            <Modal isOpen={isPayoutModalOpen} onClose={closePayoutModal} title="Record Payout">
                <form onSubmit={handlePayoutSubmit}>
                    {payoutError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {payoutError}
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-aidwise-text">Amount to Withdraw (RM)</label>
                        <input
                            name="amount"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue font-semibold text-sm"
                            type="number"
                            min="1"
                            placeholder="e.g. 500"
                            value={payoutForm.amount}
                            onChange={handlePayoutChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-semibold text-aidwise-text">Purpose of Funds (Select allocations)</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 border border-gray-250 rounded-xl">
                            {payoutCampaign?.allocations?.map((alloc) => (
                                <label key={alloc.id} className="flex items-center gap-2 text-sm text-aidwise-text cursor-pointer hover:bg-gray-100/50 p-1.5 rounded-lg transition-colors select-none font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={selectedAllocations.includes(alloc.purpose)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedAllocations((prev) => [...prev, alloc.purpose]);
                                            } else {
                                                setSelectedAllocations((prev) => prev.filter((item) => item !== alloc.purpose));
                                            }
                                        }}
                                        className="h-4 w-4 text-aidwise-blue focus:ring-aidwise-blue border-gray-300 rounded"
                                    />
                                    {alloc.purpose} (Target: RM {Number(alloc.amount).toLocaleString()})
                                </label>
                            ))}
                            <label className="flex items-center gap-2 text-sm text-amber-600 font-bold cursor-pointer hover:bg-gray-100/50 p-1.5 rounded-lg transition-colors select-none">
                                <input
                                    type="checkbox"
                                    checked={selectedAllocations.includes('General Surplus')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedAllocations((prev) => [...prev, 'General Surplus']);
                                        } else {
                                            setSelectedAllocations((prev) => prev.filter((item) => item !== 'General Surplus'));
                                        }
                                    }}
                                    className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                                />
                                General Surplus
                            </label>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-semibold text-aidwise-text">Disbursement Details</label>
                        <textarea
                            name="details"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-255 rounded-xl text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue text-sm h-20 resize-none"
                            placeholder="Provide specific details about this disbursement (e.g. supplier invoice or volunteer run)..."
                            value={payoutForm.details || ''}
                            onChange={handlePayoutChange}
                            required
                        ></textarea>
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isPayoutSubmitting}>
                        {isPayoutSubmitting ? 'Recording...' : 'Record Payout'}
                    </Button>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default NgoCampaigns;
