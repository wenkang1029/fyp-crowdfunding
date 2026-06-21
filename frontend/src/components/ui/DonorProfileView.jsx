import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getDonorProfile } from '../../services/authService';
import { User, IdCard, MapPin } from 'lucide-react';

/**
 * DonorProfileView
 * Shows a PDPA-gated donor profile in a modal.
 * Accessible to: Admin (all), NGO (only if donor has donated to their campaign).
 */
const DonorProfileView = ({ isOpen, onClose, donorId }) => {
    const [donor, setDonor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !donorId) return;

        const fetchDonorProfile = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await getDonorProfile(donorId);
                setDonor(data);
            } catch (err) {
                if (err?.response?.status === 403) {
                    setError('Access restricted. This donor has not made any donations to your campaigns.');
                } else {
                    setError('Failed to retrieve donor profile information.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDonorProfile();
    }, [isOpen, donorId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Donor Profile">
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aidwise-blue"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium text-center">
                    ⚠️ {error}
                </div>
            ) : donor ? (
                <div className="space-y-4 text-left">
                    {/* Name Row */}
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-blue-50 rounded-xl text-aidwise-blue">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-aidwise-text text-lg">{donor.name}</p>
                            <p className="text-xs text-gray-400">{donor.email}</p>
                        </div>
                    </div>

                    {/* IC / Passport */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-500 shrink-0">
                            <IdCard size={16} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block mb-0.5">
                                Identification Number (IC / Passport)
                            </span>
                            <p className="text-sm text-aidwise-text font-medium">
                                {donor.identification_number || (
                                    <span className="text-gray-400 italic">Not provided</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Mailing Address */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-500 shrink-0">
                            <MapPin size={16} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block mb-0.5">
                                Mailing Address
                            </span>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {donor.mailing_address || (
                                    <span className="text-gray-400 italic">No mailing address provided.</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* PDPA notice */}
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium">
                        🔒 This information is protected under PDPA 2010 and visible only to authorised parties.
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default DonorProfileView;
