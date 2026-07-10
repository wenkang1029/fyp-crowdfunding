import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import NgoProfileView from './NgoProfileView';

const CampaignCard = ({ campaign }) => {
    const [isNgoModalOpen, setIsNgoModalOpen] = useState(false);

    // Ensure math works safely with fallbacks
    const target = Number(campaign.target_amount) || 1;
    const raised = Number(campaign.current_amount) || 0;

    // Calculate percentage, capped at 100% so the visual bar doesn't overflow
    const progressPercentage = Math.min(Math.round((raised / target) * 100), 100);

    return (
        <>
            <Card className="flex flex-col h-full hover:shadow-apple transition-shadow duration-300 p-0 overflow-hidden">
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* U2: NGO name is now a clickable entry point to NgoProfileView */}
                        <button
                            type="button"
                            onClick={() => setIsNgoModalOpen(true)}
                            className="text-xs font-bold text-aidwise-blue uppercase tracking-wider hover:underline cursor-pointer text-left"
                            title={`View ${campaign.user?.org_name || campaign.user?.name || 'Verified NGO'}'s profile`}
                        >
                            {campaign.user?.org_name || campaign.user?.name || 'Verified NGO'}
                        </button>

                        {campaign.user && (
                            <div className="flex items-center gap-1">
                                {(() => {
                                    const u = campaign.user;
                                    const isProfileComplete = u.org_name && u.org_reg_number && u.org_description && u.mailing_address;
                                    const isVerified = isProfileComplete && u.permit_path;
                                    return (
                                        <span className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded-md border ${
                                            isVerified
                                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                : 'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}>
                                            {isVerified ? '✓ Verified' : 'Pending'}
                                        </span>
                                    );
                                })()}
                                {!!campaign.user.is_tax_exempt && (
                                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded-md border bg-emerald-50 text-emerald-700 border-emerald-250">
                                        Tax Exempt
                                    </span>
                                )}
                                {campaign.status === 'completed' && (
                                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded-md border bg-gray-150 text-gray-700 border-gray-200">
                                        Completed
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-aidwise-text mb-2 line-clamp-2">
                        {campaign.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-1">
                        {campaign.description}
                    </p>

                    {/* Progress Bar Section */}
                    <div className="mt-auto">
                        <div className="flex justify-between text-sm font-semibold mb-2">
                            <span className="text-aidwise-text">RM {raised.toLocaleString()} raised</span>
                            <span className="text-gray-400">of RM {target.toLocaleString()}</span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                            <div
                                className="bg-aidwise-blue h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <Link
                            to={`/campaigns/${campaign.id}`}
                            className="block w-full text-center py-2.5 px-4 bg-gray-50 text-aidwise-text font-semibold rounded-xl hover:bg-aidwise-blue hover:text-white transition-colors border border-gray-200 hover:border-aidwise-blue"
                        >
                            View Campaign
                        </Link>
                    </div>
                </div>
            </Card>

            {/* U2: NGO profile modal — mounted outside the Card to avoid z-index conflicts */}
            <NgoProfileView
                isOpen={isNgoModalOpen}
                onClose={() => setIsNgoModalOpen(false)}
                ngoId={campaign.user_id}
            />
        </>
    );
};

export default CampaignCard;