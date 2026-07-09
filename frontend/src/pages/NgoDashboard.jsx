import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { Target, DollarSign, Users, TrendingUp, Calendar, ShieldAlert, Plus, Wallet, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import DonationLedger from '../components/ui/DonationLedger';
import { useNgoDashboardData } from '../hooks/useNgoDashboardData';

const NgoDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        campaigns,
        donorCount,
        isLoading,
        activeCampaigns,
        totalRaised,
        completionRate,
    } = useNgoDashboardData();

    const [campaignPage, setCampaignPage] = useState(1);
    const CAMPAIGNS_PER_PAGE = 4;

    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const totalCampaignPages = Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE);
    const paginatedCampaigns = campaigns.slice(
        (campaignPage - 1) * CAMPAIGNS_PER_PAGE,
        campaignPage * CAMPAIGNS_PER_PAGE
    );

    // HCI: Loading State
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aidwise-blue"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text">Overview</h1>
                        <p className="mt-1 text-gray-500 text-sm">Welcome back, <span className="font-semibold text-aidwise-blue">{user?.name}</span>. Here is your real-time platform impact.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-apple-sm text-gray-500 shrink-0 font-medium">
                        <Calendar size={14} className="text-aidwise-blue" />
                        <span>Today is {new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Stripe Connection Call to Action Banner */}
                {!user?.stripe_onboarding_completed && (
                    <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50/20 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fade-in">
                        <div className="flex items-start gap-3.5">
                            <div className="bg-amber-100 text-amber-700 p-2.5 rounded-xl mt-0.5 shrink-0">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm md:text-base">Stripe Payment Account Required</h4>
                                <p className="text-amber-700/85 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
                                    To accept direct public contributions securely via credit card, you must link your organisation's financial account with Stripe. Setup takes less than 5 minutes.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    const { getStripeConnectUrl } = await import('../services/authService');
                                    const response = await getStripeConnectUrl();
                                    if (response.success && response.url) {
                                        window.location.href = response.url;
                                    } else {
                                        alert(response.message || 'Failed to retrieve connection link.');
                                    }
                                } catch (err) {
                                    alert('Failed to connect to Stripe service. Please try again.');
                                }
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap text-xs md:text-sm"
                        >
                            💳 Set Up Stripe Account
                        </button>
                    </div>
                )}

                {/* Quick Actions Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <Link to="/ngo/campaigns/create" className="group p-5 bg-white border border-gray-100 rounded-2xl shadow-apple-sm hover:shadow-apple transition-all duration-300 flex items-center gap-4 hover:scale-[1.01]">
                        <div className="p-3 bg-blue-50 text-aidwise-blue rounded-xl group-hover:bg-aidwise-blue group-hover:text-white transition-all duration-300">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-aidwise-text text-sm group-hover:text-aidwise-blue transition-colors">Launch Campaign</h4>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Start a new fundraising project</p>
                        </div>
                    </Link>
                    
                    <Link to="/ngo/disbursements" className="group p-5 bg-white border border-gray-100 rounded-2xl shadow-apple-sm hover:shadow-apple transition-all duration-300 flex items-center gap-4 hover:scale-[1.01]">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-aidwise-text text-sm group-hover:text-emerald-600 transition-colors">Record Payout</h4>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Disburse raised escrow funds</p>
                        </div>
                    </Link>

                    <Link to="/profile" className="group p-5 bg-white border border-gray-100 rounded-2xl shadow-apple-sm hover:shadow-apple transition-all duration-300 flex items-center gap-4 hover:scale-[1.01]">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-aidwise-text text-sm group-hover:text-purple-600 transition-colors">NGO Settings</h4>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Manage verification documents</p>
                        </div>
                    </Link>
                </div>

                {/* Dynamic Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Raised" value={`RM ${totalRaised.toLocaleString()}`} icon={DollarSign} trend={14.8} />
                    <StatCard title="Total Campaigns" value={activeCampaigns} icon={Target} />
                    <StatCard title="Total Donors" value={donorCount.toString()} icon={Users} trend={8.3} />
                    <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} trend={2.5} />
                </div>

                {/* Campaign Funding Progress: Option B (Horizontal stacked cards) */}
                <Card className="flex flex-col mb-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-aidwise-text">Campaign Funding Progress</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Real-time breakdown of escrow balances and disbursement cycles.</p>
                        </div>
                        <div className="flex gap-4 text-xs font-semibold text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span>Withdrawn (Used)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-aidwise-blue"></span>
                                <span>Available in Escrow</span>
                            </div>
                        </div>
                    </div>
                    
                    {campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Target size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">No campaigns created yet.</p>
                            <Link to="/ngo/campaigns/create" className="mt-3 text-xs font-bold text-aidwise-blue hover:underline">
                                Launch your first campaign now &rarr;
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {paginatedCampaigns.map((campaign) => {
                                    const raisedAmount = Number(campaign.current_amount || 0);
                                    const goalAmount = Math.max(Number(campaign.target_amount || 0), 1);
                                    const disbursedAmount = Number(campaign.disbursed_amount || 0);
                                    const raisedPercent = Math.min((raisedAmount / goalAmount) * 100, 100);
                                    const disbursedPercent = Math.min((disbursedAmount / goalAmount) * 100, 100);
                                    const availablePercent = Math.max(raisedPercent - disbursedPercent, 0);
                                    const availableAmount = Math.max(raisedAmount - disbursedAmount, 0);
                                    const remainingAmount = Math.max(goalAmount - raisedAmount, 0);

                                    return (
                                        <div key={campaign.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30 hover:bg-gray-50/70 transition-colors flex flex-col justify-between">
                                            <div className="mb-4">
                                                <div className="flex items-start justify-between gap-3 mb-1">
                                                    <h4 className="font-bold text-aidwise-text text-sm line-clamp-1" title={campaign.title}>
                                                        {campaign.title}
                                                    </h4>
                                                    <Badge status={campaign.status} />
                                                </div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                                    Goal: {formatRM(campaign.target_amount)}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between text-xs mb-2">
                                                    <span className="font-bold text-aidwise-blue">{Math.round(raisedPercent)}% Funded</span>
                                                    <span className="text-gray-500 font-medium">{formatRM(raisedAmount)} raised</span>
                                                </div>

                                                {/* Stacked Progress Bar */}
                                                <div className="h-3.5 rounded-full bg-gray-200/60 overflow-hidden flex mb-4">
                                                    <div 
                                                        className="h-full bg-emerald-500 transition-all duration-500" 
                                                        style={{ width: `${disbursedPercent}%` }}
                                                        title={`Withdrawn: ${formatRM(disbursedAmount)}`}
                                                    ></div>
                                                    <div 
                                                        className="h-full bg-aidwise-blue transition-all duration-500" 
                                                        style={{ width: `${availablePercent}%` }}
                                                        title={`Available Escrow: ${formatRM(availableAmount)}`}
                                                    ></div>
                                                </div>

                                                {/* Legend breakdown values */}
                                                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider border-t border-gray-100/80 pt-3">
                                                    <div>
                                                        <span className="block text-gray-400 mb-0.5">Withdrawn</span>
                                                        <span className="text-emerald-600 font-bold text-xs">{formatRM(disbursedAmount)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-gray-400 mb-0.5">Escrow Balance</span>
                                                        <span className="text-aidwise-blue font-bold text-xs">{formatRM(availableAmount)}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-gray-400 mb-0.5">Remaining</span>
                                                        <span className="text-gray-700 font-bold text-xs">{formatRM(remainingAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-100/50 flex justify-end">
                                                <Link 
                                                    to={`/ngo/campaigns/${campaign.id}`} 
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-aidwise-blue hover:text-blue-700 transition-colors"
                                                >
                                                    View Detailed Ledger <ArrowRight size={13} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalCampaignPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-6">
                                    <p className="text-xs text-gray-400 font-semibold">
                                        Showing {(campaignPage - 1) * CAMPAIGNS_PER_PAGE + 1}–{Math.min(campaignPage * CAMPAIGNS_PER_PAGE, campaigns.length)} of {campaigns.length} campaigns
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setCampaignPage(prev => Math.max(1, prev - 1))}
                                            disabled={campaignPage === 1}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-aidwise-blue hover:bg-blue-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 border border-gray-200"
                                        >
                                            <ChevronLeft size={14} /> Prev
                                        </button>
                                        
                                        {Array.from({ length: totalCampaignPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCampaignPage(page)}
                                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 ${
                                                    campaignPage === page
                                                        ? 'bg-aidwise-blue text-white shadow-sm'
                                                        : 'text-gray-500 hover:bg-blue-50/50 hover:text-aidwise-blue border border-gray-150'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => setCampaignPage(prev => Math.min(totalCampaignPages, prev + 1))}
                                            disabled={campaignPage === totalCampaignPages}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-aidwise-blue hover:bg-blue-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 border border-gray-200"
                                        >
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {/* Donation Ledger */}
                <DonationLedger />
            </div>
        </DashboardLayout>
    );
};

export default NgoDashboard;