import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getAdminDisbursements, updateDisbursementStatus } from '../services/disbursementService';
import { Wallet, CheckCircle, XCircle, MessageSquareWarning, FileText } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

const AdminDisbursements = () => {
    const [disbursements, setDisbursements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null); // Tracks which row is loading
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchDisbursements();
    }, []);

    const fetchDisbursements = async () => {
        try {
            const data = await getAdminDisbursements();
            setDisbursements(data);
        } catch {
            setError('Failed to load payout requests.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus, reason = null) => {
     setProcessingId(id);
     try {
         await updateDisbursementStatus(id, { 
             status: newStatus,
             rejection_reason: reason 
         });

         // Optimistic UI Update
         setDisbursements(disbursements.map(d => 
             d.id === id ? { ...d, status: newStatus, rejection_reason: reason } : d
         ));

         if (newStatus === 'rejected') {
             setRejectModalOpen(false);
             setRejectionReason('');
         }
          } catch (err) {
              alert(err.response?.data?.message || 'Failed to update status.');
          } finally {
              setProcessingId(null);
          }
      };

    // Helper to open the modal
    const promptRejection = (id) => {
        setRejectingId(id);
        setRejectModalOpen(true);
    };

    const formatRM = (amount) => `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aidwise-blue"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">Payout Requests</h1>
                    <p className="mt-1 text-gray-500">Review and approve NGO fund disbursements.</p>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

                <Card className="p-0 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <Wallet className="text-aidwise-blue" size={20} />
                        <h3 className="font-bold text-aidwise-text">Pending & Processed Requests</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-aidwise-text">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">NGO Name</th>
                                    <th className="px-5 py-3">Campaign</th>
                                    <th className="px-5 py-3">Purpose</th>
                                    <th className="px-5 py-3 text-right">Amount</th>
                                    <th className="px-5 py-3 text-center">Attachment</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {disbursements.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-5 py-8 text-center text-gray-400">No payout requests found.</td>
                                    </tr>
                                ) : (
                                    disbursements.map((d) => (
                                        <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDate(d.created_at)}</td>
                                            <td className="px-5 py-4">
                                                <div 
                                                    className="max-w-[150px] truncate font-semibold text-aidwise-blue" 
                                                    title={d.campaign?.user?.name || 'Unknown NGO'}
                                                >
                                                    {d.campaign?.user?.name || 'Unknown NGO'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div 
                                                    className="max-w-[180px] truncate font-medium text-aidwise-text" 
                                                    title={d.campaign?.title || 'Unknown'}
                                                >
                                                    {d.campaign?.title || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div 
                                                    className="max-w-[150px] truncate text-gray-600 capitalize font-medium" 
                                                    title={d.purpose}
                                                >
                                                    {d.purpose}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-bold text-green-600 text-right whitespace-nowrap">{formatRM(d.amount)}</td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                {d.receipt_path ? (
                                                    <a 
                                                        href={d.receipt_path.startsWith('http') ? d.receipt_path : `${backendUrl}${d.receipt_path}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-aidwise-blue hover:underline bg-white border border-gray-250 px-2.5 py-1.5 rounded-lg shadow-apple-sm"
                                                        title="View Invoice Document"
                                                    >
                                                        <FileText size={14} />
                                                        <span>View File</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">None</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge status={d.status} />
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {/* FIX: If status is null, undefined, or 'pending', show the buttons! */}
                                                {(!d.status || d.status.toLowerCase() === 'pending') ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            className="px-3 py-1.5 text-xs flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
                                                            onClick={() => handleUpdateStatus(d.id, 'approved')}
                                                            disabled={processingId === d.id}
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </Button>
                                                        <Button 
                                                         variant="outline" 
                                                         className="px-3 py-1.5 text-xs flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-50"
                                                         onClick={() => promptRejection(d.id)}
                                                         disabled={processingId === d.id}
                                                        >
                                                         <XCircle size={14} /> Reject
                                                         </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic capitalize">
                                                        {d.status}
                                                    </span>
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
            <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Payout Request">
             <div className="mb-4 text-sm text-gray-600 flex gap-2 items-start bg-amber-50 p-3 rounded-lg border border-amber-100">
                 <MessageSquareWarning className="text-amber-500 shrink-0" size={18} />
                 <p>Please provide a reason for rejecting this payout. This will be visible to the NGO.</p>
             </div>
             <Input 
                 label="Reason for Rejection"
                 type="text"
                 placeholder="e.g., Missing quotation documents"
                 value={rejectionReason}
                 onChange={(e) => setRejectionReason(e.target.value)}
             />
             <div className="flex gap-3 mt-6">
                 <Button variant="outline" className="flex-1" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                 <Button 
                     variant="primary" 
                     className="flex-1 bg-red-600 hover:bg-red-700" 
                     onClick={() => handleUpdateStatus(rejectingId, 'rejected', rejectionReason)}
                     disabled={!rejectionReason.trim()}
                 >
                     Confirm Rejection
                 </Button>
             </div>
         </Modal>
        </DashboardLayout>
    );
};

export default AdminDisbursements;