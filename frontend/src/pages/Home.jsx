import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns } from '../services/campaignService';
import CampaignCard from '../components/ui/CampaignCard';
import Navbar from '../components/layout/Navbar';
import { ShieldCheck, Receipt, Heart, ArrowRight, Activity, Users, ChevronLeft, ChevronRight, Clock, Zap } from 'lucide-react';

const CARDS_PER_PAGE = 6;

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages = [1];
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end   = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-aidwise-blue hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
                <ChevronLeft size={16} /> Prev
            </button>

            {getPages().map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm select-none">…</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-150 ${
                            currentPage === page
                                ? 'bg-aidwise-blue text-white shadow-md shadow-blue-200'
                                : 'text-gray-500 hover:bg-blue-50 hover:text-aidwise-blue'
                        }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-aidwise-blue hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
                Next <ChevronRight size={16} />
            </button>
        </div>
    );
};

// ─── Home ──────────────────────────────────────────────────────────────────────
const Home = () => {
    const [activeTab, setActiveTab]   = useState('active');
    const [campaigns, setCampaigns]   = useState({ active: [], past: [] });
    const [isLoading, setIsLoading]   = useState({ active: true, past: false });
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTab = useCallback(async (tab) => {
        setIsLoading(prev => ({ ...prev, [tab]: true }));
        try {
            const data = await getCampaigns(tab);
            setCampaigns(prev => ({ ...prev, [tab]: Array.isArray(data) ? data : [] }));
        } catch (err) {
            console.error(`Failed to load ${tab} campaigns`, err);
            setCampaigns(prev => ({ ...prev, [tab]: [] }));
        } finally {
            setIsLoading(prev => ({ ...prev, [tab]: false }));
        }
    }, []);

    // Fetch active on mount
    useEffect(() => { fetchTab('active'); }, [fetchTab]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        // Lazy-load past campaigns the first time
        if (tab === 'past' && campaigns.past.length === 0 && !isLoading.past) {
            fetchTab('past');
        }
    };

    const scrollToCampaigns = (e) => {
        e.preventDefault();
        document.getElementById('campaigns-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const currentList  = campaigns[activeTab];
    const totalPages   = Math.ceil(currentList.length / CARDS_PER_PAGE);
    const paginated    = currentList.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE);
    const loading      = isLoading[activeTab];

    const tabs = [
        { id: 'active', label: 'Active Campaigns', Icon: Zap,   count: campaigns.active.length },
        { id: 'past',   label: 'Past Campaigns',   Icon: Clock,  count: campaigns.past.length  },
    ];

    return (
        <div className="min-h-screen bg-[#fafbfc] font-sans flex flex-col">
            <Navbar />

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-transparent pt-20 pb-16 px-6 sm:px-8 border-b border-gray-100/50">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f3f6_1px,transparent_1px),linear-gradient(to_bottom,#f0f3f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-aidwise-blue border border-blue-100 text-xs font-bold uppercase tracking-wider mb-6">
                        <ShieldCheck size={14} /> Verified NGO Crowdfunding
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black text-aidwise-text tracking-tight leading-[1.1] mb-6">
                        Empower Real Change, <br />
                        <span className="text-aidwise-blue bg-gradient-to-r from-aidwise-blue to-blue-500 bg-clip-text text-transparent">
                            Directly &amp; Transparently.
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
                        Discover fully-vetted donation campaigns launched by registered NGOs. AidWise uses escrow disbursements to guarantee that every ringgit reaches the intended destination.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="#campaigns-section"
                            onClick={scrollToCampaigns}
                            className="flex items-center gap-1.5 px-6 py-3.5 bg-aidwise-blue text-white text-sm font-extrabold uppercase tracking-wider rounded-2xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Explore Active Projects <ArrowRight size={16} />
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

            {/* ── Value Props ───────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 w-full">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-aidwise-blue">Built for Integrity</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-aidwise-text tracking-tight mt-2">Why donors choose AidWise</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-apple-sm hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-aidwise-blue flex items-center justify-center mb-6"><Heart size={24} /></div>
                        <h3 className="text-lg font-bold text-aidwise-text mb-3">Safe Escrow Protection</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Donations are held securely using our payment gateway integrations. Funds are disbursed incrementally to campaigns, verifying payout triggers and preventing double charges.</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-apple-sm hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6"><ShieldCheck size={24} /></div>
                        <h3 className="text-lg font-bold text-aidwise-text mb-3">Solicitation Permit Audits</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">We manually verify the Permit to Solicit Public Donation uploaded by registering NGOs. Only verified, active accounts can launch public donation lists.</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-apple-sm hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6"><Receipt size={24} /></div>
                        <h3 className="text-lg font-bold text-aidwise-text mb-3">LHDN Section 44(6) Receipts</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Support tax exemption eligible campaigns. Qualified NGOs can upload their exemption certificate, generating LHDN receipt documentation automatically.</p>
                    </div>
                </div>
            </section>

            {/* ── Campaigns Section ─────────────────────────────────────────── */}
            <main id="campaigns-section" className="max-w-7xl mx-auto px-6 sm:px-8 pb-24 w-full flex-1 scroll-mt-20">

                {/* Section header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-3xl font-black text-aidwise-text tracking-tight">Campaigns</h2>
                        <p className="text-gray-500 text-sm mt-1">Support verified projects and track disbursements transparently.</p>
                    </div>
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

                {/* Tab bar */}
                <div className="flex items-center gap-1 p-1 bg-gray-100/70 rounded-2xl w-fit mb-8 border border-gray-200/60">
                    {tabs.map(({ id, label, Icon, count }) => (
                        <button
                            key={id}
                            id={`tab-${id}`}
                            onClick={() => handleTabChange(id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                activeTab === id
                                    ? 'bg-white text-aidwise-text shadow-sm border border-gray-200/80'
                                    : 'text-gray-500 hover:text-aidwise-text'
                            }`}
                        >
                            <Icon size={15} className={activeTab === id ? 'text-aidwise-blue' : 'text-gray-400'} />
                            {label}
                            {count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold leading-none ${
                                    activeTab === id
                                        ? 'bg-aidwise-blue/10 text-aidwise-blue'
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue" />
                        <p className="text-sm text-gray-400 font-medium">Loading campaigns…</p>
                    </div>

                /* Empty state */
                ) : paginated.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                        {activeTab === 'active' ? (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-aidwise-blue flex items-center justify-center mx-auto mb-4"><Zap size={28} /></div>
                                <p className="text-gray-700 font-bold text-base">No active campaigns right now</p>
                                <p className="text-gray-400 text-sm mt-1">New campaigns will appear here once approved.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4"><Clock size={28} /></div>
                                <p className="text-gray-700 font-bold text-base">No past campaigns yet</p>
                                <p className="text-gray-400 text-sm mt-1">Completed campaigns will be archived here.</p>
                            </>
                        )}
                    </div>

                /* Grid */
                ) : (
                    <>
                        <p className="text-xs text-gray-400 font-semibold mb-5">
                            Showing {(currentPage - 1) * CARDS_PER_PAGE + 1}–{Math.min(currentPage * CARDS_PER_PAGE, currentList.length)} of {currentList.length} {activeTab === 'past' ? 'past' : 'active'} campaigns
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginated.map(camp => (
                                <CampaignCard key={camp.id} campaign={camp} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(p) => {
                                setCurrentPage(p);
                                document.getElementById('campaigns-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        />
                    </>
                )}
            </main>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <footer className="bg-white border-t border-gray-100/80 py-12 px-6 sm:px-8 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-aidwise-blue text-white font-black text-sm">A</span>
                            <span className="text-lg font-bold text-aidwise-text tracking-tight">Aid<span className="text-aidwise-blue">Wise</span></span>
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