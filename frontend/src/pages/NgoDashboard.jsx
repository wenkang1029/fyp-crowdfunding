import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Target, DollarSign, Users, TrendingUp } from 'lucide-react';
import axiosInstance from '../api/axios';

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

    // Data States
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real data from Laravel on load
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axiosInstance.get('/campaigns');
                // Laravel often wraps data in a 'data' object if using Resources or Pagination
                const campaignData = response.data.data || response.data;
                setCampaigns(campaignData);
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- Dynamic Calculations (DRY Principle) ---
    // Note: We use Number() to ensure math works even if Laravel sends strings
    const activeCampaigns = campaigns.length; 
    const totalTarget = campaigns.reduce((sum, camp) => sum + Number(camp.target_amount), 0);
    const totalRaised = campaigns.reduce((sum, camp) => sum + Number(camp.current_amount || 0), 0);
    const completionRate = totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0;

    // --- Dynamic Chart Configuration ---
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { family: 'Inter', weight: '500' }, color: '#6B7280' } },
            tooltip: { backgroundColor: '#1D1D1F', padding: 12, cornerRadius: 8 }
        },
        scales: {
            y: { border: { display: false }, grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { family: 'Inter' } } },
            x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { family: 'Inter' }, maxRotation: 45, minRotation: 45 } }
        }
    };

    const chartData = {
        labels: campaigns.map(camp => camp.title), // Dynamic X-axis labels
        datasets: [
            {
                label: 'Target Amount ($)',
                data: campaigns.map(camp => camp.target_amount),
                backgroundColor: '#E5E7EB',
                borderRadius: 6,
            },
            {
                label: 'Funds Raised ($)',
                data: campaigns.map(camp => camp.current_amount || 0),
                backgroundColor: '#0066CC',
                borderRadius: 6,
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
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Overview</h1>
                    <p className="mt-1 text-gray-500">Welcome back, {user?.name}. Here is your real-time impact.</p>
                </div>

                {/* Dynamic Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Raised" value={`$${totalRaised.toLocaleString()}`} icon={DollarSign} />
                    <StatCard title="Total Campaigns" value={activeCampaigns} icon={Target} />
                    <StatCard title="Total Donors" value="0" icon={Users} /> {/* Hardcoded until we build the Donors API */}
                    <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Bar Chart */}
                    <Card className="lg:col-span-2 flex flex-col">
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

                    {/* Quick Actions */}
                    <Card>
                        <h3 className="text-lg font-bold text-aidwise-text mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/ngo/campaigns/create')}
                                className="w-full py-2.5 px-4 bg-aidwise-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-left flex items-center justify-between shadow-sm hover:shadow-apple"
                            >
                                <span>Create New Campaign</span>
                                <span>+</span>
                            </button>
                            <button className="w-full py-2.5 px-4 bg-gray-50 text-aidwise-text border border-gray-200 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-left flex items-center justify-between">
                                <span>Download Reports (PDF)</span>
                                <span>↓</span>
                            </button>
                        </div>
                    </Card>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default NgoDashboard;