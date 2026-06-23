import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getCampaigns, updateCampaign, deleteCampaign } from '../services/campaignService';
import { CheckCircle, XCircle, Trash2, Megaphone, AlertCircle, Search, ShieldAlert } from 'lucide-react';

const AdminCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const data = await getCampaigns();
            setCampaigns(data);
        } catch {
            setError('Failed to load campaigns.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCampaignStatus = async (id, newStatus) => {
        try {
            await updateCampaign(id, { status: newStatus });
            setCampaigns(campaigns.map(camp => 
                camp.id === id ? { ...camp, status: newStatus } : camp
            ));
        } catch {
            alert('Failed to update status. Please try again.');
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign permanently?')) return;
        try {
            await deleteCampaign(id);
            setCampaigns(campaigns.filter(camp => camp.id !== id));
        } catch {
            alert('Failed to delete campaign.');
        }
    };

    // Filter campaigns by search term and status
    const filteredCampaigns = campaigns.filter((camp) => {
        const matchesSearch = 
            camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (camp.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'all' || 
            camp.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: campaigns.length,
        pending: campaigns.filter(c => c.status === 'pending').length,
        active: campaigns.filter(c => c.status === 'active').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        rejected: campaigns.filter(c => c.status === 'rejected').length,
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto font-sans">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text">Campaigns Moderation</h1>
                    <p className="mt-1 text-gray-500 text-sm">Review, approve, or delete campaign funding proposals across the platform.</p>
                </div>

                {/* Filters & Search Row */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                    {/* Status Tabs */}
                    <div className="flex border border-gray-250 bg-white rounded-xl p-1 overflow-x-auto shrink-0 shadow-apple-sm">
                        {Object.keys(statusCounts).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize whitespace-nowrap ${
                                    statusFilter === status
                                        ? 'bg-aidwise-blue text-white shadow-sm'
                                        : 'text-gray-500 hover:text-aidwise-text hover:bg-gray-50'
                                }`}
                            >
                                {status} ({statusCounts[status]})
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 md:max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search campaign title or NGO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aidwise-blue text-sm text-aidwise-text shadow-apple-sm transition-all"
                        />
                    </div>
                </div>

                {/* Table Card */}
                <Card className="overflow-hidden p-0 border border-aidwise-border shadow-apple">
                    <div className="p-5 border-b border-aidwise-border flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-md font-bold text-aidwise-text">Filtered Campaigns ({filteredCampaigns.length})</h3>
                        {error && <span className="text-sm text-red-500 font-semibold">{error}</span>}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-aidwise-text">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-aidwise-border">
                                <tr>
                                    <th className="px-6 py-4">Campaign Title & Organizer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Target Amount</th>
                                    <th className="px-6 py-4 text-right">Raised Amount</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-aidwise-border bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-semibold">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-aidwise-blue mr-2 align-middle"></div>
                                            Loading campaigns...
                                        </td>
                                    </tr>
                                ) : filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 flex flex-col items-center">
                                            <AlertCircle className="mb-2 opacity-50 text-gray-400" size={32} />
                                            <p className="font-bold text-sm">No matching campaigns found</p>
                                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCampaigns.map((camp) => (
                                        <tr key={camp.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-aidwise-text">{camp.title}</p>
                                                <p className="text-xs text-gray-400">NGO: {camp.user?.name || 'Unknown NGO'}</p>
                                                {camp.user?.status === 'suspended' && (
                                                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold border border-red-100">
                                                        <ShieldAlert size={10} /> NGO Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge status={camp.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-600">
                                                RM {Number(camp.target_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-aidwise-blue">
                                                RM {Number(camp.current_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end items-center gap-2">
                                                    {camp.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateCampaignStatus(camp.id, 'active')}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateCampaignStatus(camp.id, 'rejected')}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {camp.status === 'active' && (
                                                        <button
                                                            onClick={() => handleUpdateCampaignStatus(camp.id, 'completed')}
                                                            className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-aidwise-blue hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteCampaign(camp.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-250"
                                                        title="Delete Campaign"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
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
        </DashboardLayout>
    );
};

export default AdminCampaigns;
