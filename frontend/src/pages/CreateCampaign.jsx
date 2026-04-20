import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import axiosInstance from '../api/axios';

const CreateCampaign = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_amount: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);
    // NEW: We now use an object to hold multiple specific errors
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // HCI: Clear the specific error when the user starts typing again!
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({}); // Clear previous errors

        try {
            await axiosInstance.post('/campaigns', formData);
            navigate('/ngo/dashboard');
        } catch (err) {
            // Check if Laravel sent us structured validation errors
            if (err.response && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                // Fallback for global server errors
                setErrors({ global: 'Failed to create campaign. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Create Campaign</h1>
                    <p className="mt-1 text-gray-500">Launch a new fundraising initiative.</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        
                        {/* Global Error (e.g., 500 Server Error) */}
                        {errors.global && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                {errors.global}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Input 
                                label="Campaign Title" 
                                type="text" 
                                name="title"
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g., Clean Water for Rural Schools"
                                required 
                                error={errors.title?.[0]} // Pass specific Laravel error
                            />

                            <Input 
                                label="Target Funding Amount ($)" 
                                type="number" 
                                name="target_amount"
                                value={formData.target_amount} 
                                onChange={handleChange} 
                                placeholder="Max amount: 1,000,000" // HCI Hint added!
                                required 
                                error={errors.target_amount?.[0]} // Pass specific Laravel error
                            />

                            <Textarea 
                                label="Campaign Description" 
                                name="description"
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Explain the purpose, impact, and timeline of this campaign..."
                                required 
                                error={errors.description?.[0]} // Pass specific Laravel error
                            />
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-aidwise-border pt-6">
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate('/ngo/dashboard')}
                                disabled={isLoading}
                                type="button" // Ensure this doesn't submit the form
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Publishing...' : 'Publish Campaign'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateCampaign;