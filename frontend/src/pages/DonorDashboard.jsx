import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar'; // Replaced DashboardLayout with Navbar
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { getDonations } from '../services/donationService';
import { Heart, History, Award } from 'lucide-react';

const DonorDashboard = () => {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyDonations = async () => {
            try {
                const data = await getDonations();
                setDonations(data);
            } catch {
                setError('Failed to load your donation history.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyDonations();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-aidwise-light font-sans">
                <Navbar />
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                </div>
            </div>
        );
    }

    const totalDonated = donations.reduce((sum, donation) => sum + Number(donation.amount), 0);
    const uniqueCampaigns = new Set(donations.map(d => d.campaign_id)).size;

    const formatRM = (amount) => `RM ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            <Navbar />
            
            <main className="max-w-6xl mx-auto px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">My Impact</h1>
                    <p className="mt-1 text-gray-500">Thank you for making a difference. Here is your giving history.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                {/* Donor Impact Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatCard 
                        title="Total Lifetime Impact" 
                        value={formatRM(totalDonated)} 
                        icon={Heart} 
                    />
                    <StatCard 
                        title="Campaigns Supported" 
                        value={uniqueCampaigns.toString()} 
                        icon={Award} 
                    />
                </div>

                {/* Donation History Table */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <History className="text-aidwise-blue" size={20} />
                        <h3 className="font-bold text-aidwise-text">Donation History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-aidwise-text">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Campaign Title</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {donations.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                            You haven't made any donations yet. Visit the gallery to find a cause!
                                        </td>
                                    </tr>
                                ) : (
                                    donations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {formatDate(donation.created_at)}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-aidwise-text">
                                                {donation.campaign?.title || 'Unknown Campaign'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-600 whitespace-nowrap">
                                                {formatRM(donation.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge status={donation.status} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default DonorDashboard;