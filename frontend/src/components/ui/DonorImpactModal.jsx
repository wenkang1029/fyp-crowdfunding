import React, { useState } from 'react';
import Modal from './Modal';
import Badge from './Badge';
import { Lock, Unlock, TrendingUp, Info, FileText, Image as ImageIcon, X } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const DonorImpactModal = ({ isOpen, onClose, donation }) => {
    const [activeLightboxImage, setActiveLightboxImage] = useState(null);

    if (!donation) return null;

    const campaign = donation.campaign || {};
    const disbursements = Array.isArray(campaign.disbursements) ? campaign.disbursements : [];
    
    // Calculations
    const donationAmount = Number(donation.amount || 0);
    const campaignRaised = Number(campaign.current_amount || 0);
    const campaignDisbursed = disbursements.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    
    const utilizationRate = campaignRaised > 0 ? (campaignDisbursed / campaignRaised) : 0;
    const utilizationPercent = Math.min(Math.round(utilizationRate * 100), 100);
    
    const donorDisbursed = donationAmount * utilizationRate;
    const donorEscrow = Math.max(donationAmount - donorDisbursed, 0);

    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Donation Impact & Payout Tracker" size="xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: My Giving Impact & Proportional Dollar Utilization */}
                    <div className="md:col-span-5 space-y-6">
                        {/* Header Summary */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-5 shadow-apple-sm relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-10">
                                <TrendingUp size={150} />
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-100">My Giving Impact</span>
                            <h3 className="text-xl font-black mt-1 truncate">{campaign.title || 'Campaign'}</h3>
                            <p className="text-[10px] text-blue-100 mt-0.5 leading-normal">Campaign-wide Flat Tracking (proportional dollar accountability)</p>
                            
                            <div className="mt-5 space-y-3 border-t border-white/20 pt-4 text-xs font-bold">
                                <div className="flex justify-between">
                                    <span className="text-blue-200">My Donation</span>
                                    <span>{formatRM(donationAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-emerald-300">Utilized</span>
                                    <span className="text-emerald-300">{formatRM(donorDisbursed)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-yellow-300">In Escrow</span>
                                    <span className="text-yellow-300">{formatRM(donorEscrow)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Proportional Progress Section */}
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-aidwise-text flex items-center gap-1.5">
                                    <Info size={14} className="text-aidwise-blue" />
                                    Proportional Dollar Utilization
                                </span>
                                <span className="text-xs font-extrabold text-aidwise-blue">{utilizationPercent}% utilised</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div className="h-full flex rounded-full">
                                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${utilizationPercent}%` }}></div>
                                    <div className="h-full bg-blue-500/20 transition-all duration-500" style={{ width: `${100 - utilizationPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 text-[10px] text-gray-500 mt-3 font-semibold">
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <Unlock size={10} /> Disbursed to Project: {utilizationPercent}%
                                </div>
                                <div className="flex items-center gap-1.5 text-blue-600">
                                    <Lock size={10} /> Safe in Escrow: {100 - utilizationPercent}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Verified Payout Ledger & Visual Proof */}
                    <div className="md:col-span-7 space-y-4">
                        <h4 className="text-sm font-bold text-aidwise-text uppercase tracking-wider text-gray-400">Verified Payout Ledger & Visual Proof</h4>
                        {disbursements.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 font-semibold">
                                No funds have been disbursed from this campaign escrow yet.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                {disbursements.map((d) => {
                                    const proofImages = Array.isArray(d.proof_images) ? d.proof_images : [];
                                    return (
                                        <div key={d.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex flex-col gap-3">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400">{formatDate(d.created_at)}</span>
                                                    <h5 className="text-sm font-extrabold text-aidwise-text mt-0.5">{d.purpose}</h5>
                                                </div>
                                                <span className="text-xs font-black text-emerald-600">
                                                    {formatRM(d.amount)}
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                                {d.details || 'Disbursement details not provided.'}
                                            </p>
                                            
                                            {/* Visual Proof Section */}
                                            <div className="border-t border-gray-100/50 pt-2">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                                    Real-World Proof:
                                                </span>
                                                {proofImages.length === 0 ? (
                                                    <span className="text-[9px] text-amber-600 font-semibold italic bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                                        Pending Field Impact Photos from NGO
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2 flex-wrap mt-1">
                                                        {proofImages.map((path, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                onClick={() => setActiveLightboxImage(path.startsWith('http') ? path : `${backendUrl}${path}`)}
                                                                className="h-10 w-14 rounded-lg overflow-hidden border border-gray-200 bg-white hover:scale-105 hover:border-aidwise-blue transition-all cursor-pointer shadow-apple-xs shrink-0"
                                                            >
                                                                <img 
                                                                    src={path.startsWith('http') ? path : `${backendUrl}${path}`} 
                                                                    alt={`Proof ${idx + 1}`} 
                                                                    className="h-full w-full object-cover" 
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </Modal>

            {/* Lightbox Modal for Proof Images */}
            {activeLightboxImage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <button 
                        onClick={() => setActiveLightboxImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        title="Close Image"
                    >
                        <X size={20} />
                    </button>
                    <div className="max-w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
                        <img 
                            src={activeLightboxImage} 
                            alt="Disbursement Proof Large View" 
                            className="object-contain max-w-full max-h-[85vh]"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default DonorImpactModal;
