import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';

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
                const response = await axios.get(`/api/profiles/ngo/${ngoId}`);
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
                    <div className="border-b border-gray-100 pb-3">
                        <h3 className="text-xl font-bold text-aidwise-text">{ngo.org_name || ngo.name}</h3>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mt-1">
                            Registration No: {ngo.org_reg_number || 'N/A'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block mb-0.5">Description / Mission</span>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {ngo.org_description || 'No description provided by the organization.'}
                            </p>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block mb-0.5">Mailing Address</span>
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
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default NgoProfileView;
