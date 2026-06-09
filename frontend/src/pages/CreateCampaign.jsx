import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { useCreateCampaign } from '../hooks/useCreateCampaign';

const CreateCampaign = () => {
    const {
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
    } = useCreateCampaign();

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

                            <Textarea 
                                label="Campaign Description" 
                                name="description"
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Explain the purpose, impact, and timeline of this campaign..."
                                required 
                                error={errors.description?.[0]} // Pass specific Laravel error
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Start Date"
                                    type="datetime-local"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                    error={errors.start_date?.[0]}
                                />

                                <Input
                                    label="End Date"
                                    type="datetime-local"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                    error={errors.end_date?.[0]}
                                />
                            </div>

                        </div>

                        <div className="mt-8 border-t border-aidwise-border pt-6">
                            <div>
                                <h2 className="text-lg font-semibold text-aidwise-text">Funding Goal</h2>
                                <p className="text-sm text-gray-500">
                                    Enter the amount you want to raise. Add more rows if you want to split it by purpose.
                                </p>
                            </div>

                            {errors.allocations && (
                                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                    {errors.allocations}
                                </div>
                            )}

                            <div className="mt-4 space-y-4">
                                <div className="flex flex-col gap-4 rounded-xl border border-aidwise-border p-4 sm:flex-row sm:items-end">
                                    <div className="flex-1">
                                        <Input
                                            label="Default purpose"
                                            type="text"
                                            value={formData.allocations[0]?.purpose || ''}
                                            onChange={(event) =>
                                                updateAllocation(0, 'purpose', event.target.value)
                                            }
                                            placeholder="e.g., Campaign allocation"
                                        />
                                    </div>
                                    <div className="w-full sm:w-52">
                                        <Input
                                            label="Amount ($)"
                                            type="number"
                                            value={formData.allocations[0]?.amount || ''}
                                            onChange={(event) =>
                                                updateAllocation(0, 'amount', event.target.value)
                                            }
                                            placeholder="e.g., 5000"
                                        />
                                    </div>
                                </div>

                                {formData.allocations.slice(1).map((allocation, index) => {
                                    const allocationIndex = index + 1;

                                    return (
                                        <div
                                            key={`allocation-${allocationIndex}`}
                                            className="flex flex-col gap-4 rounded-xl border border-aidwise-border p-4 sm:flex-row sm:items-end"
                                        >
                                            <div className="flex-1">
                                                <Input
                                                    label={`Purpose ${allocationIndex + 1}`}
                                                    type="text"
                                                    value={allocation.purpose}
                                                    onChange={(event) =>
                                                        updateAllocation(allocationIndex, 'purpose', event.target.value)
                                                    }
                                                    placeholder="e.g., Medical supplies"
                                                />
                                            </div>
                                            <div className="w-full sm:w-52">
                                                <Input
                                                    label="Amount ($)"
                                                    type="number"
                                                    value={allocation.amount}
                                                    onChange={(event) =>
                                                        updateAllocation(allocationIndex, 'amount', event.target.value)
                                                    }
                                                    placeholder="e.g., 2500"
                                                />
                                            </div>
                                            <div className="sm:pb-1">
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    onClick={() => removeAllocation(allocationIndex)}
                                                    disabled={isLoading}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                                    <span>Total funding goal: ${allocationTotal.toLocaleString()}</span>
                                    <button
                                        type="button"
                                        onClick={addAllocation}
                                        disabled={isLoading}
                                        className="font-semibold text-aidwise-blue hover:text-blue-700"
                                    >
                                        Add another allocation
                                    </button>
                                </div>
                            </div>

                            {!allocationValidation.isValid && (
                                <div className="mt-2 text-sm text-amber-600">
                                    {allocationValidation.message}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-aidwise-border pt-6">
                            <Button 
                                variant="secondary" 
                                onClick={handleCancel}
                                disabled={isLoading}
                                type="button" // Ensure this doesn't submit the form
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={isSubmitDisabled}
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