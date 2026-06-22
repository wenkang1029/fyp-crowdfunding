import { useEffect, useMemo, useState } from 'react';
import { getCampaigns } from '../services/campaignService';
import { getNgoDashboard } from '../services/dashboardService';
import { getDonations } from '../services/donationService';

export const useNgoDashboardData = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [dashboardMetrics, setDashboardMetrics] = useState(null);
    const [donorCount, setDonorCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch campaigns safely
                let campaignData = [];
                try {
                    campaignData = await getCampaigns();
                    setCampaigns(campaignData);
                } catch (err) {
                    console.error('Failed to fetch campaigns:', err);
                }

                // Fetch dashboard metrics safely
                try {
                    const ngoDashboardData = await getNgoDashboard();
                    setDashboardMetrics(ngoDashboardData?.metrics || null);
                } catch (err) {
                    console.error('Failed to fetch dashboard metrics:', err);
                }

                // Fetch donations safely
                try {
                    const donationData = await getDonations();
                    const uniqueDonors = new Set(
                        (donationData || []).map((donation) => donation.user_id || donation.donor_name)
                    );
                    setDonorCount(uniqueDonors.size);
                } catch (err) {
                    console.error('Failed to fetch donations:', err);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const computed = useMemo(() => {
        const totalTarget = Number(dashboardMetrics?.total_target_amount || 0);
        const totalRaised = Number(dashboardMetrics?.total_funds_raised || 0);

        return {
            activeCampaigns: Number(dashboardMetrics?.total_campaigns || campaigns.length || 0),
            totalTarget,
            totalRaised,
            completionRate:
                dashboardMetrics?.funding_progress_percentage !== undefined
                    ? Number(dashboardMetrics.funding_progress_percentage)
                    : totalTarget > 0
                        ? Math.round((totalRaised / totalTarget) * 100)
                        : 0,
        };
    }, [campaigns.length, dashboardMetrics]);

    return {
        campaigns,
        donorCount,
        isLoading,
        ...computed,
    };
};
