import React, { useState } from 'react';
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

    const [step, setStep] = useState(1);
    const [localErrors, setLocalErrors] = useState({});

    const validateStep1 = () => {
        const errs = {};
        if (!formData.title?.trim()) {
            errs.title = ['Campaign Title is required.'];
        }
        if (!formData.description?.trim()) {
            errs.description = ['Campaign Description is required.'];
        }
        setLocalErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
        const errs = {};
        if (!formData.start_date) {
            errs.start_date = ['Start Date is required.'];
        }
        if (!formData.end_date) {
            errs.end_date = ['End Date is required.'];
        }
        if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
            errs.start_date = ['Start date must be before or equal to end date.'];
        }
        setLocalErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setLocalErrors({});
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setLocalErrors({});
            setStep(3);
        }
    };

    const handleBack = () => {
        setLocalErrors({});
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (step < 3) {
            handleNext();
        } else {
            handleSubmit(event);
        }
    };

    // Combine local validation errors with Laravel backend errors
    const getError = (fieldName) => {
        return localErrors[fieldName]?.[0] || errors[fieldName]?.[0];
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Create Campaign</h1>
                    <p className="mt-1 text-gray-500">Launch a new fundraising initiative.</p>
                </div>

                {/* Horizontal Stepper Progress Bar */}
                <div className="mb-8 flex items-center justify-between bg-white p-5 rounded-2xl border border-aidwise-border/50 shadow-sm">
                    {[
                        { number: 1, label: 'Campaign Info' },
                        { number: 2, label: 'Campaign Timeline' },
                        { number: 3, label: 'Allocation Setup' },
                    ].map((s, index) => (
                        <React.Fragment key={s.number}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                    step === s.number 
                                        ? 'bg-aidwise-blue text-white ring-4 ring-blue-100' 
                                        : step > s.number 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {step > s.number ? '✓' : s.number}
                                </div>
                                <span className={`text-sm font-semibold hidden sm:inline transition-colors duration-300 ${
                                    step === s.number ? 'text-aidwise-text font-bold' : 'text-gray-400'
                                }`}>
                                    {s.label}
                                </span>
                            </div>
                            
                            {index < 2 && (
                                <div className="flex-1 mx-4 h-0.5 bg-gray-200 relative">
                                    <div className="absolute top-0 left-0 h-full bg-aidwise-blue transition-all duration-500" 
                                         style={{ width: step > s.number ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <Card>
                    <form onSubmit={handleFormSubmit}>
                        
                        {/* Global Error (e.g., 500 Server Error) */}
                        {(errors.global || localErrors.global) && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                {errors.global || localErrors.global}
                            </div>
                        )}

                        {/* Step 1: Campaign Info */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-aidwise-text mb-1">Step 1: Campaign Info</h3>
                                    <p className="text-xs text-gray-400 mb-4">Provide a clear title and description for your campaign.</p>
                                </div>

                                <Input 
                                    label="Campaign Title" 
                                    type="text" 
                                    name="title"
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g., Clean Water for Rural Schools"
                                    required 
                                    error={getError('title')}
                                />

                                <Textarea 
                                    label="Campaign Description" 
                                    name="description"
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    placeholder="Explain the purpose, impact, and timeline of this campaign..."
                                    required 
                                    error={getError('description')}
                                    rows={6}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-aidwise-text mb-1">Campaign Cover Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                handleChange({ target: { name: 'image', value: file } });
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50/50"
                                    />
                                    {formData.image && (
                                        <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                                            ✓ {formData.image.name} selected
                                        </p>
                                    )}
                                    {getError('image') && (
                                        <p className="text-xs text-red-600 mt-1">{getError('image')}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Campaign Timeline */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-aidwise-text mb-1">Step 2: Campaign Timeline</h3>
                                    <p className="text-xs text-gray-400 mb-4">Specify when the campaign starts and ends. Start/end dates cannot be modified after launching.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Start Date"
                                        type="datetime-local"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        error={getError('start_date')}
                                    />

                                    <Input
                                        label="End Date"
                                        type="datetime-local"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                        error={getError('end_date')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Allocation Setup */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-aidwise-text mb-1">Step 3: Funding Goal & Allocations</h3>
                                    <p className="text-xs text-gray-400 mb-4">Add your allocations. The total funding goal is calculated automatically.</p>
                                </div>

                                {errors.allocations && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                        {errors.allocations}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 rounded-xl border border-aidwise-border p-4 sm:flex-row sm:items-end bg-gray-50/30">
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
                                                label="Amount (RM)"
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
                                                className="flex flex-col gap-4 rounded-xl border border-aidwise-border p-4 sm:flex-row sm:items-end bg-gray-50/30 animate-in fade-in duration-200"
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
                                                        label="Amount (RM)"
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
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm border-t border-dashed border-gray-200 pt-4 mt-2">
                                        <span className="font-bold text-base text-aidwise-text">
                                            Total Funding Goal: RM {allocationTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={addAllocation}
                                            disabled={isLoading}
                                            className="font-bold text-aidwise-blue hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            + Add another allocation
                                        </button>
                                    </div>
                                </div>

                                {!allocationValidation.isValid && (
                                    <div className="mt-2 text-sm font-semibold text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                                        ⚠️ {allocationValidation.message}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Actions */}
                        <div className="mt-8 flex justify-between border-t border-aidwise-border pt-6">
                            {/* Left Side: Cancel or Back */}
                            <div>
                                {step === 1 ? (
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        type="button"
                                    >
                                        Cancel
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleBack}
                                        disabled={isLoading}
                                        type="button"
                                    >
                                        Back
                                    </Button>
                                )}
                            </div>

                            {/* Right Side: Next or Submit */}
                            <div>
                                {step < 3 ? (
                                    <Button 
                                        type="button"
                                        variant="primary"
                                        onClick={handleNext}
                                        disabled={
                                            step === 1 
                                                ? (!formData.title?.trim() || !formData.description?.trim())
                                                : (!formData.start_date || !formData.end_date)
                                        }
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button 
                                        type="submit" 
                                        variant="primary"
                                        disabled={isSubmitDisabled}
                                    >
                                        {isLoading ? 'Publishing...' : 'Publish Campaign'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateCampaign;