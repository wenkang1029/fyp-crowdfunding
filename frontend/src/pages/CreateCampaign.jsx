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
    
    // State management for our form fields
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_amount: ''
    });
    
    // HCI: Loading and Error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        const handleChange = (e) => {
        console.log("Input Name:", e.target.name);
        console.log("Keystroke:", e.target.value);
        setFormData({ ...formData, [e.target.name]: e.target.value });
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Send the data to the Laravel backend
            // Note: Your backend route might be /campaigns depending on your setup. 
            // We use standard RESTful naming conventions here.
            await axiosInstance.post('/campaigns', formData);
            
            // On success, route back to the dashboard
            navigate('/ngo/dashboard');
        } catch (err) {
            if (err.response && err.response.data.errors) {
                // Grab the first validation error from Laravel
                const firstError = Object.values(err.response.data.errors)[0][0];
                setError(firstError);
            } else {
                setError('Failed to create campaign. Please try again.');
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
                        
                        {/* Display Laravel Validation Errors */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            {/* We add 'name' attributes to map to our handleChange function */}
                            <Input 
                                label="Campaign Title" 
                                type="text" 
                                name="title"
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g., Clean Water for Rural Schools"
                                required 
                            />

                            <Input 
                                label="Target Funding Amount ($)" 
                                type="number" 
                                name="target_amount"
                                value={formData.target_amount} 
                                onChange={handleChange} 
                                placeholder="e.g., 15000"
                                required 
                            />

                            <Textarea 
                                label="Campaign Description" 
                                name="description"
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Explain the purpose, impact, and timeline of this campaign..."
                                required 
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 flex justify-end gap-3 border-t border-aidwise-border pt-6">
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate('/ngo/dashboard')}
                                disabled={isLoading}
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