import { useCallback, useEffect, useRef, useState } from 'react';
import { getNgoCampaignDetails, updateCampaign } from '../services/campaignService';
import { createAllocation, updateAllocation } from '../services/allocationService';

const initialCampaignForm = {
    title: '',
    description: '',
};

const initialAllocationForm = {
    purpose: '',
    amount: '',
};

export const useNgoCampaignDetails = (campaignId) => {
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [campaignForm, setCampaignForm] = useState(initialCampaignForm);
    const [campaignErrors, setCampaignErrors] = useState({});
    const [isSavingCampaign, setIsSavingCampaign] = useState(false);

    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
    const [activeAllocation, setActiveAllocation] = useState(null);
    const [allocationForm, setAllocationForm] = useState(initialAllocationForm);
    const [allocationErrors, setAllocationErrors] = useState({});
    const [isSavingAllocation, setIsSavingAllocation] = useState(false);

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

    const loadCampaign = useCallback(async () => {
        if (!campaignId) {
            setError('Campaign not found.');
            setIsLoading(false);
            return;
        }

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
    }, [campaignId]);

    useEffect(() => {
        loadCampaign();
    }, [loadCampaign]);

    const openCampaignModal = () => {
        setCampaignForm({
            title: campaign?.title || '',
            description: campaign?.description || '',
        });
        setCampaignErrors({});
        setIsCampaignModalOpen(true);
    };

    const closeCampaignModal = () => {
        setIsCampaignModalOpen(false);
        setCampaignErrors({});
        setCampaignForm(initialCampaignForm);
    };

    const handleCampaignChange = (event) => {
        const { name, value } = event.target;
        setCampaignForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (campaignErrors[name]) {
            setCampaignErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateCampaignForm = () => {
        const errors = {};
        if (!campaignForm.title?.trim()) {
            errors.title = 'Campaign title is required.';
        }
        if (!campaignForm.description?.trim()) {
            errors.description = 'Campaign description is required.';
        }

        setCampaignErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCampaignSubmit = async (event) => {
        event.preventDefault();
        if (!campaignId) return;
        if (!validateCampaignForm()) return;

        setIsSavingCampaign(true);
        setCampaignErrors({});

        try {
            await updateCampaign(campaignId, {
                title: campaignForm.title.trim(),
                description: campaignForm.description.trim(),
            });

            await loadCampaign();
            showToast('Campaign updated successfully.');
            closeCampaignModal();
        } catch (err) {
            if (err?.response?.data?.errors) {
                setCampaignErrors(err.response.data.errors);
            } else {
                setCampaignErrors({ global: 'Failed to update campaign. Please try again.' });
            }
        } finally {
            setIsSavingCampaign(false);
        }
    };

    const openAllocationCreateModal = () => {
        setActiveAllocation(null);
        setAllocationForm(initialAllocationForm);
        setAllocationErrors({});
        setIsAllocationModalOpen(true);
    };

    const openAllocationEditModal = (allocation) => {
        setActiveAllocation(allocation);
        setAllocationForm({
            purpose: allocation?.purpose || '',
            amount: allocation?.amount ?? '',
        });
        setAllocationErrors({});
        setIsAllocationModalOpen(true);
    };

    const closeAllocationModal = () => {
        setIsAllocationModalOpen(false);
        setActiveAllocation(null);
        setAllocationForm(initialAllocationForm);
        setAllocationErrors({});
    };

    const handleAllocationChange = (event) => {
        const { name, value } = event.target;
        setAllocationForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (allocationErrors[name]) {
            setAllocationErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateAllocationForm = () => {
        const errors = {};
        if (!allocationForm.purpose?.trim()) {
            errors.purpose = 'Purpose is required.';
        }

        if (!allocationForm.amount || Number(allocationForm.amount) <= 0) {
            errors.amount = 'Amount must be greater than zero.';
        }

        setAllocationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAllocationSubmit = async (event) => {
        event.preventDefault();
        if (!campaignId) return;
        if (!validateAllocationForm()) return;

        setIsSavingAllocation(true);
        setAllocationErrors({});

        const payload = {
            purpose: allocationForm.purpose.trim(),
            amount: Number(allocationForm.amount),
        };

        try {
            if (activeAllocation?.id) {
                await updateAllocation(campaignId, activeAllocation.id, payload);
                showToast('Allocation updated successfully.');
            } else {
                await createAllocation(campaignId, payload);
                showToast('Allocation created successfully.');
            }

            await loadCampaign();
            closeAllocationModal();
        } catch (err) {
            if (err?.response?.data?.errors) {
                setAllocationErrors(err.response.data.errors);
            } else {
                setAllocationErrors({ global: 'Failed to save allocation. Please try again.' });
            }
        } finally {
            setIsSavingAllocation(false);
        }
    };

    return {
        campaign,
        isLoading,
        error,
        successMessage,
        isCampaignModalOpen,
        campaignForm,
        campaignErrors,
        isSavingCampaign,
        isAllocationModalOpen,
        activeAllocation,
        allocationForm,
        allocationErrors,
        isSavingAllocation,
        openCampaignModal,
        closeCampaignModal,
        handleCampaignChange,
        handleCampaignSubmit,
        openAllocationCreateModal,
        openAllocationEditModal,
        closeAllocationModal,
        handleAllocationChange,
        handleAllocationSubmit,
    };
};
