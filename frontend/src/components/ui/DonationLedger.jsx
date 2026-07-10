import React, { useState, useEffect } from 'react';
import { getDonations } from '../../services/donationService';
import Card from './Card';
import Badge from './Badge'; // Reusing the badge we built earlier!
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';

const DonationLedger = () => {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [donationPage, setDonationPage] = useState(1);
    const DONATIONS_PER_PAGE = 5;

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const data = await getDonations();
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

    const totalDonationPages = Math.ceil(donations.length / DONATIONS_PER_PAGE);
    const paginatedDonations = donations.slice(
        (donationPage - 1) * DONATIONS_PER_PAGE,
        donationPage * DONATIONS_PER_PAGE
    );

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
                            <th className="px-6 py-4">Sub-goal</th>
                            <th className="px-6 py-4">Donor Name</th>
                            <th className="px-6 py-4">Amount (RM)</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-aidwise-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading ledger data...</td>
                            </tr>
                        ) : donations.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    No donations received yet. Share your campaigns to get started!
                                </td>
                            </tr>
                         ) : (
                            paginatedDonations.map((donation) => {
                                const subgoalText = donation.allocations && donation.allocations.length > 0
                                    ? donation.allocations.map(a => a.purpose).join(', ')
                                    : 'Overall campaign';
                                const amountDisplay = Number(donation.total_amount || donation.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                
                                return (
                                    <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {formatDate(donation.created_at)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-aidwise-text">
                                            {donation.campaign?.title || 'Unknown Campaign'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate" title={subgoalText}>
                                            {subgoalText}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Fallback chain: Registered User -> Guest Name -> Anonymous */}
                                            {donation.user?.name || donation.donor_name || 'Anonymous'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600 whitespace-nowrap">
                                            RM {amountDisplay}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge status={donation.status} />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalDonationPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-150 px-6 py-4 bg-gray-50/30">
                    <p className="text-xs text-gray-400 font-semibold">
                        Showing {(donationPage - 1) * DONATIONS_PER_PAGE + 1}–{Math.min(donationPage * DONATIONS_PER_PAGE, donations.length)} of {donations.length} donations
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setDonationPage(prev => Math.max(1, prev - 1))}
                            disabled={donationPage === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-aidwise-blue hover:bg-blue-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 border border-gray-200"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        
                        {Array.from({ length: totalDonationPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setDonationPage(page)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 ${
                                    donationPage === page
                                        ? 'bg-aidwise-blue text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-blue-50/50 hover:text-aidwise-blue border border-gray-150'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setDonationPage(prev => Math.min(totalDonationPages, prev + 1))}
                            disabled={donationPage === totalDonationPages}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-aidwise-blue hover:bg-blue-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 border border-gray-200"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default DonationLedger;