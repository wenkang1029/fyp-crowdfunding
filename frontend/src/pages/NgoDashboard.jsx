import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Target, DollarSign, Users, TrendingUp, Calendar, ShieldAlert } from 'lucide-react';
import DonationLedger from '../components/ui/DonationLedger';
import { useNgoDashboardData } from '../hooks/useNgoDashboardData';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

    // --- Dynamic Chart Configuration ---
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: 'easeInOutQuart',
        },
        plugins: {
            legend: { 
                position: 'top', 
                labels: { 
                    font: { family: 'Inter', weight: '600', size: 12 }, 
                    color: '#374151',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20
                } 
            },
            tooltip: { 
                backgroundColor: '#1F2937', 
                padding: 12, 
                titleFont: { family: 'Inter', weight: 'bold', size: 13 },
                bodyFont: { family: 'Inter', size: 12 },
                cornerRadius: 12,
                boxPadding: 6,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: { 
                border: { display: false }, 
                grid: { color: '#F3F4F6' }, 
                ticks: { 
                    color: '#9CA3AF', 
                    font: { family: 'Inter', size: 11 },
                    callback: function(value) {
                        return 'RM ' + value.toLocaleString();
                    }
                } 
            },
            x: { 
                grid: { display: false }, 
                ticks: { 
                    color: '#9CA3AF', 
                    font: { family: 'Inter', size: 11 }, 
                    maxRotation: 30, 
                    minRotation: 30 
                } 
            }
        }
    };

    const chartData = {
        labels: campaigns.map(camp => camp.title), // Dynamic X-axis labels
        datasets: [
            {
                label: 'Target Amount (RM)',
                data: campaigns.map(camp => camp.target_amount),
                backgroundColor: 'rgba(229, 231, 235, 0.6)', 
                borderColor: '#D1D5DB',
                borderWidth: 1,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(209, 213, 219, 0.8)',
            },
            {
                label: 'Funds Raised (RM)',
                data: campaigns.map(camp => camp.current_amount || 0),
                backgroundColor: 'rgba(37, 99, 235, 0.85)', 
                borderColor: '#2563EB',
                borderWidth: 1,
                borderRadius: 8,
                hoverBackgroundColor: '#1D4ED8',
            },
        ],
    };

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

                {/* Dynamic Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Raised" value={`RM ${totalRaised.toLocaleString()}`} icon={DollarSign} />
                    <StatCard title="Total Campaigns" value={activeCampaigns} icon={Target} />
                    <StatCard title="Total Donors" value={donorCount.toString()} icon={Users} />
                    <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} />
                </div>

                {/* Main Bar Chart */}
                <Card className="flex flex-col mb-8">
                    <h3 className="text-lg font-bold text-aidwise-text mb-6">Campaign Funding Progress</h3>
                    
                    {/* HCI Empty State handling */}
                    {campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-gray-400">
                            <Target size={48} className="mb-4 opacity-20" />
                            <p>No campaigns yet. Click "Create New Campaign" to start.</p>
                        </div>
                    ) : (
                        <div className="relative flex-1 min-h-[300px]">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    )}
                </Card>

                {/* Place this below your existing charts and metric cards */}
                <DonationLedger />
            </div>
        </DashboardLayout>
    );
};

export default NgoDashboard;