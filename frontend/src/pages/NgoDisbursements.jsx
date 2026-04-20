import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import axiosInstance from '../api/axios';
import { Wallet, ArrowDownRight, ArrowUpRight, PieChart, ListOrdered } from 'lucide-react';

const NgoDisbursements = () => {
    // Initialize state mapping exactly to your Laravel controller's payload
    const [dashboardData, setDashboardData] = useState({ 
        metrics: {}, 
        chart_data: [], 
        recent_activity: [] 
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDisbursementData = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/ngo/disbursements');
                setDashboardData(response.data);
            } catch (err) {
                setError('Failed to load financial data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDisbursementData();
    }, []);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                </div>
            </DashboardLayout>
        );
    }

    const { metrics, chart_data, recent_activity } = dashboardData;

    // Helper to safely format currency
    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Helper to format dates
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Fund Management</h1>
                    <p className="mt-1 text-gray-500">Track your financial disbursements and utilization breakdown.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                {/* Top Level Financial Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Total Raised" 
                        value={formatRM(metrics.total_funds_raised)} 
                        icon={ArrowUpRight} 
                    />
                    <StatCard 
                        title="Total Disbursed" 
                        value={formatRM(metrics.total_funds_disbursed)} 
                        icon={ArrowDownRight} 
                    />
                    <StatCard 
                        title="Remaining Balance" 
                        value={formatRM(metrics.remaining_balance)} 
                        icon={Wallet} 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Disbursement Purpose Breakdown (chart_data) */}
                    <div className="lg:col-span-1">
                        <Card className="h-full p-0 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                                <PieChart className="text-aidwise-blue" size={20} />
                                <h3 className="font-bold text-aidwise-text">Utilization Breakdown</h3>
                            </div>
                            <div className="p-5">
                                {chart_data.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No data available yet.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {chart_data.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600 capitalize">{item.purpose}</span>
                                                <span className="text-sm font-bold text-aidwise-text">{formatRM(item.total_amount)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Recent Disbursements Table (recent_activity) */}
                    <div className="lg:col-span-2">
                        <Card className="h-full p-0 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                                <ListOrdered className="text-aidwise-blue" size={20} />
                                <h3 className="font-bold text-aidwise-text">Recent Payouts</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-aidwise-text">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Campaign</th>
                                            <th className="px-5 py-3">Purpose</th>
                                            <th className="px-5 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recent_activity.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-5 py-8 text-center text-gray-400">
                                                    No disbursements requested yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            recent_activity.map((activity) => (
                                                <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                                                        {formatDate(activity.created_at)}
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-aidwise-text truncate max-w-[200px]">
                                                        {activity.campaign?.title || 'Unknown'}
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-600 capitalize">
                                                        {activity.purpose}
                                                    </td>
                                                    <td className="px-5 py-4 font-bold text-blue-600 text-right whitespace-nowrap">
                                                        {formatRM(activity.amount)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default NgoDisbursements;