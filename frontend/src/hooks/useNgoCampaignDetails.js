import { useEffect, useState } from 'react';
import { getNgoCampaignDetails } from '../services/campaignService';

export const useNgoCampaignDetails = (campaignId) => {
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!campaignId) {
            setError('Campaign not found.');
            setIsLoading(false);
            return;
        }

        const loadCampaign = async () => {
            setIsLoading(true);
            setError('');

            try {
                const data = await getNgoCampaignDetails(campaignId);
                setCampaign(data);
            } catch {
                setError('Failed to load campaign details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadCampaign();
    }, [campaignId]);

    return {
        campaign,
        isLoading,
        error,
    };
};
