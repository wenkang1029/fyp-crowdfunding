import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { useCreateCampaign } from '../hooks/useCreateCampaign';
import { generateAllocations } from '../services/campaignService';
import { 
    Plus, Calendar, Sparkles, Image as ImageIcon, Trash2, 
    ArrowLeft, ArrowRight, ShieldAlert, CheckCircle, Info 
} from 'lucide-react';

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

    useEffect(() => {
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
        } else if (step === 3) {
            if (!allocationValidation.isValid) {
                setLocalErrors({ global: allocationValidation.message });
                return;
            }
            setLocalErrors({});
            setStep(4);
        }
    };

    const handleBack = () => {
        setLocalErrors({});
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (step < 4) {
            handleNext();
        } else {
            handleSubmit(event);
        }
    };

    // Combine local validation errors with Laravel backend errors
    const getError = (fieldName) => {
        return localErrors[fieldName]?.[0] || errors[fieldName]?.[0];
    };

    const formatDateString = (dateTimeStr) => {
        if (!dateTimeStr) return '—';
        return new Date(dateTimeStr).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Create Campaign</h1>
                    <p className="mt-1 text-gray-500">Launch a new fundraising initiative in four simple steps.</p>
                </div>

                {/* Horizontal Stepper Progress Bar */}
                <div className="mb-8 flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-150 shadow-apple-sm">
                    {[
                        { number: 1, label: 'Campaign Info' },
                        { number: 2, label: 'Timeline' },
                        { number: 3, label: 'Allocations' },
                        { number: 4, label: 'Review & Publish' },
                    ].map((s, index) => (
                        <React.Fragment key={s.number}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                    step === s.number 
                                        ? 'bg-aidwise-blue text-white ring-4 ring-blue-100' 
                                        : step > s.number 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-gray-150 text-gray-400'
                                }`}>
                                    {step > s.number ? '✓' : s.number}
                                </div>
                                <span className={`text-xs font-bold hidden md:inline transition-colors duration-300 uppercase tracking-wider ${
                                    step === s.number ? 'text-aidwise-text font-extrabold' : 'text-gray-400'
                                }`}>
                                    {s.label}
                                </span>
                            </div>
                            
                            {index < 3 && (
                                <div className="flex-1 mx-3 h-0.5 bg-gray-150 relative">
                                    <div className="absolute top-0 left-0 h-full bg-aidwise-blue transition-all duration-500" 
                                         style={{ width: step > s.number ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <Card className="border border-gray-100 shadow-apple-sm p-8">
                    <form onSubmit={handleFormSubmit}>
                        
                        {/* Global & Validation Errors List */}
                        {((errors && Object.keys(errors).length > 0) || localErrors.global) && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-in fade-in">
                                <span className="font-bold block mb-1">Could not save campaign data:</span>
                                <ul className="list-disc pl-5 space-y-0.5">
                                    {localErrors.global && <li>{localErrors.global}</li>}
                                    {errors && Object.entries(errors).map(([field, errs]) => {
                                        if (field === 'global') {
                                            return <li key={field}>{Array.isArray(errs) ? errs[0] : errs}</li>;
                                        }
                                        return (
                                            <li key={field} className="text-xs">
                                                <span className="capitalize font-semibold">{field.replace('_', ' ')}</span>: {Array.isArray(errs) ? errs[0] : errs}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Step 1: Campaign Info */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-aidwise-text mb-1">Step 1: Campaign Info</h3>
                                    <p className="text-xs text-gray-400">Provide a clear title and description for your campaign.</p>
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
                                    <label className="block text-sm font-semibold text-aidwise-text mb-2">
                                        Campaign Cover Images (Max 5)
                                    </label>
                                    
                                    <div className="mb-3">
                                        {!formData.useDefaultImage ? (
                                            <label 
                                                htmlFor="images-uploader"
                                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-aidwise-blue bg-gray-50/50 hover:bg-blue-50/5 rounded-2xl p-6 cursor-pointer transition-all duration-200 text-center"
                                            >
                                                <div className="p-3 bg-blue-50 text-aidwise-blue rounded-xl mb-3">
                                                    <Plus size={22} />
                                                </div>
                                                <span className="text-sm font-bold text-aidwise-text">Upload Campaign Images</span>
                                                <span className="text-xs text-gray-450 mt-1 font-medium">JPEG, PNG, or WEBP files up to 5MB (First file acts as cover cover)</span>
                                                <input 
                                                    id="images-uploader"
                                                    type="file" 
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        const selectedFiles = files.slice(0, 5);
                                                        setImages(selectedFiles);
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-150 rounded-xl animate-in fade-in duration-200">
                                                <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                                                    <CheckCircle size={15} /> Professional testing campaign cover image preloaded.
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleUseDefaultImage(false)}
                                                    className="text-xs font-bold text-red-500 hover:underline focus:outline-none"
                                                >
                                                    Upload Custom
                                                </button>
                                            </div>
                                        )}
                                        
                                        {!formData.useDefaultImage && (
                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleUseDefaultImage(true)}
                                                    className="text-xs font-bold text-aidwise-blue hover:underline focus:outline-none"
                                                >
                                                    Or use testing placeholder cover image
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Files Preview List */}
                                    {!formData.useDefaultImage && formData.images && formData.images.length > 0 && (
                                        <div className="space-y-1.5 p-4 bg-blue-50/20 rounded-2xl border border-blue-100/30 mb-3 animate-fade-in">
                                            <p className="text-xs font-bold text-aidwise-blue">Selected files ({formData.images.length} / 5):</p>
                                            <ul className="text-xs text-gray-500 list-disc pl-5 space-y-0.5">
                                                {formData.images.map((img, i) => (
                                                    <li key={i} className="font-semibold truncate">{img.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {getError('images') && (
                                        <p className="text-xs text-red-650 font-bold mt-1.5">{getError('images')}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Campaign Timeline */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-aidwise-text mb-1">Step 2: Campaign Timeline</h3>
                                    <p className="text-xs text-gray-400">Specify start and end dates. These parameters are immutable once the campaign goes live.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-aidwise-text mb-1">Step 3: Funding Goals & Allocations</h3>
                                    <p className="text-xs text-gray-400">Add sub-goals representing direct disbursements. The overall funding goal is calculated automatically.</p>
                                </div>

                                {/* AI Budget-to-Allocation Drop Zone */}
                                <div className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/15 to-white shadow-sm relative overflow-hidden">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100/60 text-aidwise-blue rounded-xl text-lg animate-pulse">
                                            ✨
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-aidwise-text flex items-center gap-1.5">
                                                AI Budget allocation generator
                                                <span className="text-[9px] bg-blue-100 text-aidwise-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Gemini OCR</span>
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                                Upload any budget plan, invoice, quotation list, or Excel reference (PDF or image) to parse and pre-populate sub-goal targets.
                                            </p>
                                            
                                            <div className="mt-4 flex items-center gap-3">
                                                <label className={`inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-aidwise-blue hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-sm ${
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
                                                <span className="text-[10px] text-gray-400 font-semibold italic">PDF, JPG, PNG (Max 10MB)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inline Status Alerts */}
                                    {isAiGenerating && (
                                        <div className="mt-4 p-3 bg-blue-50/80 border border-blue-150 rounded-xl flex items-center gap-2.5 text-xs text-aidwise-blue font-bold">
                                            <svg className="animate-spin h-4 w-4 text-aidwise-blue shrink-0" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="animate-pulse">{loadingMessages[loadingStep]}</span>
                                        </div>
                                    )}

                                    {aiError && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-bold animate-fade-in">
                                            ⚠️ {aiError}
                                        </div>
                                    )}

                                    {aiSuccess && (
                                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold animate-fade-in">
                                            {aiSuccess}
                                        </div>
                                    )}
                                </div>

                                {errors.allocations && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-bold">
                                        {errors.allocations}
                                    </div>
                                )}

                                {/* Side-by-side budget layout */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="flex flex-col gap-4 rounded-2xl border border-gray-150 p-4 sm:flex-row sm:items-end bg-gray-50/20">
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
                                            <div className="w-full sm:w-48">
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
                                                    className="flex flex-col gap-4 rounded-2xl border border-gray-150 p-4 sm:flex-row sm:items-end bg-gray-50/20 animate-fade-in"
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
                                                    <div className="w-full sm:w-48">
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
                                                            className="flex items-center gap-1 text-xs px-3 py-2.5 rounded-xl border border-red-200"
                                                            onClick={() => removeAllocation(allocationIndex)}
                                                            disabled={isLoading}
                                                        >
                                                            <Trash2 size={13} /> Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm border-t border-dashed border-gray-200 pt-4 mt-2">
                                            <span className="font-extrabold text-base text-aidwise-text">
                                                Total Target Goal: RM {allocationTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={addAllocation}
                                                disabled={isLoading}
                                                className="font-bold text-aidwise-blue hover:text-blue-700 text-sm flex items-center gap-1 focus:outline-none"
                                            >
                                                + Add another allocation
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Sidebar interactive parser guide */}
                                    <div className="md:col-span-1">
                                        <div className="p-5 bg-blue-50/30 border border-blue-100/40 rounded-2xl shadow-apple-sm space-y-4">
                                            <h4 className="text-xs font-bold text-aidwise-blue uppercase tracking-wider flex items-center gap-1.5">
                                                <Info size={14} /> Allocation Guide
                                            </h4>
                                            <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                                                By dividing budgets into clean, specific categories, donors see exactly where their funds go, establishing visual transparency.
                                            </p>
                                            <div className="space-y-2 text-[10px] font-bold text-gray-550 pt-2 border-t border-gray-150">
                                                <div className="flex items-center gap-2 text-emerald-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span>OCR auto-fill parses values.</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                    <span>Targets are locked when live.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!allocationValidation.isValid && (
                                    <div className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                        ⚠️ {allocationValidation.message}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Review Summary Page */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-aidwise-text mb-1">Step 4: Review & Publish</h3>
                                    <p className="text-xs text-gray-400">Review your campaign details before publishing to SJAM KMT. Values are immutable post-moderation.</p>
                                </div>

                                <div className="space-y-5 border border-gray-150 p-6 rounded-2xl bg-gray-50/20">
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Campaign Title</span>
                                        <span className="text-base font-extrabold text-aidwise-text block mt-1">{formData.title}</span>
                                    </div>
                                    
                                    <div className="border-t border-gray-150 pt-4">
                                        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Campaign Description Preview</span>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">{formData.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-gray-150 pt-4">
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Opening Date</span>
                                            <span className="text-xs font-bold text-gray-700 block mt-1">{formatDateString(formData.start_date)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Closing Date</span>
                                            <span className="text-xs font-bold text-gray-700 block mt-1">{formatDateString(formData.end_date)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-150 pt-4">
                                        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2">Fund Allocation Breakdown</span>
                                        <div className="space-y-2">
                                            {formData.allocations.map((alloc, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100 text-xs">
                                                    <span className="font-bold text-gray-655">{alloc.purpose || `Allocation ${idx + 1}`}</span>
                                                    <span className="font-extrabold text-aidwise-blue">{formatRM(alloc.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-150 pt-4 flex justify-between items-center text-sm font-extrabold text-aidwise-text">
                                        <span>Total Funding Goal</span>
                                        <span className="text-lg text-aidwise-blue">{formatRM(allocationTotal)}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800 font-semibold leading-relaxed">
                                    <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                                    <div>
                                        <span className="font-bold block text-amber-900 mb-0.5">Campaign Moderation Safe Guards</span>
                                        SJAM KMT enforces auditability. Campaign allocations and timelines cannot be updated once approval has been granted. Please review terms before submitting.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Actions */}
                        <div className="mt-8 flex justify-between border-t border-gray-150 pt-6">
                            {/* Left Side: Cancel or Back */}
                            <div>
                                {step === 1 ? (
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        type="button"
                                        className="rounded-xl px-5 text-sm font-semibold"
                                    >
                                        Cancel
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleBack}
                                        disabled={isLoading}
                                        type="button"
                                        className="rounded-xl px-5 text-sm font-semibold flex items-center gap-1.5"
                                    >
                                        <ArrowLeft size={14} /> Back
                                    </Button>
                                )}
                            </div>

                            {/* Right Side: Next or Submit */}
                            <div>
                                {step < 4 ? (
                                    <Button 
                                        type="button"
                                        variant="primary"
                                        onClick={handleNext}
                                        disabled={
                                            (step === 1 && (!formData.title?.trim() || !formData.description?.trim())) ||
                                            (step === 2 && (!formData.start_date || !formData.end_date))
                                        }
                                        className="rounded-xl px-5 text-sm font-semibold flex items-center gap-1.5"
                                    >
                                        Next <ArrowRight size={14} />
                                    </Button>
                                ) : (
                                    <Button 
                                        type="submit" 
                                        variant="primary"
                                        disabled={isSubmitDisabled || isLoading}
                                        className="rounded-xl px-5 text-sm font-semibold"
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