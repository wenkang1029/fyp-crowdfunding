import React from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNgoCampaignDetails } from '../hooks/useNgoCampaignDetails';
import { ArrowLeft, ListOrdered, Wallet, HandHeart, PieChart } from 'lucide-react';

const NgoCampaignDetails = () => {
    const { id } = useParams();
    const { campaign, isLoading, error } = useNgoCampaignDetails(id);

    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

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

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <Link to="/ngo/campaigns" className="inline-flex items-center text-sm text-gray-500 hover:text-aidwise-blue">
                            <ArrowLeft size={16} className="mr-2" /> Back to Campaigns
                        </Link>
                    </div>
                </div>

                <Card className="mb-8 border border-gray-100 bg-gradient-to-br from-white via-white to-blue-50/60">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3">
                                <Badge status={campaign.status} />
                                <span className="text-xs text-gray-500">Created {campaign.created_at ? formatDate(campaign.created_at) : '—'}</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-aidwise-text mt-3">{campaign.title}</h1>
                            <p className="text-sm text-gray-600 leading-relaxed mt-3">{campaign.description || 'No description available.'}</p>
                        </div>
                        <div className="w-full max-w-sm rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Wallet size={18} className="text-aidwise-blue" />
                                Funding progress
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                    <span>{formatRM(raisedAmount)} raised</span>
                                    <span>{formatRM(campaign.target_amount)} goal</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full flex">
                                        <div className="h-full bg-emerald-500" style={{ width: `${disbursedPercent}%` }}></div>
                                        <div className="h-full bg-aidwise-blue" style={{ width: `${Math.max(raisedPercent - disbursedPercent, 0)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                    <span>{formatRM(disbursedAmount)} withdrawn</span>
                                    <span className="text-gray-400">Approved payouts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400">Donations</p>
                                <p className="text-2xl font-semibold text-aidwise-text mt-2">{donations.length}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <HandHeart size={18} className="text-aidwise-blue" />
                            </div>
                        </div>
                    </Card>
                    <Card className="border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400">Allocations</p>
                                <p className="text-2xl font-semibold text-aidwise-text mt-2">{allocations.length}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <PieChart size={18} className="text-aidwise-blue" />
                            </div>
                        </div>
                    </Card>
                    <Card className="border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400">Payouts</p>
                                <p className="text-2xl font-semibold text-aidwise-text mt-2">{disbursements.length}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <ListOrdered size={18} className="text-aidwise-blue" />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <Card className="p-0 overflow-hidden border border-gray-100">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <PieChart className="text-aidwise-blue" size={18} />
                            <h3 className="font-bold text-aidwise-text">Allocation Details</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-aidwise-text">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Purpose</th>
                                        <th className="px-5 py-3 text-right">Raised</th>
                                        <th className="px-5 py-3 text-right">Target</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allocations.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-5 py-8 text-center text-gray-400">No allocations recorded.</td>
                                        </tr>
                                    ) : (
                                        allocations.map((allocation) => {
                                            const allocationRaised = Number(allocation.current_amount || 0);
                                            const allocationTarget = Math.max(Number(allocation.amount || 0), 1);
                                            const allocationPercent = Math.min((allocationRaised / allocationTarget) * 100, 100);

                                            return (
                                                <tr key={allocation.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-aidwise-text">{allocation.purpose}</div>
                                                        <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                            <div className="h-full bg-aidwise-blue" style={{ width: `${allocationPercent}%` }}></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right text-gray-600">{formatRM(allocationRaised)}</td>
                                                    <td className="px-5 py-4 text-right text-gray-600">{formatRM(allocation.amount)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

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
        </DashboardLayout>
    );
};

export default NgoCampaignDetails;
