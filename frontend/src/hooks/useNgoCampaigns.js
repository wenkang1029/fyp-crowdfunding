import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCampaigns, updateCampaign } from '../services/campaignService';
import { createDisbursement } from '../services/disbursementService';

const initialFormData = {
    title: '',
    description: '',
};

export const useNgoCampaigns = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [statusUpdateId, setStatusUpdateId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutCampaign, setPayoutCampaign] = useState(null);
    const [payoutForm, setPayoutForm] = useState({ amount: '', purpose: '', details: '' });
    const [selectedAllocations, setSelectedAllocations] = useState([]);
    const [payoutError, setPayoutError] = useState('');
    const [isPayoutSubmitting, setIsPayoutSubmitting] = useState(false);

    const toastTimeoutRef = useRef(null);

    const showToast = (message) => {
        setSuccessMessage(message);
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
            setSuccessMessage('');
        }, 3500);
    };

    const loadCampaigns = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = await getCampaigns();
            const list = Array.isArray(data) ? data : [];
            const filtered = user?.id
                ? list.filter((campaign) => campaign.user_id === user.id || campaign.user?.id === user.id)
                : list;

            setCampaigns(filtered);
        } catch {
            setError('Failed to load campaigns. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const openEditModal = (campaign) => {
        setActiveCampaign(campaign);
        setFormData({
            title: campaign?.title || '',
            description: campaign?.description || '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveCampaign(null);
        setFormData(initialFormData);
        setFormErrors({});
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!activeCampaign?.id) return;

        setIsSaving(true);
        setFormErrors({});

        try {
            const updatedCampaign = await updateCampaign(activeCampaign.id, formData);

            setCampaigns((prev) =>
                prev.map((campaign) =>
                    campaign.id === activeCampaign.id
                        ? { ...campaign, ...updatedCampaign }
                        : campaign
                )
            );

            showToast('Campaign updated successfully.');
            closeModal();
        } catch (err) {
            if (err?.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ global: 'Failed to update campaign. Please try again.' });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusToggle = async (campaign) => {
        if (!campaign?.id) return;

        const currentStatus = campaign.status;
        const nextStatus = currentStatus === 'active' ? 'completed' : 'active';

        setStatusUpdateId(campaign.id);
        setError('');

        try {
            const updatedCampaign = await updateCampaign(campaign.id, { status: nextStatus });
            setCampaigns((prev) =>
                prev.map((item) => (item.id === campaign.id ? { ...item, ...updatedCampaign } : item))
            );
            showToast('Campaign status updated successfully.');
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to update campaign status.';
            setError(message);
        } finally {
            setStatusUpdateId(null);
        }
    };

    const openPayoutModal = (campaign) => {
        setPayoutCampaign(campaign);
        setPayoutForm({ amount: '', purpose: '', details: '' });
        setSelectedAllocations([]);
        setPayoutError('');
        setIsPayoutModalOpen(true);
    };

    const closePayoutModal = () => {
        setIsPayoutModalOpen(false);
        setPayoutCampaign(null);
        setPayoutForm({ amount: '', purpose: '', details: '' });
        setSelectedAllocations([]);
        setPayoutError('');
    };

    const handlePayoutChange = (event) => {
        const { name, value } = event.target;
        setPayoutForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePayoutSubmit = async (event) => {
        event.preventDefault();
        if (!payoutCampaign?.id) return;
        if (selectedAllocations.length === 0) {
            setPayoutError('Please select at least one Purpose of Funds.');
            return;
        }

        setIsPayoutSubmitting(true);
        setPayoutError('');

        try {
            await createDisbursement(payoutCampaign.id, {
                amount: Number(payoutForm.amount),
                purpose: selectedAllocations.join(', '),
                details: payoutForm.details || '',
            });
            showToast('Payout request submitted successfully.');
            closePayoutModal();
        } catch (err) {
            const details = err?.response?.data?.errors?.details;
            const message = err?.response?.data?.message;
            setPayoutError(details || message || 'Failed to submit payout request.');
        } finally {
            setIsPayoutSubmitting(false);
        }
    };

    return {
        campaigns,
        isLoading,
        error,
        isModalOpen,
        formData,
        formErrors,
        isSaving,
        statusUpdateId,
        successMessage,
        isPayoutModalOpen,
        payoutCampaign,
        payoutForm,
        payoutError,
        isPayoutSubmitting,
        selectedAllocations,
        setSelectedAllocations,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleStatusToggle,
        openPayoutModal,
        closePayoutModal,
        handlePayoutChange,
        handlePayoutSubmit,
    };
};
