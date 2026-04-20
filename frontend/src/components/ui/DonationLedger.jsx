import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import Card from './Card';
import Badge from './Badge'; // Reusing the badge we built earlier!
import { Receipt } from 'lucide-react';

const DonationLedger = () => {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await axiosInstance.get('/donations');
                // Ensure we are setting an array
                const data = response.data.data || response.data;
                setDonations(data);
            } catch (err) {
                console.error("Ledger error:", err);
                setError('Failed to load donation history.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDonations();
    }, []);

    // Helper function to format the database timestamp into a readable date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Card className="overflow-hidden p-0 mt-8">
            <div className="p-6 border-b border-aidwise-border flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Receipt className="text-aidwise-blue" size={20} />
                    <h3 className="text-lg font-bold text-aidwise-text">Recent Donations Ledger</h3>
                </div>
                {error && <span className="text-sm text-red-500">{error}</span>}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-aidwise-text">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-aidwise-border">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Campaign</th>
                            <th className="px-6 py-4">Donor Name</th>
                            <th className="px-6 py-4">Amount (RM)</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-aidwise-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading ledger data...</td>
                            </tr>
                        ) : donations.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                    No donations received yet. Share your campaigns to get started!
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
                                    <td className="px-6 py-4">
                                        {/* Fallback chain: Registered User -> Guest Name -> Anonymous */}
                                        {donation.user?.name || donation.donor_name || 'Anonymous'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-green-600">
                                        RM {Number(donation.amount).toLocaleString()}
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
    );
};

export default DonationLedger;