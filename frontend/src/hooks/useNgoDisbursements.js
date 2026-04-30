import { useEffect, useState } from 'react';
import { getCampaigns } from '../services/campaignService';
import { createDisbursement, getNgoDisbursementDashboard } from '../services/disbursementService';

const initialDashboardData = {
    metrics: {},
    chart_data: [],
    recent_activity: [],
};

const initialFormData = {
    campaign_id: '',
    amount: '',
    purpose: '',
};

export const useNgoDisbursements = () => {
    const [dashboardData, setDashboardData] = useState(initialDashboardData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState(initialFormData);

    const fetchDisbursementData = async () => {
        try {
            const data = await getNgoDisbursementDashboard();
            setDashboardData(data);
        } catch {
            setError('Failed to load financial data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDisbursementData();
    }, []);

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        setFormError('');

        try {
            const campaignData = await getCampaigns();
            setCampaigns(campaignData);

            if (campaignData.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    campaign_id: String(campaignData[0].id),
                }));
            }
        } catch {
            setFormError('Failed to load campaigns.');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmitRequest = async (event) => {
        event.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        try {
            await createDisbursement(formData.campaign_id, {
                amount: Number(formData.amount),
                purpose: formData.purpose,
            });

            setIsModalOpen(false);
            setFormData({
                campaign_id: campaigns[0] ? String(campaigns[0].id) : '',
                amount: '',
                purpose: '',
            });
            await fetchDisbursementData();
        } catch (err) {
            const details = err?.response?.data?.errors?.details;
            const message = err?.response?.data?.message;
            setFormError(details || message || 'Failed to submit request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        dashboardData,
        isLoading,
        error,
        isModalOpen,
        campaigns,
        isSubmitting,
        formError,
        formData,
        handleOpenModal,
        closeModal,
        handleFieldChange,
        handleSubmitRequest,
    };
};
