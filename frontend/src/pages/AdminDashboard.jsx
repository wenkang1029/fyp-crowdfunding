import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { getAdminDashboard } from '../services/dashboardService';
import { DollarSign, Megaphone, Users, ShieldAlert, ArrowRight, Activity, Wallet, Calendar, CheckCircle } from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await getAdminDashboard();
            setData(res);
        } catch {
            setError('Failed to load system dashboard overview.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aidwise-blue"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-red-500 font-semibold">{error || 'Something went wrong.'}</div>
            </DashboardLayout>
        );
    }

    const { metrics, recent_donations = [], recent_campaigns = [], recent_disbursements = [] } = data;

    // --- Chart Data ---
    const userChartData = {
        labels: ['Donors', 'NGOs', 'Admins'],
        datasets: [
            {
                data: [metrics.users.donors, metrics.users.ngos, metrics.users.total - metrics.users.donors - metrics.users.ngos],
                backgroundColor: ['#22c55e', '#2563eb', '#a855f7'],
                borderColor: '#ffffff',
                borderWidth: 2,
            }
        ]
    };

    const userChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { family: 'Inter', weight: 'bold' },
                    usePointStyle: true,
                    padding: 15
                }
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto font-sans">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text">System Overview</h1>
                    <p className="mt-1 text-gray-500 text-sm">Real-time indicators, financial metrics, and operational performance.</p>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Total Funds Raised" 
                        value={`RM ${metrics.financials.total_funds_raised.toLocaleString()}`} 
                        icon={DollarSign} 
                    />
                    <StatCard 
                        title="Active Campaigns" 
                        value={metrics.campaigns.active} 
                        icon={Megaphone} 
                    />
                    <StatCard 
                        title="Total Platform Users" 
                        value={metrics.users.total} 
                        icon={Users} 
                    />
                    <StatCard 
                        title="Pending Moderation" 
                        value={metrics.campaigns.pending_approval} 
                        icon={ShieldAlert} 
                        className={metrics.campaigns.pending_approval > 0 ? "border-amber-200 bg-amber-50/10" : ""}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* User Breakdown Chart */}
                    <Card className="lg:col-span-1 flex flex-col p-6 border-aidwise-border shadow-apple">
                        <h3 className="text-md font-bold text-aidwise-text mb-4">User Distribution</h3>
                        <div className="relative flex-1 min-h-[220px]">
                            <Doughnut data={userChartData} options={userChartOptions} />
                        </div>
                    </Card>

                    {/* Quick Administrative Controls */}
                    <Card className="lg:col-span-2 flex flex-col p-6 border-aidwise-border shadow-apple justify-between">
                        <div>
                            <h3 className="text-md font-bold text-aidwise-text mb-2">Quick Tasks</h3>
                            <p className="text-xs text-gray-400 mb-6">Instantly access specific management panels to complete administrative moderation duties.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div 
                                onClick={() => navigate('/admin/campaigns')}
                                className="group p-4 bg-gray-50 border border-gray-100 hover:border-aidwise-blue hover:bg-aidwise-blue/5 rounded-2xl cursor-pointer transition-all duration-200"
                            >
                                <Megaphone className="text-gray-400 group-hover:text-aidwise-blue transition-colors mb-3" size={24} />
                                <h4 className="font-bold text-sm text-aidwise-text group-hover:text-aidwise-blue transition-colors">Campaign approvals</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Review pending NGO campaign targets.</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-aidwise-blue font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Manage <ArrowRight size={10} />
                                </span>
                            </div>

                            <div 
                                onClick={() => navigate('/admin/users')}
                                className="group p-4 bg-gray-50 border border-gray-100 hover:border-aidwise-blue hover:bg-aidwise-blue/5 rounded-2xl cursor-pointer transition-all duration-200"
                            >
                                <Users className="text-gray-400 group-hover:text-aidwise-blue transition-colors mb-3" size={24} />
                                <h4 className="font-bold text-sm text-aidwise-text group-hover:text-aidwise-blue transition-colors">User Management</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Add accounts, lock profiles or view credentials.</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-aidwise-blue font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Manage <ArrowRight size={10} />
                                </span>
                            </div>

                            <div 
                                onClick={() => navigate('/admin/disbursements')}
                                className="group p-4 bg-gray-50 border border-gray-100 hover:border-aidwise-blue hover:bg-aidwise-blue/5 rounded-2xl cursor-pointer transition-all duration-200"
                            >
                                <Wallet className="text-gray-400 group-hover:text-aidwise-blue transition-colors mb-3" size={24} />
                                <h4 className="font-bold text-sm text-aidwise-text group-hover:text-aidwise-blue transition-colors">Payout Requests</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Release funds held in escrow to connects.</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-aidwise-blue font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Manage <ArrowRight size={10} />
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Platform Activity Streams */}
                <h3 className="text-lg font-bold text-aidwise-text mb-4 flex items-center gap-2">
                    <Activity className="text-aidwise-blue" size={20} />
                    Live Activity Streams
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Activity Column: Recent Campaigns */}
                    <Card className="p-5 border-aidwise-border shadow-apple-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-aidwise-text">New Campaigns</h4>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Submissions</span>
                        </div>
                        <div className="space-y-4">
                            {recent_campaigns.length === 0 ? (
                                <p className="text-xs text-gray-400 italic py-4">No recent campaign submissions.</p>
                            ) : (
                                recent_campaigns.map((camp) => (
                                    <div key={camp.id} className="p-3 bg-gray-55/40 border border-gray-100/50 rounded-xl space-y-1 hover:shadow-apple-sm transition-all">
                                        <p className="font-bold text-xs text-aidwise-text truncate" title={camp.title}>{camp.title}</p>
                                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                                            <span>{camp.user?.name}</span>
                                            <span className="font-semibold">{new Date(camp.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Activity Column: Recent Donations */}
                    <Card className="p-5 border-aidwise-border shadow-apple-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-aidwise-text">Successful Donations</h4>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Settled</span>
                        </div>
                        <div className="space-y-4">
                            {recent_donations.length === 0 ? (
                                <p className="text-xs text-gray-400 italic py-4">No recent donations processed.</p>
                            ) : (
                                recent_donations.map((donation) => (
                                    <div key={donation.id} className="p-3 bg-gray-55/40 border border-gray-100/50 rounded-xl hover:shadow-apple-sm transition-all flex items-center justify-between">
                                        <div className="min-w-0 pr-2">
                                            <p className="font-bold text-xs text-aidwise-text truncate">{donation.donor_name}</p>
                                            <p className="text-[9px] text-gray-400 truncate" title={donation.campaign?.title}>{donation.campaign?.title}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-extrabold text-xs text-green-600">+RM {Number(donation.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                            <p className="text-[9px] text-gray-400">{new Date(donation.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Activity Column: Recent Disbursements */}
                    <Card className="p-5 border-aidwise-border shadow-apple-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-aidwise-text">Escrow Releases</h4>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Payouts</span>
                        </div>
                        <div className="space-y-4">
                            {recent_disbursements.length === 0 ? (
                                <p className="text-xs text-gray-400 italic py-4">No disbursements requests filed.</p>
                            ) : (
                                recent_disbursements.map((disb) => (
                                    <div key={disb.id} className="p-3 bg-gray-55/40 border border-gray-100/50 rounded-xl hover:shadow-apple-sm transition-all space-y-1.5">
                                        <div className="flex justify-between items-start gap-1">
                                            <p className="font-bold text-xs text-aidwise-text truncate" title={disb.purpose}>{disb.purpose}</p>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border capitalize ${
                                                disb.status === 'approved' 
                                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                                    : disb.status === 'pending'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-250'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {disb.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                                            <span>NGO: {disb.campaign?.user?.name || 'NGO'}</span>
                                            <span className="font-extrabold text-gray-700">RM {Number(disb.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;