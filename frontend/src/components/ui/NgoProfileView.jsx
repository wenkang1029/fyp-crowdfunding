import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axiosInstance from '../../api/axios';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const NgoProfileView = ({ isOpen, onClose, ngoId }) => {
    const [ngo, setNgo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !ngoId) return;
        
        const fetchNgoProfile = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await axiosInstance.get(`/profiles/ngo/${ngoId}`);
                if (response.data?.success) {
                    setNgo(response.data.data);
                }
            } catch (err) {
                setError('Failed to retrieve NGO profile information.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNgoProfile();
    }, [isOpen, ngoId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="NGO Profile Details">
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aidwise-blue"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium text-center">
                    ⚠️ {error}
                </div>
            ) : ngo ? (
                <div className="space-y-4 text-left">
                    {/* Show incomplete profile notice if key fields are missing */}
                    {!ngo.org_description && !ngo.mailing_address && (
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium">
                            ⚠️ This organisation has not completed their public profile yet.
                        </div>
                    )}

                    {(() => {
                        const isProfileComplete = ngo.org_name && ngo.org_reg_number && ngo.org_description && ngo.mailing_address;
                        const isVerified = isProfileComplete && ngo.permit_path;

                        return (
                            <div className="border-b border-gray-100 pb-3">
                                <h3 className="text-xl font-bold text-aidwise-text">{ngo.org_name || ngo.name}</h3>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mt-1">
                                    Registration No: {ngo.org_reg_number || 'N/A'}
                                </span>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                                        ngo.status === 'suspended'
                                            ? 'bg-red-50 text-red-600 border-red-200'
                                            : 'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                        {ngo.status === 'suspended' ? 'Suspended / Inactive' : 'Active'}
                                    </span>

                                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                                        isVerified
                                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                                            : 'bg-amber-50 text-amber-600 border-amber-200'
                                    }`}>
                                        {isVerified ? '✓ Verified NGO' : 'Pending Verification'}
                                    </span>

                                    {ngo.is_tax_exempt && (
                                        <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border bg-emerald-50 text-emerald-700 border-emerald-250">
                                            Tax Exempt
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                        <div>
                            <span className="text-[10px] text-gray-450 font-bold uppercase block">Representative Name</span>
                            <span className="text-sm font-bold text-aidwise-text block mt-0.5">{ngo.name}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-450 font-bold uppercase block">Email Address</span>
                            <span className="text-sm font-bold text-aidwise-text block mt-0.5">{ngo.email}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <span className="text-xs font-bold text-gray-450 uppercase block mb-0.5">Description / Mission</span>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {ngo.org_description || 'No description provided by the organization.'}
                            </p>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-gray-450 uppercase block mb-0.5">Mailing Address</span>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {ngo.mailing_address || 'No mailing address configured.'}
                            </p>
                        </div>

                        {ngo.is_tax_exempt && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs">
                                <span className="font-bold block mb-1">✓ LHDN Section 44(6) Tax Exempt Organization</span>
                                Approval Code: <span className="font-bold font-mono">{ngo.lhdn_reference || 'N/A'}</span>
                            </div>
                        )}

                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-450 uppercase block mb-1">Uploaded Verification Files</span>
                            
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Solicitation Permit</span>
                                {ngo.permit_path ? (
                                    <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-150 rounded-xl">
                                        <span className="text-xs font-semibold text-aidwise-text">Solicitation_Permit.pdf</span>
                                        <a 
                                            href={ngo.permit_path.startsWith('http') ? ngo.permit_path : `${backendUrl}${ngo.permit_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs font-bold text-aidwise-blue hover:underline bg-white border border-gray-150 px-2.5 py-1 rounded-lg shadow-apple-sm"
                                        >
                                            View File
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No solicitation permit uploaded.</p>
                                )}
                            </div>

                            {ngo.is_tax_exempt && (
                                <div className="mt-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Tax Exemption Certificate</span>
                                    {ngo.tax_certificate_path ? (
                                        <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-150 rounded-xl">
                                            <span className="text-xs font-semibold text-aidwise-text">Tax_Certificate.pdf</span>
                                            <a 
                                                href={ngo.tax_certificate_path.startsWith('http') ? ngo.tax_certificate_path : `${backendUrl}${ngo.tax_certificate_path}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-xs font-bold text-aidwise-blue hover:underline bg-white border border-gray-150 px-2.5 py-1 rounded-lg shadow-apple-sm"
                                            >
                                                View File
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No tax certificate uploaded.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default NgoProfileView;
