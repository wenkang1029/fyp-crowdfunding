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
            <Modal isOpen={isOpen} onClose={onClose} title="Donation Impact & Payout Tracker" size="lg">
                <div className="space-y-6">
                    {/* Header Summary */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-5 shadow-apple-sm relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <TrendingUp size={150} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-100">My Giving Impact</span>
                        <h3 className="text-2xl font-black mt-1 truncate">{campaign.title || 'Campaign'}</h3>
                        <p className="text-xs text-blue-100 mt-0.5">Campaign-wide Flat Tracking (proportional dollar accountability)</p>
                        
                        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
                            <div>
                                <span className="text-[9px] uppercase font-bold text-blue-200">My Donation</span>
                                <div className="text-lg font-extrabold mt-0.5">{formatRM(donationAmount)}</div>
                            </div>
                            <div>
                                <span className="text-[9px] uppercase font-bold text-blue-200">Utilized</span>
                                <div className="text-lg font-extrabold mt-0.5 text-emerald-300">{formatRM(donorDisbursed)}</div>
                            </div>
                            <div>
                                <span className="text-[9px] uppercase font-bold text-blue-200">In Escrow</span>
                                <div className="text-lg font-extrabold mt-0.5 text-yellow-300">{formatRM(donorEscrow)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Proportional Progress Section */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-aidwise-text flex items-center gap-1.5">
                                <Info size={14} className="text-aidwise-blue" />
                                Proportional Dollar Utilization
                            </span>
                            <span className="text-xs font-extrabold text-aidwise-blue">{utilizationPercent}% utilised</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className="h-full flex rounded-full">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${utilizationPercent}%` }}></div>
                                <div className="h-full bg-blue-500/20 transition-all duration-500" style={{ width: `${100 - utilizationPercent}%` }}></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <Unlock size={10} /> Disbursed to Project: {utilizationPercent}%
                            </span>
                            <span className="flex items-center gap-1 text-blue-500">
                                <Lock size={10} /> Safe in Escrow: {100 - utilizationPercent}%
                            </span>
                        </div>
                    </div>

                    {/* Verified Disbursement Ledger */}
                    <div>
                        <h4 className="text-sm font-bold text-aidwise-text mb-3">Verified Payout Ledger & Visual Proof</h4>
                        {disbursements.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 font-semibold">
                                No funds have been disbursed from this campaign escrow yet.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                                {disbursements.map((d) => {
                                    const proofImages = Array.isArray(d.proof_images) ? d.proof_images : [];
                                    return (
                                        <div key={d.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-bold text-gray-400">{formatDate(d.created_at)}</span>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-aidwise-blue font-extrabold rounded-lg text-[9px] uppercase tracking-wide">
                                                        {d.purpose}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                                                    {d.details || 'Disbursement details not provided.'}
                                                </p>
                                                
                                                {/* Visual Proof Section */}
                                                <div className="pt-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                                        Real-World Proof:
                                                    </span>
                                                    {proofImages.length === 0 ? (
                                                        <span className="text-[10px] text-amber-600 font-semibold italic bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
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

                                            <div className="flex flex-row md:flex-col items-end gap-2 self-stretch md:self-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-gray-100 shrink-0">
                                                <span className="text-xs font-black text-emerald-600 order-2 md:order-1 ml-auto">
                                                    {formatRM(d.amount)}
                                                </span>
                                                <div className="flex items-center gap-1.5 order-1 md:order-2">
                                                    {d.receipt_path && (
                                                        <a 
                                                            href={d.receipt_path.startsWith('http') ? d.receipt_path : `${backendUrl}${d.receipt_path}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="p-1 text-gray-400 hover:text-aidwise-blue hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View Billing Invoice"
                                                        >
                                                            <FileText size={14} />
                                                        </a>
                                                    )}
                                                </div>
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
