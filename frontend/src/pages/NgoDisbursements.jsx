import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge'; // Required for HCI feedback
import { useNgoDisbursements } from '../hooks/useNgoDisbursements';
import { Wallet, ArrowDownRight, ArrowUpRight, PieChart, ListOrdered, Plus } from 'lucide-react';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const NgoDisbursements = () => {
    const {
        dashboardData,
        isLoading,
        error,
        isModalOpen,
        campaigns,
        isSubmitting,
        formError,
        formData,
        selectedAllocations,
        setSelectedAllocations,
        handleOpenModal,
        closeModal,
        handleFieldChange,
        handleSubmitRequest,
    } = useNgoDisbursements();

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
    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    const doughnutChartData = {
        labels: chart_data.map(item => item.purpose.charAt(0).toUpperCase() + item.purpose.slice(1)), // Capitalize labels
        datasets: [
            {
                data: chart_data.map(item => item.total_amount),
                backgroundColor: [
                    '#3b82f6', // AidWise Blue
                    '#10b981', // Emerald Green
                    '#f59e0b', // Amber
                    '#8b5cf6', // Violet
                    '#ec4899', // Pink
                    '#64748b', // Slate
                ],
                borderWidth: 0, // Clean Apple-style look without borders
                hoverOffset: 4
            }
        ]
    };

    const chartOptions = {
        cutout: '70%', // Makes it a sleek doughnut instead of a solid pie
        plugins: {
            legend: { display: false } // We will keep our custom HTML legend below it
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Fund Management</h1>
                        <p className="mt-1 text-gray-500">Track your financial disbursements and utilization breakdown.</p>
                    </div>
                    <Button onClick={handleOpenModal} variant="primary" className="flex items-center gap-2">
                        <Plus size={18} /> Record Payout
                    </Button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Raised" value={formatRM(metrics.total_funds_raised)} icon={ArrowUpRight} />
                    <StatCard title="Total Disbursed" value={formatRM(metrics.total_funds_disbursed)} icon={ArrowDownRight} />
                    <StatCard title="Remaining Balance" value={formatRM(metrics.remaining_balance)} icon={Wallet} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card className="h-full p-0 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                                <PieChart className="text-aidwise-blue" size={20} />
                                <h3 className="font-bold text-aidwise-text">Utilization Breakdown</h3>
                            </div>
                            <div className="p-6 flex flex-col items-center justify-center">
                                {chart_data.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-12">No approved disbursements yet.</p>
                                ) : (
                                    <>
                                        {/* The Actual Visual Chart */}
                                        <div className="w-48 h-48 mb-6 relative">
                                            <Doughnut data={doughnutChartData} options={chartOptions} />
                                            {/* Center Text in the Doughnut */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total</span>
                                                <span className="text-sm font-bold text-aidwise-blue">
                                                    {formatRM(metrics.total_funds_disbursed)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* The Custom Legend (Your original list, styled to match the chart) */}
                                        <ul className="w-full space-y-3">
                                            {chart_data.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span 
                                                            className="w-3 h-3 rounded-full" 
                                                            style={{ backgroundColor: doughnutChartData.datasets[0].backgroundColor[index % 6] }}
                                                        ></span>
                                                        <span className="font-medium text-gray-600 capitalize">{item.purpose}</span>
                                                    </div>
                                                    <span className="font-bold text-aidwise-text">{formatRM(item.total_amount)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>

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
                                            <th className="px-5 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recent_activity.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-5 py-8 text-center text-gray-400">No disbursements recorded yet.</td>
                                            </tr>
                                        ) : (
                                            recent_activity.map((activity) => (
                                                <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDate(activity.created_at)}</td>
                                                    <td className="px-5 py-4 font-medium text-aidwise-text truncate max-w-[200px]">{activity.campaign?.title || 'Unknown'}</td>
                                                    <td className="px-5 py-4 text-gray-600 capitalize">{activity.purpose}</td>
                                                    <td className="px-5 py-4 font-bold text-blue-600 text-right whitespace-nowrap">{formatRM(activity.amount)}</td>
                                                    <td className="px-5 py-4 text-center">
                                                        <Badge status={activity.status || 'pending'} />
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Record Payout">
                <form onSubmit={handleSubmitRequest}>
                    {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{formError}</div>}
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-aidwise-text">Select Campaign</label>
                        <select 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                            value={formData.campaign_id}
                            onChange={(e) => {
                                handleFieldChange('campaign_id', e.target.value);
                                setSelectedAllocations([]);
                            }}
                            required
                        >
                            {campaigns.length === 0 && <option value="" disabled>No active campaigns available</option>}
                            {campaigns.map(camp => (
                                <option key={camp.id} value={camp.id}>{camp.title}</option>
                            ))}
                        </select>
                    </div>
                    <Input 
                        label="Amount to Withdraw (RM)" type="number" min="1" placeholder="e.g. 500"
                        value={formData.amount} onChange={(e) => handleFieldChange('amount', e.target.value)} required
                    />
                    
                    {(() => {
                        const selectedCampaignObj = campaigns.find(camp => String(camp.id) === String(formData.campaign_id));
                        return (
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-semibold text-aidwise-text">Purpose of Funds (Select allocations)</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    {selectedCampaignObj?.allocations?.map((alloc) => (
                                        <label key={alloc.id} className="flex items-center gap-2 text-sm text-aidwise-text cursor-pointer hover:bg-gray-100/50 p-1.5 rounded transition-colors select-none font-medium">
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
                                    <label className="flex items-center gap-2 text-sm text-amber-600 font-bold cursor-pointer hover:bg-gray-100/50 p-1.5 rounded transition-colors select-none">
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
                        );
                    })()}

                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-semibold text-aidwise-text">Disbursement Details</label>
                        <textarea
                            name="details"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue text-sm h-20 resize-none"
                            placeholder="Provide specific details about this disbursement (e.g. supplier invoice or volunteer run)..."
                            value={formData.details || ''}
                            onChange={(e) => handleFieldChange('details', e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSubmitting}>
                        {isSubmitting ? 'Recording...' : 'Record Payout'}
                    </Button>
                </form>
            </Modal>
        </DashboardLayout>
    );


};

export default NgoDisbursements;