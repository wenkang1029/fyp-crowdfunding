import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { useNgoCampaigns } from '../hooks/useNgoCampaigns';
import { ListOrdered, Plus, Wallet, PauseCircle, PlayCircle, Pencil, Eye } from 'lucide-react';

const NgoCampaigns = () => {
    const [statusModal, setStatusModal] = useState({ isOpen: false, campaign: null, nextStatus: null });
    const {
        campaigns,
        isLoading,
        error,
        isModalOpen,
        formData,
        formErrors,
        isSaving,
        statusUpdateId,
        successMessage,
        isPayoutModalOpen,
        payoutCampaign,
        payoutForm,
        payoutError,
        isPayoutSubmitting,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleStatusToggle,
        openPayoutModal,
        closePayoutModal,
        handlePayoutChange,
        handlePayoutSubmit,
    } = useNgoCampaigns();

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
    };
    const closeStatusModal = () => setStatusModal({ isOpen: false, campaign: null, nextStatus: null });
    const confirmStatusChange = () => {
        if (!statusModal.campaign) return;
        handleStatusToggle(statusModal.campaign);
        closeStatusModal();
    };
    const statusModalTitle = statusModal.nextStatus === 'completed' ? 'Pause Donations' : 'Resume Donations';
    const statusModalMessage = statusModal.nextStatus === 'completed'
        ? 'Pausing will stop all new donations for this campaign. You can resume later.'
        : 'Resuming will allow donors to contribute to this campaign again.';

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
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Campaigns</h1>
                        <p className="mt-1 text-gray-500">Manage your active fundraising campaigns.</p>
                    </div>
                    <Link to="/ngo/campaigns/create">
                        <Button variant="primary" className="flex items-center gap-2">
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

                <Card className="p-0 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <ListOrdered className="text-aidwise-blue" size={20} />
                        <h3 className="font-bold text-aidwise-text">Your Campaigns</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-aidwise-text">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3">Campaign</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Created</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-8 text-center text-gray-400">
                                            No campaigns created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-aidwise-text">{campaign.title}</div>
                                                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                                                    {campaign.description || 'No description yet.'}
                                                </p>
                                                <div className="mt-3">
                                                    {(() => {
                                                        const raisedAmount = Number(campaign.current_amount || 0);
                                                        const goalAmount = Math.max(Number(campaign.target_amount || 0), 1);
                                                        const disbursedAmount = Number(campaign.disbursed_amount || 0);
                                                        const raisedPercent = Math.min((raisedAmount / goalAmount) * 100, 100);
                                                        const disbursedPercent = Math.min((disbursedAmount / goalAmount) * 100, 100);
                                                        const availablePercent = Math.max(raisedPercent - disbursedPercent, 0);

                                                        return (
                                                            <>
                                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                                    <span>
                                                                        {formatRM(raisedAmount)} raised
                                                                    </span>
                                                                    <span>
                                                                        {formatRM(campaign.target_amount)} goal
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                                    <div className="h-full flex">
                                                                        <div
                                                                            className="h-full bg-emerald-500"
                                                                            style={{ width: `${disbursedPercent}%` }}
                                                                        ></div>
                                                                        <div
                                                                            className="h-full bg-aidwise-blue"
                                                                            style={{ width: `${availablePercent}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                                                    <span>
                                                                        {formatRM(disbursedAmount)} withdrawn
                                                                    </span>
                                                                    <span className="text-gray-400">
                                                                        Approved payouts
                                                                    </span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge status={campaign.status} />
                                                {campaign.status === 'pending' && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Awaiting admin review before donations go live.
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                                                {campaign.created_at ? formatDate(campaign.created_at) : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Link to={`/ngo/campaigns/${campaign.id}`}>
                                                        <Button
                                                            variant="secondary"
                                                            className="px-3 py-2 text-xs flex items-center"
                                                            title="View campaign"
                                                            aria-label="View campaign"
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                    </Link>
                                                    {campaign.status === 'active' && (
                                                        <Button
                                                            variant="secondary"
                                                            className="px-3 py-2 text-xs flex items-center"
                                                            onClick={() => openPayoutModal(campaign)}
                                                            title="Record payout"
                                                            aria-label="Record payout"
                                                        >
                                                            <Wallet size={14} />
                                                        </Button>
                                                    )}
                                                    {(() => {
                                                        const statusTooltip = ['pending', 'rejected'].includes(campaign.status)
                                                            ? 'Only active campaigns can be paused or resumed.'
                                                            : getStatusActionLabel(campaign.status, statusUpdateId === campaign.id);

                                                        return (
                                                    <Button
                                                        variant={campaign.status === 'active' ? 'danger' : 'secondary'}
                                                        className="px-3 py-2 text-xs flex items-center"
                                                        onClick={() => openStatusModal(campaign)}
                                                        disabled={
                                                            !['active', 'completed'].includes(campaign.status) ||
                                                            statusUpdateId === campaign.id
                                                        }
                                                        title={statusTooltip}
                                                        aria-label={statusTooltip}
                                                    >
                                                        {campaign.status === 'active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                                                    </Button>
                                                        );
                                                    })()}
                                                    <Button
                                                        variant="secondary"
                                                        className="px-3 py-2 text-xs flex items-center"
                                                        onClick={() => openEditModal(campaign)}
                                                        title="Edit campaign"
                                                        aria-label="Edit campaign"
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Campaign">
                <form onSubmit={handleSubmit}>
                    {formErrors.global && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {formErrors.global}
                        </div>
                    )}
                    <Input
                        label="Campaign Title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Campaign name"
                        required
                        error={formErrors.title?.[0]}
                    />
                    <Textarea
                        label="Campaign Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the campaign goals and impact"
                        required
                        error={formErrors.description?.[0]}
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="secondary" type="button" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Modal>

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

            <Modal isOpen={isPayoutModalOpen} onClose={closePayoutModal} title="Record Payout">
                <form onSubmit={handlePayoutSubmit}>
                    {payoutError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {payoutError}
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-aidwise-text">Campaign</label>
                        <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-aidwise-text">
                            {payoutCampaign?.title || 'Selected campaign'}
                        </div>
                    </div>
                    <Input
                        label="Amount to Withdraw (RM)"
                        type="number"
                        name="amount"
                        min="1"
                        placeholder="e.g. 500"
                        value={payoutForm.amount}
                        onChange={handlePayoutChange}
                        required
                    />
                    <Input
                        label="Purpose of Funds"
                        type="text"
                        name="purpose"
                        placeholder="e.g. Water filtration equipment"
                        value={payoutForm.purpose}
                        onChange={handlePayoutChange}
                        required
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="secondary" type="button" onClick={closePayoutModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isPayoutSubmitting}>
                            {isPayoutSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default NgoCampaigns;
