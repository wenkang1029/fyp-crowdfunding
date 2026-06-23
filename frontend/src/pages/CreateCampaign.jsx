import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { useCreateCampaign } from '../hooks/useCreateCampaign';
import { generateAllocations } from '../services/campaignService';

const CreateCampaign = () => {
    const {
        formData,
        isLoading,
        errors,
        handleChange,
        setImages,
        toggleUseDefaultImage,
        allocationTotal,
        allocationValidation,
        isSubmitDisabled,
        addAllocation,
        updateAllocation,
        removeAllocation,
        setAllocations,
        handleSubmit,
        handleCancel,
    } = useCreateCampaign();

    const [step, setStep] = useState(1);
    const [localErrors, setLocalErrors] = useState({});

    // AI Budget-to-Allocation Generator States
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiSuccess, setAiSuccess] = useState(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingMessages = [
        "Reading and optimizing document layout...",
        "Scanning and extracting cost items with Gemini 2.5...",
        "Mapping items to campaign funding categories...",
        "Structuring draft allocations in RM...",
        "Finalizing allocations preview..."
    ];

    React.useEffect(() => {
        let interval;
        if (isAiGenerating) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
            }, 2500); // Change step message every 2.5 seconds
        } else {
            setLoadingStep(0);
        }
        return () => clearInterval(interval);
    }, [isAiGenerating]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsAiGenerating(true);
        setAiError(null);
        setAiSuccess(null);

        try {
            const result = await generateAllocations(file);
            if (result && result.allocations && result.allocations.length > 0) {
                // Pre-populate allocations
                setAllocations(result.allocations);
                setAiSuccess(`✓ Gemini AI successfully pre-filled ${result.allocations.length} allocations!`);
            } else {
                setAiError("The AI service could not identify any cost allocations in the uploaded document.");
            }
        } catch (err) {
            console.error("AI Allocation generation failed:", err);
            const msg = err?.response?.data?.message || "Could not connect to the AI service. Please try again or enter manually.";
            setStep(3); // Ensure user stays on step 3 to see the error
            setAiError(msg);
        } finally {
            setIsAiGenerating(false);
            // Reset file input value
            event.target.value = null;
        }
    };

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
                        
                        {/* Global & Validation Errors List */}
                        {((errors && Object.keys(errors).length > 0) || localErrors.global) && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                <span className="font-bold block mb-1">Could not create campaign:</span>
                                <ul className="list-disc pl-5 space-y-0.5">
                                    {localErrors.global && <li>{localErrors.global}</li>}
                                    {errors && Object.entries(errors).map(([field, errs]) => {
                                        if (field === 'global') {
                                            return <li key={field}>{Array.isArray(errs) ? errs[0] : errs}</li>;
                                        }
                                        return (
                                            <li key={field}>
                                                <span className="capitalize font-semibold">{field.replace('_', ' ')}</span>: {Array.isArray(errs) ? errs[0] : errs}
                                            </li>
                                        );
                                    })}
                                </ul>
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
                                    <label className="block text-sm font-medium text-aidwise-text mb-1">
                                        Campaign Images (Upload up to 5 images) <span className="text-red-500">*</span>
                                    </label>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                        <input 
                                            id="images-uploader"
                                            type="file" 
                                            accept="image/*"
                                            multiple
                                            disabled={formData.useDefaultImage}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                // Limit to 5 files maximum
                                                const selectedFiles = files.slice(0, 5);
                                                setImages(selectedFiles);
                                            }}
                                            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50/50 disabled:opacity-50"
                                        />
                                        
                                        <button
                                            type="button"
                                            onClick={() => {
                                                toggleUseDefaultImage(!formData.useDefaultImage);
                                            }}
                                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 border ${
                                                formData.useDefaultImage
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250 ring-2 ring-emerald-100'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-250'
                                            }`}
                                        >
                                            {formData.useDefaultImage ? '✓ Default Image Active' : 'Use Default Image'}
                                        </button>
                                    </div>

                                    {/* Selected Files Preview List */}
                                    {formData.images && formData.images.length > 0 && (
                                        <div className="space-y-1.5 p-3.5 bg-blue-50/30 rounded-2xl border border-blue-100/50 mb-3 animate-in fade-in duration-200">
                                            <p className="text-xs font-bold text-aidwise-blue">Selected Images ({formData.images.length} / 5):</p>
                                            <ul className="text-xs text-gray-500 list-disc pl-5 space-y-0.5">
                                                {formData.images.map((img, i) => (
                                                    <li key={i} className="font-medium truncate">{img.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {formData.useDefaultImage && (
                                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mb-3 animate-in fade-in duration-200">
                                            ✓ Preloaded a professional testing campaign cover image.
                                        </p>
                                    )}

                                    {getError('images') && (
                                        <p className="text-xs text-red-600 mt-1">{getError('images')}</p>
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

                                {/* AI Budget-to-Allocation Upload Zone */}
                                <div className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/20 to-white shadow-sm mb-6 relative overflow-hidden">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100/60 rounded-xl text-aidwise-blue font-bold text-lg animate-pulse">
                                            ✨
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-aidwise-text flex items-center gap-1.5">
                                                AI Budget-to-Allocation Generator
                                                <span className="text-[10px] bg-blue-100 text-aidwise-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Gemini Powered</span>
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Upload any budget plan, proposal, Excel file, or supplier quotation (PDF or Image) to automatically extract and pre-fill allocation items.
                                            </p>
                                            
                                            <div className="mt-4">
                                                <label className={`inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-aidwise-blue hover:bg-blue-700 rounded-xl cursor-pointer transition-all duration-200 shadow-sm ${
                                                    isAiGenerating ? 'opacity-50 pointer-events-none' : ''
                                                }`}>
                                                    <span>{isAiGenerating ? 'AI is processing...' : 'Upload Budget Reference'}</span>
                                                    <input
                                                        type="file"
                                                        accept="application/pdf, image/*"
                                                        className="hidden"
                                                        onChange={handleFileUpload}
                                                        disabled={isAiGenerating}
                                                    />
                                                </label>
                                                <span className="text-[10px] text-gray-400 ml-2 font-medium italic">PDF, JPG, PNG (Max 10MB) • Optional</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inline Status Alerts */}
                                    {isAiGenerating && (
                                        <div className="mt-4 p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-aidwise-blue font-semibold">
                                            <svg className="animate-spin h-4 w-4 text-aidwise-blue flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="animate-pulse">{loadingMessages[loadingStep]}</span>
                                        </div>
                                    )}

                                    {aiError && (
                                        <div className="mt-4 p-3 bg-red-50/80 border border-red-100 text-red-600 rounded-xl text-xs font-medium animate-in slide-in-from-top duration-300">
                                            ⚠️ {aiError}
                                        </div>
                                    )}

                                    {aiSuccess && (
                                        <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold animate-in slide-in-from-top duration-300">
                                            {aiSuccess}
                                        </div>
                                    )}
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
                                                label={formData.allocations.length > 1 ? "Purpose 1" : "Default purpose"}
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
                                                min="0"
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
                                                        min="0"
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