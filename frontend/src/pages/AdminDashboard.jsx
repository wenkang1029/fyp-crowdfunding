import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import { getCampaigns, updateCampaign, deleteCampaign } from '../services/campaignService';
import { getAllUsers, updateUserStatus, deleteUser, adminCreateUser } from '../services/authService';
import { CheckCircle, XCircle, AlertCircle, Users, Megaphone, UserPlus, Trash2, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
    // Tab State: 'campaigns' | 'users'
    const [activeTab, setActiveTab] = useState('campaigns');

    // Campaigns list state
    const [campaigns, setCampaigns] = useState([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [campaignsError, setCampaignsError] = useState('');

    // Users list state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');

    // Modal state for Admin Creating User
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createPasswordConfirmation, setCreatePasswordConfirmation] = useState('');
    const [createRole, setCreateRole] = useState('donor');
    const [createOrgName, setCreateOrgName] = useState('');
    const [createOrgReg, setCreateOrgReg] = useState('');
    const [createOrgDesc, setCreateOrgDesc] = useState('');
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'campaigns') {
            fetchCampaigns();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchCampaigns = async () => {
        setCampaignsLoading(true);
        try {
            const data = await getCampaigns();
            setCampaigns(data);
        } catch {
            setCampaignsError('Failed to load campaigns.');
        } finally {
            setCampaignsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch {
            setUsersError('Failed to load users.');
        } finally {
            setUsersLoading(false);
        }
    };

    // Campaign Actions
    const handleUpdateCampaignStatus = async (id, newStatus) => {
        try {
            await updateCampaign(id, { status: newStatus });
            setCampaigns(campaigns.map(camp => 
                camp.id === id ? { ...camp, status: newStatus } : camp
            ));
        } catch {
            alert('Failed to update status. Please try again.');
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign permanently?')) return;
        try {
            await deleteCampaign(id);
            setCampaigns(campaigns.filter(camp => camp.id !== id));
        } catch {
            alert('Failed to delete campaign.');
        }
    };

    // User Actions
    const handleToggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        const msg = currentStatus === 'suspended' 
            ? 'Are you sure you want to reactivate this user?' 
            : 'Are you sure you want to suspend this user? This will log them out and block all their actions.';
        
        if (!window.confirm(msg)) return;

        try {
            await updateUserStatus(id, newStatus);
            setUsers(users.map(u => 
                u.id === id ? { ...u, status: newStatus } : u
            ));
        } catch (err) {
            const errMsg = err?.response?.data?.message || 'Failed to update user status.';
            alert(errMsg);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user account permanently?')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            const errMsg = err?.response?.data?.message || 'Failed to delete user.';
            alert(errMsg);
        }
    };

    // Create User Form Submission
    const handleCreateUserSubmit = async (e) => {
        e.preventDefault();
        setCreateError('');

        if (createPassword !== createPasswordConfirmation) {
            setCreateError('Passwords do not match.');
            return;
        }

        setCreateLoading(true);

        try {
            const payload = {
                name: createName,
                email: createEmail,
                password: createPassword,
                password_confirmation: createPasswordConfirmation,
                role: createRole
            };

            if (createRole === 'ngo') {
                payload.org_name = createOrgName;
                payload.org_reg_number = createOrgReg;
                payload.org_description = createOrgDesc;
            }

            await adminCreateUser(payload);
            setIsCreateModalOpen(false);
            
            // Clear inputs
            setCreateName('');
            setCreateEmail('');
            setCreatePassword('');
            setCreatePasswordConfirmation('');
            setCreateRole('donor');
            setCreateOrgName('');
            setCreateOrgReg('');
            setCreateOrgDesc('');

            // Reload users
            fetchUsers();
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to create user account.';
            setCreateError(message);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto font-sans">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text">System Administration</h1>
                        <p className="mt-1 text-gray-500 text-sm">Monitor and moderate campaigns, NGOs, and donor accounts.</p>
                    </div>
                    {activeTab === 'users' && (
                        <Button
                            variant="primary"
                            className="flex items-center gap-2"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <UserPlus size={18} />
                            <span>Create New User</span>
                        </Button>
                    )}
                </div>

                {/* Custom Tab Switcher */}
                <div className="flex border-b border-aidwise-border mb-6">
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all duration-200 ${
                            activeTab === 'campaigns'
                                ? 'border-aidwise-blue text-aidwise-blue bg-blue-50/20'
                                : 'border-transparent text-gray-400 hover:text-aidwise-text'
                        }`}
                    >
                        <Megaphone size={16} />
                        Campaigns Management
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all duration-200 ${
                            activeTab === 'users'
                                ? 'border-aidwise-blue text-aidwise-blue bg-blue-50/20'
                                : 'border-transparent text-gray-400 hover:text-aidwise-text'
                        }`}
                    >
                        <Users size={16} />
                        Users Management
                    </button>
                </div>

                {/* CAMPAIGNS TAB CONTENT */}
                {activeTab === 'campaigns' && (
                    <Card className="overflow-hidden p-0 border border-aidwise-border shadow-apple">
                        <div className="p-5 border-b border-aidwise-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-md font-bold text-aidwise-text">All Campaigns</h3>
                            {campaignsError && <span className="text-sm text-red-500 font-semibold">{campaignsError}</span>}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-aidwise-text">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-aidwise-border">
                                    <tr>
                                        <th className="px-6 py-4">Campaign Title & Organizer</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Target Amount</th>
                                        <th className="px-6 py-4 text-right">Raised Amount</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-aidwise-border">
                                    {campaignsLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading campaigns...</td>
                                        </tr>
                                    ) : campaigns.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400 flex flex-col items-center">
                                                <AlertCircle className="mb-2 opacity-50 text-gray-400" size={24} />
                                                No campaigns registered in the system.
                                            </td>
                                        </tr>
                                    ) : (
                                        campaigns.map((camp) => (
                                            <tr key={camp.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-aidwise-text">{camp.title}</p>
                                                    <p className="text-xs text-gray-400">NGO: {camp.user?.name || 'Unknown NGO'}</p>
                                                    {camp.user?.status === 'suspended' && (
                                                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold border border-red-100">
                                                            <ShieldAlert size={10} /> NGO Suspended
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge status={camp.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-600">
                                                    RM {Number(camp.target_amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-aidwise-blue">
                                                    RM {Number(camp.current_amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {camp.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateCampaignStatus(camp.id, 'active')}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateCampaignStatus(camp.id, 'rejected')}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {camp.status === 'active' && (
                                                            <button
                                                                onClick={() => handleUpdateCampaignStatus(camp.id, 'completed')}
                                                                className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-aidwise-blue hover:bg-blue-100 rounded-lg transition-colors"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteCampaign(camp.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Campaign"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* USERS TAB CONTENT */}
                {activeTab === 'users' && (
                    <Card className="overflow-hidden p-0 border border-aidwise-border shadow-apple">
                        <div className="p-5 border-b border-aidwise-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-md font-bold text-aidwise-text">Registered Users</h3>
                            {usersError && <span className="text-sm text-red-500 font-semibold">{usersError}</span>}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-aidwise-text">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-aidwise-border">
                                    <tr>
                                        <th className="px-6 py-4">Name & Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">NGO Organization Details</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-aidwise-border">
                                    {usersLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading users...</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-aidwise-text">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${
                                                        user.role === 'admin' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : user.role === 'ngo' 
                                                                ? 'bg-blue-100 text-blue-800' 
                                                                : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate">
                                                    {user.role === 'ngo' ? (
                                                        <div>
                                                            <p className="font-semibold text-xs text-aidwise-text">{user.org_name || '-'}</p>
                                                            <p className="text-[10px] text-gray-400">Reg: {user.org_reg_number || '-'}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Not Applicable</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${
                                                        user.status === 'suspended' 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {user.role !== 'admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                                                        user.status === 'suspended'
                                                                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                                            : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                                                    }`}
                                                                >
                                                                    {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {user.role === 'admin' && (
                                                            <span className="text-xs text-gray-400 italic">Protected</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* MODAL: ADMIN CREATES NEW USER */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Create User Account"
                >
                    <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                        {createError && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-semibold">
                                ⚠️ {createError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setCreateRole('donor')}
                                className={`py-2 text-xs font-bold rounded-xl border-2 ${
                                    createRole === 'donor' 
                                        ? 'border-aidwise-blue bg-blue-50 text-aidwise-blue' 
                                        : 'border-gray-200 text-gray-400'
                                }`}
                            >
                                Donor
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreateRole('ngo')}
                                className={`py-2 text-xs font-bold rounded-xl border-2 ${
                                    createRole === 'ngo' 
                                        ? 'border-aidwise-blue bg-blue-50 text-aidwise-blue' 
                                        : 'border-gray-200 text-gray-400'
                                }`}
                            >
                                NGO
                            </button>
                        </div>

                        <Input
                            label="Full Name"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                type="password"
                                value={createPassword}
                                onChange={(e) => setCreatePassword(e.target.value)}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={createPasswordConfirmation}
                                onChange={(e) => setCreatePasswordConfirmation(e.target.value)}
                                required
                            />
                        </div>

                        {createRole === 'ngo' && (
                            <div className="space-y-4 border-t border-aidwise-border pt-4 mt-2">
                                <h4 className="text-xs font-bold text-aidwise-text">NGO Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Org Name"
                                        value={createOrgName}
                                        onChange={(e) => setCreateOrgName(e.target.value)}
                                        required={createRole === 'ngo'}
                                    />
                                    <Input
                                        label="Reg Number"
                                        value={createOrgReg}
                                        onChange={(e) => setCreateOrgReg(e.target.value)}
                                        required={createRole === 'ngo'}
                                    />
                                </div>
                                <Textarea
                                    label="Description"
                                    value={createOrgDesc}
                                    onChange={(e) => setCreateOrgDesc(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-aidwise-border">
                            <Button
                                variant="secondary"
                                type="button"
                                className="flex-1"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                className="flex-1"
                                disabled={createLoading}
                            >
                                {createLoading ? 'Saving...' : 'Save User'}
                            </Button>
                        </div>
                    </form>
                </Modal>

            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;