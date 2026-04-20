import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import axiosInstance from '../api/axios';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axiosInstance.get('/campaigns');
            const data = response.data.data || response.data;
            setCampaigns(data);
        } catch (err) {
            setError('Failed to load campaigns.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await axiosInstance.patch(`/campaigns/${id}`, { status: newStatus });
            
            // Optimistic UI Update
            setCampaigns(campaigns.map(camp => 
                camp.id === id ? { ...camp, status: newStatus } : camp
            ));
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">System Administration</h1>
                    <p className="mt-1 text-gray-500">Review and moderate NGO campaigns.</p>
                </div>

                <Card className="overflow-hidden p-0">
                    <div className="p-6 border-b border-aidwise-border flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-bold text-aidwise-text">Pending Campaigns</h3>
                        {error && <span className="text-sm text-red-500">{error}</span>}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-aidwise-text">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-aidwise-border">
                                <tr>
                                    <th className="px-6 py-4">Campaign Details</th>
                                    <th className="px-6 py-4">NGO Name</th>
                                    <th className="px-6 py-4">Target ($)</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-aidwise-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading campaigns...</td>
                                    </tr>
                                ) : campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400 flex flex-col items-center">
                                            <AlertCircle className="mb-2 opacity-50" size={24} />
                                            No campaigns found in the system.
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map((camp) => (
                                        <tr key={camp.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-aidwise-text">{camp.title}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{camp.description}</p>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600">
                                                {camp.user?.name || 'Unknown NGO'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-aidwise-blue">
                                                ${Number(camp.target_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge status={camp.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {(camp.status === 'pending' || !camp.status) ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleUpdateStatus(camp.id, 'active')}
                                                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                            title="Approve Campaign"
                                                        >
                                                            <CheckCircle size={20} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(camp.id, 'rejected')}
                                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Reject Campaign"
                                                        >
                                                            <XCircle size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Action Taken</span>
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
        </DashboardLayout>
    );
};

export default AdminDashboard;