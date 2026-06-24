import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { useNgoDisbursements } from '../hooks/useNgoDisbursements';
import { 
    uploadDisbursementProof,
    addDisbursementProof,
    deleteDisbursementProof,
    editDisbursementProof 
} from '../services/disbursementService';
import { 
    Wallet, ArrowDownRight, ArrowUpRight, ListOrdered, Plus, Upload, FileText, Clock, 
    Trash2, Edit, PlusCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const NgoDisbursements = () => {
    const {
        dashboardData,
        isLoading,
        error,
        isModalOpen,
        campaigns,
        isSubmitting,
        formError,
        formData,
        selectedAllocations,
        setSelectedAllocations,
        receiptFile,
        setReceiptFile,
        handleOpenModal,
        closeModal,
        handleFieldChange,
        handleSubmitRequest,
        fetchDisbursementData,
    } = useNgoDisbursements();

    const [isProofModalOpen, setIsProofModalOpen] = React.useState(false);
    const [uploadingDisbursementId, setUploadingDisbursementId] = React.useState(null);
    const [proofFiles, setProofFiles] = React.useState([]);
    const [isUploadingProof, setIsUploadingProof] = React.useState(false);
    const [proofFormError, setProofFormError] = React.useState('');
    const [activeDisbursement, setActiveDisbursement] = React.useState(null);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isManagingProof, setIsManagingProof] = React.useState(false);
    const [manageProofError, setManageProofError] = React.useState('');

    const handleAddProofImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsManagingProof(true);
        setManageProofError('');
        try {
            const payload = new FormData();
            payload.append('proof_file', file);
            const response = await addDisbursementProof(activeDisbursement.id, payload);
            await fetchDisbursementData();
            const updatedDisbursement = response.data || response;
            setActiveDisbursement(updatedDisbursement);
            setCurrentImageIndex((updatedDisbursement.proof_images || []).length - 1);
        } catch (err) {
            setManageProofError(err.response?.data?.message || 'Failed to add image.');
        } finally {
            setIsManagingProof(false);
            e.target.value = '';
        }
    };

    const handleDeleteProofImage = async (imagePath) => {
        if (!window.confirm('Are you sure you want to delete this proof image?')) return;
        setIsManagingProof(true);
        setManageProofError('');
        try {
            const response = await deleteDisbursementProof(activeDisbursement.id, { image_path: imagePath });
            await fetchDisbursementData();
            const updatedDisbursement = response.data || response;
            
            const newImages = updatedDisbursement.proof_images || [];
            if (newImages.length === 0) {
                setActiveDisbursement(null);
            } else {
                setActiveDisbursement(updatedDisbursement);
                setCurrentImageIndex((prev) => Math.min(prev, newImages.length - 1));
            }
        } catch (err) {
            setManageProofError(err.response?.data?.message || 'Failed to delete image.');
        } finally {
            setIsManagingProof(false);
        }
    };

    const handleEditProofImage = async (oldImagePath, file) => {
        if (!file) return;
        setIsManagingProof(true);
        setManageProofError('');
        try {
            const payload = new FormData();
            payload.append('old_image_path', oldImagePath);
            payload.append('proof_file', file);
            const response = await editDisbursementProof(activeDisbursement.id, payload);
            await fetchDisbursementData();
            const updatedDisbursement = response.data || response;
            setActiveDisbursement(updatedDisbursement);
        } catch (err) {
            setManageProofError(err.response?.data?.message || 'Failed to replace image.');
        } finally {
            setIsManagingProof(false);
        }
    };

    const handleOpenProofModal = (id) => {
        setUploadingDisbursementId(id);
        setProofFiles([]);
        setProofFormError('');
        setIsProofModalOpen(true);
    };

    const handleCloseProofModal = () => {
        setIsProofModalOpen(false);
        setUploadingDisbursementId(null);
        setProofFiles([]);
        setProofFormError('');
    };

    const handleProofFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            setProofFormError('You can upload a maximum of 3 images.');
            return;
        }
        setProofFiles(files);
        setProofFormError('');
    };

    const handleUploadProofSubmit = async (e) => {
        e.preventDefault();
        if (proofFiles.length === 0) {
            setProofFormError('Please select at least 1 image.');
            return;
        }
        setIsUploadingProof(true);
        setProofFormError('');

        try {
            const payload = new FormData();
            proofFiles.forEach((file) => {
                payload.append('proof_files[]', file);
            });

            await uploadDisbursementProof(uploadingDisbursementId, payload);
            setIsProofModalOpen(false);
            setUploadingDisbursementId(null);
            setProofFiles([]);
            await fetchDisbursementData();
        } catch (err) {
            setProofFormError(err.response?.data?.message || 'Failed to upload proof images.');
        } finally {
            setIsUploadingProof(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                </div>
            </DashboardLayout>
        );
    }

    const { metrics, chart_data, recent_activity } = dashboardData;
    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });



    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Fund Management</h1>
                        <p className="mt-1 text-gray-500">Track campaign escrow releases, disbursements records, and utilization indicators.</p>
                    </div>
                    <Button onClick={handleOpenModal} variant="primary" className="flex items-center gap-2 rounded-xl shadow-apple-sm">
                        <Plus size={18} /> Record Payout
                    </Button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Raised" value={formatRM(metrics.total_funds_raised)} icon={ArrowUpRight} />
                    <StatCard title="Total Disbursed" value={formatRM(metrics.total_funds_disbursed)} icon={ArrowDownRight} />
                    <StatCard title="Requested (Pending)" value={formatRM(metrics.total_pending_disbursed)} icon={Clock} />
                    <StatCard title="Escrow Balance" value={formatRM(metrics.remaining_balance)} icon={Wallet} />
                </div>

                <div className="w-full">
                    <Card className="p-0 overflow-hidden border border-gray-100 shadow-apple-sm">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <ListOrdered className="text-aidwise-blue" size={20} />
                            <h3 className="font-bold text-aidwise-text">Recent Payouts</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-aidwise-text">
                                 <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Campaign</th>
                                        <th className="px-5 py-3">Purpose</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recent_activity.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-8 text-center text-gray-400 font-medium">No disbursements recorded yet.</td>
                                        </tr>
                                    ) : (
                                        recent_activity.map((activity) => (
                                            <tr key={activity.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-5 py-4 text-gray-400 font-semibold text-xs whitespace-nowrap">{formatDate(activity.created_at)}</td>
                                                <td className="px-5 py-4 font-bold text-aidwise-text truncate max-w-[200px]" title={activity.campaign?.title}>
                                                    {activity.campaign?.title || 'Unknown'}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600 font-semibold text-xs capitalize">{activity.purpose}</td>
                                                <td className="px-5 py-4 font-extrabold text-blue-600 text-right whitespace-nowrap">
                                                    {formatRM(activity.amount)}
                                                    {activity.receipt_path && (
                                                        <a 
                                                            href={activity.receipt_path.startsWith('http') ? activity.receipt_path : `${backendUrl}${activity.receipt_path}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="inline-flex items-center ml-2 text-gray-400 hover:text-aidwise-blue"
                                                            title="View Invoice Document"
                                                        >
                                                            <FileText size={13} />
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <Badge status={activity.status || 'pending'} />
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {activity.status === 'approved' && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            {(!activity.proof_images || activity.proof_images.length === 0) ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenProofModal(activity.id)}
                                                                    className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-extrabold text-xs px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all shadow-apple-xs"
                                                                    title="Upload Activity Proof Photos"
                                                                >
                                                                    <Upload size={12} />
                                                                    <span>Add Proof</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setActiveDisbursement(activity);
                                                                        setCurrentImageIndex(0);
                                                                        setManageProofError('');
                                                                    }}
                                                                    className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-extrabold text-xs px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all shadow-apple-xs cursor-pointer"
                                                                    title="Click to View Uploaded Proof Images"
                                                                >
                                                                    <FileText size={12} />
                                                                    <span>View Proof ({activity.proof_images.length})</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Record Payout Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Record Payout">
                <form onSubmit={handleSubmitRequest}>
                    {formError && <div className="mb-4 p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-100 font-bold">{formError}</div>}
                    
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-semibold text-aidwise-text">Select Campaign</label>
                        <select 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                            value={formData.campaign_id}
                            onChange={(e) => {
                                handleFieldChange('campaign_id', e.target.value);
                                setSelectedAllocations([]);
                            }}
                            required
                        >
                            {campaigns.length === 0 && <option value="" disabled>No active campaigns available</option>}
                            {campaigns.map(camp => (
                                <option key={camp.id} value={camp.id}>{camp.title}</option>
                            ))}
                        </select>
                    </div>

                    <Input 
                        label="Amount to Withdraw (RM)" type="number" min="1" placeholder="e.g. 500"
                        value={formData.amount} onChange={(e) => handleFieldChange('amount', e.target.value)} required
                    />
                    
                    {(() => {
                        const selectedCampaignObj = campaigns.find(camp => String(camp.id) === String(formData.campaign_id));
                        return (
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-semibold text-aidwise-text">Purpose of Funds (Select allocations)</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                    {selectedCampaignObj?.allocations?.map((alloc) => (
                                        <label key={alloc.id} className="flex items-center gap-2 text-xs text-aidwise-text cursor-pointer hover:bg-gray-100/50 p-1.5 rounded-lg transition-colors select-none font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={selectedAllocations.includes(alloc.purpose)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAllocations((prev) => [...prev, alloc.purpose]);
                                                    } else {
                                                        setSelectedAllocations((prev) => prev.filter((item) => item !== alloc.purpose));
                                                    }
                                                }}
                                                className="h-4 w-4 text-aidwise-blue focus:ring-aidwise-blue border-gray-300 rounded"
                                            />
                                            <div className="flex-1 flex justify-between">
                                                <span>{alloc.purpose}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    Raised: RM {Number(alloc.current_amount || 0).toLocaleString()} / Goal: RM {Number(alloc.amount).toLocaleString()}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                    <label className="flex items-center gap-2 text-xs text-amber-600 font-bold cursor-pointer hover:bg-gray-100/50 p-1.5 rounded-lg transition-colors select-none">
                                        <input
                                            type="checkbox"
                                            checked={selectedAllocations.includes('General Surplus')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAllocations((prev) => [...prev, 'General Surplus']);
                                                } else {
                                                    setSelectedAllocations((prev) => prev.filter((item) => item !== 'General Surplus'));
                                                }
                                            }}
                                            className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                                        />
                                        General Surplus
                                    </label>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Receipt document upload */}
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-semibold text-aidwise-text">
                            Supporting Quotation / Invoice Document (PDF or Image)
                        </label>
                        <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setReceiptFile(e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border border-gray-200 rounded-xl p-1.5 bg-white focus:outline-none"
                        />
                        {receiptFile && (
                            <p className="text-xs text-aidwise-blue font-bold mt-1.5 animate-in fade-in">
                                Selected: {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                        <span className="text-[10px] text-gray-400 mt-1 block">Highly recommended to ensure fast admin audit approval.</span>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-semibold text-aidwise-text">Disbursement Details</label>
                        <textarea
                            name="details"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-aidwise-text focus:outline-none focus:ring-2 focus:ring-aidwise-blue text-sm h-20 resize-none"
                            placeholder="Provide details about vendor payments, volunteer runs or logistics costs..."
                            value={formData.details || ''}
                            onChange={(e) => handleFieldChange('details', e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting Request...' : 'Submit Payout Request'}
                    </Button>
                </form>
            </Modal>

            {/* Upload Impact Proof Modal */}
            <Modal isOpen={isProofModalOpen} onClose={handleCloseProofModal} title="Upload Field Impact Proof">
                <form onSubmit={handleUploadProofSubmit} className="space-y-4">
                    {proofFormError && (
                        <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-100 font-bold">
                            {proofFormError}
                        </div>
                    )}
                    
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-aidwise-text">
                            Select Impact Proof Images (Max 3)
                        </label>
                        <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                            Upload photos of the goods distributed, volunteers in action, or activities proving the items reached the beneficiaries. Donors will see these photos directly.
                        </p>
                        <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            onChange={handleProofFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-aidwise-blue hover:file:bg-blue-100 border border-gray-200 rounded-xl p-1.5 bg-white focus:outline-none"
                        />
                        {proofFiles.length > 0 && (
                            <div className="mt-3 space-y-1">
                                <span className="text-xs font-bold text-aidwise-blue">Selected Files:</span>
                                <ul className="list-disc pl-4 text-xs text-gray-600 font-semibold space-y-0.5">
                                    {proofFiles.map((file, idx) => (
                                        <li key={idx}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <Button type="submit" variant="primary" className="w-full mt-4" disabled={isUploadingProof}>
                        {isUploadingProof ? 'Uploading Proof...' : 'Submit Impact Proof'}
                    </Button>
                </form>
            </Modal>

            {/* View Payout Proof Images Modal */}
            <Modal 
                isOpen={activeDisbursement !== null} 
                onClose={() => setActiveDisbursement(null)} 
                title="Uploaded Payout Proof Images"
                size="lg"
            >
                <div className="space-y-5">
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        Here are the real-world proof photos you uploaded for this verified payout. Donors can view these photos to track their impact.
                    </p>
                    
                    {manageProofError && (
                        <div className="p-3 bg-red-50 text-red-655 text-xs rounded-xl border border-red-100 font-bold animate-in fade-in">
                            {manageProofError}
                        </div>
                    )}

                    {activeDisbursement && (() => {
                        const images = activeDisbursement.proof_images || [];
                        const currentImagePath = images[currentImageIndex];
                        
                        return (
                            <div className="space-y-4">
                                {images.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 font-semibold">
                                        No proof images uploaded.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Slideshow Container */}
                                        <div className="bg-gray-950 rounded-2xl relative overflow-hidden h-80 flex items-center justify-center group shadow-apple-md">
                                            <img 
                                                src={currentImagePath.startsWith('http') ? currentImagePath : `${backendUrl}${currentImagePath}`} 
                                                alt={`Proof Slide ${currentImageIndex + 1}`} 
                                                className="max-h-full max-w-full object-contain mx-auto transition-all duration-300"
                                            />
                                            
                                            {/* Previous Button */}
                                            {currentImageIndex > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentImageIndex(prev => prev - 1)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                                                    title="Previous Image"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                            )}
                                            
                                            {/* Next Button */}
                                            {currentImageIndex < images.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentImageIndex(prev => prev + 1)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                                                    title="Next Image"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            )}
                                            
                                            {/* Slide Counter Overlay */}
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                                                {currentImageIndex + 1} / {images.length}
                                            </div>
                                        </div>

                                        {/* Slide Management Controls */}
                                        <div className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-xs text-gray-500 font-bold">
                                                Manage This Photo:
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {/* Edit / Replace Action */}
                                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold shadow-apple-xs transition-colors hover:text-aidwise-blue">
                                                    <Edit size={13} />
                                                    <span>Replace</span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        disabled={isManagingProof}
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                handleEditProofImage(currentImagePath, e.target.files[0]);
                                                            }
                                                        }} 
                                                    />
                                                </label>
                                                
                                                {/* Delete Action */}
                                                <button
                                                    type="button"
                                                    disabled={isManagingProof}
                                                    onClick={() => handleDeleteProofImage(currentImagePath)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-650 rounded-lg text-xs font-bold shadow-apple-xs transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Add Proof Image Action */}
                                {images.length < 3 && (
                                    <div className="pt-2">
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-600 rounded-xl text-xs font-extrabold shadow-apple-xs transition-all w-full justify-center disabled:opacity-50">
                                            <PlusCircle size={15} />
                                            <span>Upload New Proof ({3 - images.length} remaining)</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                disabled={isManagingProof}
                                                onChange={handleAddProofImage} 
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default NgoDisbursements;