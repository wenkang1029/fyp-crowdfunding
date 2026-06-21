import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const CampaignCard = ({ campaign }) => {
    // Ensure math works safely with fallbacks
    const target = Number(campaign.target_amount) || 1;
    const raised = Number(campaign.current_amount) || 0;
    
    // Calculate percentage, capped at 100% so the visual bar doesn't overflow
    const progressPercentage = Math.min(Math.round((raised / target) * 100), 100);

    const imageUrl = campaign.image_path 
        ? (campaign.image_path.startsWith('http') ? campaign.image_path : `${backendUrl}${campaign.image_path}`) 
        : null;

    return (
        <Card className="flex flex-col h-full hover:shadow-apple transition-shadow duration-300 p-0 overflow-hidden">
            {imageUrl ? (
                <div className="h-40 w-full overflow-hidden border-b border-aidwise-border bg-gray-50">
                    <img 
                        src={imageUrl} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            ) : (
                <div className="h-40 bg-gradient-to-br from-aidwise-blue/10 to-aidwise-blue/5 border-b border-aidwise-border flex items-center justify-center">
                    <span className="text-4xl">🌍</span>
                </div>
            )}

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-2">
                    <span className="text-xs font-bold text-aidwise-blue uppercase tracking-wider">
                        {campaign.user?.name || 'Verified NGO'}
                    </span>
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
    );
};

export default CampaignCard;