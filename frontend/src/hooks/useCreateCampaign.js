import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../services/campaignService';

const initialFormData = {
    title: '',
    description: '',
    target_amount: '',
};

export const useCreateCampaign = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            await createCampaign(formData);
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
        navigate('/ngo/dashboard');
    };

    return {
        formData,
        isLoading,
        errors,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
