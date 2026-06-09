import React from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { useNgoCampaignDetails } from '../hooks/useNgoCampaignDetails';
import { ArrowLeft, ListOrdered, Wallet, HandHeart, PieChart, Pencil } from 'lucide-react';

const NgoCampaignDetails = () => {
    const { id } = useParams();
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
    } = useNgoCampaignDetails(id);

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

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div className="space-y-2">
                        <Link to="/ngo/campaigns" className="inline-flex items-center text-sm text-gray-500 hover:text-aidwise-blue">
                            <ArrowLeft size={16} className="mr-2" /> Back to Campaigns
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge status={campaign.status} />
                            <span className="text-xs text-gray-500">Created {campaign.created_at ? formatDate(campaign.created_at) : '—'}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">{campaign.title}</h1>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{campaign.description || 'No description available.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" className="flex items-center gap-2" onClick={openCampaignModal}>
                            <Pencil size={16} /> Edit Campaign Details
                        </Button>
                    </div>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border border-gray-100 lg:col-span-3">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-aidwise-text">
                                <Wallet size={17} className="text-aidwise-blue" />
                                Funding Progress
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-right sm:min-w-[420px]">
                                <div>
                                    <div className="text-[11px] font-semibold uppercase text-gray-400">Raised</div>
                                    <div className="text-sm font-bold text-aidwise-text">{formatRM(raisedAmount)}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold uppercase text-gray-400">Available</div>
                                    <div className="text-sm font-bold text-emerald-600">{formatRM(availableAmount)}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold uppercase text-gray-400">Target</div>
                                    <div className="text-sm font-bold text-aidwise-text">{formatRM(campaign.target_amount)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div>
                                <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 text-sm">
                                    <span className="font-semibold text-aidwise-text">Total Progress</span>
                                    <span className="text-gray-500">{formatRM(raisedAmount)}</span>
                                    <span className="w-12 text-right font-semibold text-aidwise-blue">{Math.round(raisedPercent)}%</span>
                                </div>
                                <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full flex">
                                        <div className="h-full bg-emerald-500" style={{ width: `${disbursedPercent}%` }}></div>
                                        <div className="h-full bg-aidwise-blue" style={{ width: `${Math.max(raisedPercent - disbursedPercent, 0)}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {allocationProgressItems.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
                                        No allocations recorded.
                                    </div>
                                ) : (
                                    allocationProgressItems.map((allocation) => (
                                        <div key={allocation.id}>
                                            <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 text-sm">
                                                <span className="truncate font-medium text-aidwise-text" title={allocation.purpose}>
                                                    {allocation.purpose}
                                                </span>
                                                <span className="hidden text-gray-500 sm:inline">
                                                    {formatRM(allocation.allocationRaised)} / {formatRM(allocation.allocationTarget)}
                                                </span>
                                                <span className="w-12 text-right font-semibold text-aidwise-blue">
                                                    {Math.round(allocation.allocationPercent)}%
                                                </span>
                                                <Button
                                                    variant="secondary"
                                                    className="px-2.5 py-2 text-xs flex items-center shadow-none"
                                                    onClick={() => openAllocationEditModal(allocation)}
                                                    title="Edit allocation"
                                                    aria-label="Edit allocation"
                                                >
                                                    <Pencil size={13} />
                                                </Button>
                                            </div>
                                            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full bg-aidwise-blue" style={{ width: `${allocation.allocationPercent}%` }}></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-gray-100">
                        <div className="text-sm text-gray-500">Activity summary</div>
                        <div className="mt-4 space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2">
                                    <HandHeart size={14} className="text-aidwise-blue" /> Donations
                                </span>
                                <span className="font-semibold text-aidwise-text">{donations.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2">
                                    <PieChart size={14} className="text-aidwise-blue" /> Allocations
                                </span>
                                <span className="font-semibold text-aidwise-text">{allocations.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2">
                                    <ListOrdered size={14} className="text-aidwise-blue" /> Payouts
                                </span>
                                <span className="font-semibold text-aidwise-text">{disbursements.length}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                    <Card className="p-0 overflow-hidden border border-gray-100">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <HandHeart className="text-aidwise-blue" size={18} />
                            <h3 className="font-bold text-aidwise-text">Donation Details</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-aidwise-text">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Donor</th>
                                        <th className="px-5 py-3">Allocation</th>
                                        <th className="px-5 py-3">Method</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {donations.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-5 py-8 text-center text-gray-400">No donations recorded yet.</td>
                                        </tr>
                                    ) : (
                                        donations.map((donation) => (
                                            <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-aidwise-text">{donation.donor_name || donation.user?.name || 'Anonymous'}</div>
                                                    <div className="text-xs text-gray-400">{donation.created_at ? formatDate(donation.created_at) : '—'}</div>
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {donation.allocation?.purpose || 'General'}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600 capitalize">
                                                    {donation.payment_method || '—'}
                                                </td>
                                                <td className="px-5 py-4 text-right font-semibold text-aidwise-text">
                                                    {formatRM(donation.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <Card className="p-0 overflow-hidden border border-gray-100">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <ListOrdered className="text-aidwise-blue" size={18} />
                        <h3 className="font-bold text-aidwise-text">Disbursement Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-aidwise-text">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Purpose</th>
                                    <th className="px-5 py-3 text-right">Amount</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                    <th className="px-5 py-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {disbursements.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-8 text-center text-gray-400">No disbursements recorded yet.</td>
                                    </tr>
                                ) : (
                                    disbursements.map((disbursement) => (
                                        <tr key={disbursement.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                                                {disbursement.created_at ? formatDate(disbursement.created_at) : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 capitalize">
                                                {disbursement.purpose}
                                            </td>
                                            <td className="px-5 py-4 text-right font-semibold text-aidwise-text">
                                                {formatRM(disbursement.amount)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge status={disbursement.status || 'pending'} />
                                            </td>
                                            <td className="px-5 py-4 text-gray-500">
                                                {disbursement.rejection_reason || '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Modal isOpen={isCampaignModalOpen} onClose={closeCampaignModal} title="Edit Campaign">
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
                        error={resolveError(allocationErrors.amount)}
                    />
                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSavingAllocation}>
                        {isSavingAllocation ? 'Saving...' : activeAllocation ? 'Update Allocation' : 'Create Allocation'}
                    </Button>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default NgoCampaignDetails;
