import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import CampaignCard from '../components/ui/CampaignCard';

const Home = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPublicCampaigns = async () => {
            try {
                // Anyone can hit this route! Our Laravel backend securely 
                // returns only 'active' campaigns for guests.
                const response = await axiosInstance.get('/campaigns');
                const data = response.data.data || response.data;
                setCampaigns(data);
            } catch (err) {
                console.error("Failed to load campaigns", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicCampaigns();
    }, []);

    return (
        <div className="min-h-screen bg-aidwise-light font-sans">
            {/* Minimalist Public Navigation Bar */}
            <nav className="bg-white border-b border-aidwise-border px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-aidwise-blue tracking-tight">AidWise</span>
                </div>
                <div>
                    {user ? (
                        <Link to={user.role === 'admin' ? '/admin/dashboard' : '/ngo/dashboard'} className="text-sm font-semibold text-aidwise-text hover:text-aidwise-blue transition-colors">
                            Go to Dashboard →
                        </Link>
                    ) : (
                        <Link to="/login" className="text-sm font-semibold px-4 py-2 bg-aidwise-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-8 py-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl font-extrabold text-aidwise-text tracking-tight mb-6">
                        Empower Change, <span className="text-aidwise-blue">Together.</span>
                    </h1>
                    <p className="text-lg text-gray-500">
                        Discover verified campaigns from trusted NGOs and make a direct impact where it is needed most.
                    </p>
                </div>

                {/* Campaign Grid Section */}
                <div>
                    <h2 className="text-2xl font-bold text-aidwise-text mb-8">Active Campaigns</h2>
                    
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-aidwise-border border-dashed">
                            <p className="text-gray-500">No active campaigns available right now. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {campaigns.map(camp => (
                                <CampaignCard key={camp.id} campaign={camp} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;