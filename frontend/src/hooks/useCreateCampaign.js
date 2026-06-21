import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../services/campaignService';

const initialFormData = {
    title: '',
    description: '',
    allocations: [{ purpose: '', amount: '' }],
    start_date: '',
    end_date: '',
    image: null,
};

export const useCreateCampaign = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => {
            const nextData = {
                ...prev,
                [name]: value,
            };

            if (
                name === 'title'
                && prev.allocations.length === 1
                && prev.allocations[0].purpose.trim() === ''
            ) {
                nextData.allocations = [
                    {
                        ...prev.allocations[0],
                        purpose: value,
                    },
                ];
            }

            return nextData;
        });

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }

        if (errors.allocations) {
            setErrors((prev) => ({
                ...prev,
                allocations: null,
            }));
        }
    };

    const addAllocation = () => {
        setFormData((prev) => ({
            ...prev,
            allocations: [...prev.allocations, { purpose: '', amount: '' }],
        }));
    };

    const updateAllocation = (index, field, value) => {
        setFormData((prev) => {
            const nextAllocations = prev.allocations.map((allocation, allocationIndex) => {
                if (allocationIndex !== index) {
                    return allocation;
                }

                return {
                    ...allocation,
                    [field]: value,
                };
            });

            return {
                ...prev,
                allocations: nextAllocations,
            };
        });

        if (errors.allocations) {
            setErrors((prev) => ({
                ...prev,
                allocations: null,
            }));
        }
    };

    const removeAllocation = (index) => {
        setFormData((prev) => {
            if (prev.allocations.length <= 1) {
                return prev;
            }

            return {
                ...prev,
                allocations: prev.allocations.filter((_, allocationIndex) => allocationIndex !== index),
            };
        });
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const allocationValidation = getAllocationValidation(formData.allocations);

            if (!allocationValidation.isValid) {
                setErrors({ allocations: allocationValidation.message });
                setIsLoading(false);
                return;
            }

            // Validate dates client-side
            if (!formData.start_date || !formData.end_date) {
                setErrors({ global: 'Please provide both start and end dates for the campaign.' });
                setIsLoading(false);
                return;
            }

            if (new Date(formData.start_date) > new Date(formData.end_date)) {
                setErrors({ global: 'Start date must be before or equal to end date.' });
                setIsLoading(false);
                return;
            }

            const totalAllocated = getAllocationTotal(formData.allocations);

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('target_amount', totalAllocated);
            data.append('start_date', new Date(formData.start_date).toISOString());
            data.append('end_date', new Date(formData.end_date).toISOString());
            
            const formattedAllocations = formData.allocations.map((allocation) => ({
                purpose: allocation.purpose.trim(),
                amount: parseFloat(allocation.amount),
            }));
            data.append('allocations', JSON.stringify(formattedAllocations));

            if (formData.image) {
                data.append('image', formData.image);
            }

            await createCampaign(data);
            navigate('/ngo/dashboard');
        } catch (err) {
            if (err?.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ global: 'Failed to create campaign. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/ngo/campaigns');
    };

    const allocationTotal = formData.allocations.reduce(
        (sum, allocation) => sum + (parseFloat(allocation.amount) || 0),
        0
    );

    const allocationValidation = getAllocationValidation(formData.allocations);
    const isFormValid = Boolean(formData.title.trim() && formData.description.trim())
        && allocationValidation.isValid;
    const isSubmitDisabled = isLoading || !isFormValid;

    return {
        formData,
        isLoading,
        errors,
        handleChange,
        allocationTotal,
        allocationValidation,
        isSubmitDisabled,
        addAllocation,
        updateAllocation,
        removeAllocation,
        handleSubmit,
        handleCancel,
    };
};

const getAllocationTotal = (allocations) => allocations.reduce(
    (sum, allocation) => sum + (parseFloat(allocation.amount) || 0),
    0
);

const getAllocationValidation = (allocations) => {
    if (!allocations.length) {
        return { isValid: false, message: 'Add at least one allocation.' };
    }

    const invalidAllocation = allocations.some(
        (allocation) => !allocation.purpose?.trim() || !Number(allocation.amount)
    );

    if (invalidAllocation) {
        return { isValid: false, message: 'Each allocation needs a purpose and amount.' };
    }

    const totalAllocated = getAllocationTotal(allocations);

    if (totalAllocated <= 0) {
        return { isValid: false, message: 'Allocation total must be greater than zero.' };
    }

    return { isValid: true, message: '' };
};
