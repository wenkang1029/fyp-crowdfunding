import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns } from '../services/campaignService';
import CampaignCard from '../components/ui/CampaignCard';
import Navbar from '../components/layout/Navbar';
import { ShieldCheck, Receipt, Heart, ArrowRight, Activity, Users } from 'lucide-react';

const Home = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPublicCampaigns = async () => {
            try {
                const data = await getCampaigns();
                setCampaigns(data);
            } catch (err) {
                console.error("Failed to load campaigns", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicCampaigns();
    }, []);

    const scrollToCampaigns = (e) => {
        e.preventDefault();
        const element = document.getElementById('campaigns-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] font-sans flex flex-col">
            {/* Navigation */}
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-transparent pt-20 pb-16 px-6 sm:px-8 border-b border-gray-100/50">
                {/* Visual Background Pattern */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f3f6_1px,transparent_1px),linear-gradient(to_bottom,#f0f3f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"></div>
                
                <div className="max-w-4xl mx-auto text-center">
                    {/* Trust Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-aidwise-blue border border-blue-100 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in duration-300">
                        <ShieldCheck size={14} className="text-aidwise-blue" /> Verified NGO Crowdfunding
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black text-aidwise-text tracking-tight leading-[1.1] mb-6">
                        Empower Real Change, <br />
                        <span className="text-aidwise-blue bg-gradient-to-r from-aidwise-blue to-blue-500 bg-clip-text text-transparent">Directly & Transparently.</span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
                        Discover fully-vetted donation campaigns launched by registered NGOs. AidWise uses escrow disbursements to guarantee that every ringgit reaches the intended destination.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a 
                            href="#campaigns-section"
                            onClick={scrollToCampaigns}
                            className="flex items-center gap-1.5 px-6 py-3.5 bg-aidwise-blue text-white text-sm font-extrabold uppercase tracking-wider rounded-2xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Explore Active Projects
                            <ArrowRight size={16} />
                        </a>
                        <Link 
                            to="/register"
                            className="px-6 py-3.5 bg-white text-aidwise-text text-sm font-extrabold uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 shadow-sm"
                        >
                            Register NGO
                        </Link>
                    </div>
                </div>
            </section>

            {/* Value Propositions / Trust Section */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 w-full">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-aidwise-blue">Built for Integrity</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-aidwise-text tracking-tight mt-2">Why donors choose AidWise</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Stripe Escrow */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-apple-sm hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-aidwise-blue flex items-center justify-center mb-6">
                            <Heart size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-aidwise-text mb-3">Safe Escrow Protection</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Donations are held securely using our payment gateway integrations. Funds are disbursed incrementally to campaigns, verifying payout triggers and preventing double charges.
                        </p>
                    </div>

                    {/* Card 2: NGO Solicit Verification */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-apple-sm hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-aidwise-text mb-3">Solicitation Permit Audits</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            We manually verify the Permit to Solicit Public Donation uploaded by registering NGOs. Only verified, active accounts can launch public donation lists.
                        </p>
                    </div>

                    {/* Card 3: Tax Exemption Compliance */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-apple-sm hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
                            <Receipt size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-aidwise-text mb-3">LHDN Section 44(6) Receipts</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Support tax exemption eligible campaigns. Qualified NGOs can upload their exemption certificate, generating LHDN receipt documentation automatically.
                        </p>
                    </div>
                </div>
            </section>

            {/* Campaign Grid Section */}
            <main id="campaigns-section" className="max-w-7xl mx-auto px-6 sm:px-8 py-16 w-full flex-1 scroll-mt-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-3xl font-black text-aidwise-text tracking-tight">Active Campaigns</h2>
                        <p className="text-gray-500 text-sm mt-1">Support verified projects directly and track disbursements transparently.</p>
                    </div>
                    
                    {/* Platform stats summary */}
                    <div className="flex gap-6 text-left">
                        <div className="flex items-center gap-2">
                            <Activity className="text-aidwise-blue" size={20} />
                            <div>
                                <span className="text-xs text-gray-400 block font-semibold leading-none">Status</span>
                                <span className="text-sm font-bold text-aidwise-text">Fully Tracked</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="text-aidwise-blue" size={20} />
                            <div>
                                <span className="text-xs text-gray-400 block font-semibold leading-none">Security</span>
                                <span className="text-sm font-bold text-aidwise-text">Stripe Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <p className="text-gray-400 font-medium">No active campaigns available right now. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaigns.map(camp => (
                            <CampaignCard key={camp.id} campaign={camp} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100/80 py-12 px-6 sm:px-8 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-aidwise-blue text-white font-black text-sm">
                                A
                            </span>
                            <span className="text-lg font-bold text-aidwise-text tracking-tight">
                                Aid<span className="text-aidwise-blue">Wise</span>
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">© 2026 AidWise Crowdfunding Platform. All rights reserved.</p>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-semibold text-gray-400">
                        <Link to="/" className="hover:text-aidwise-blue transition-colors">Privacy Policy</Link>
                        <Link to="/" className="hover:text-aidwise-blue transition-colors">Terms of Service</Link>
                        <Link to="/" className="hover:text-aidwise-blue transition-colors">Security Audit</Link>
                        <Link to="/register" className="hover:text-aidwise-blue transition-colors">NGO Directory</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;