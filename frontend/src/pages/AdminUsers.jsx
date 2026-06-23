import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import { getAllUsers, updateUserStatus, deleteUser, adminCreateUser } from '../services/authService';
import { Eye, UserPlus, Trash2, AlertCircle, Search, ShieldAlert, Users } from 'lucide-react';
import NgoProfileView from '../components/ui/NgoProfileView';
import DonorProfileView from '../components/ui/DonorProfileView';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Create User Modal state
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

    // Profile view modal state
    const [profileModal, setProfileModal] = useState({ open: false, userId: null, userRole: null });

    const openProfileModal = (userId, userRole) => setProfileModal({ open: true, userId, userRole });
    const closeProfileModal = () => setProfileModal({ open: false, userId: null, userRole: null });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

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

    // Filters
    const filteredUsers = users.filter((u) => {
        const matchesSearch = 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.org_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = 
            roleFilter === 'all' || 
            u.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const roleCounts = {
        all: users.length,
        donor: users.filter(u => u.role === 'donor').length,
        ngo: users.filter(u => u.role === 'ngo').length,
        admin: users.filter(u => u.role === 'admin').length,
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto font-sans">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-aidwise-text">Users Management</h1>
                        <p className="mt-1 text-gray-500 text-sm">Create user profiles, view donor/NGO portfolios, and moderate active sessions.</p>
                    </div>
                    <Button
                        variant="primary"
                        className="flex items-center gap-2 shadow-sm hover:shadow-apple-sm transition-all"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <UserPlus size={18} />
                        <span>Create New User</span>
                    </Button>
                </div>

                {/* Filters & Search Row */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                    {/* Role Tabs */}
                    <div className="flex border border-gray-250 bg-white rounded-xl p-1 overflow-x-auto shrink-0 shadow-apple-sm">
                        {Object.keys(roleCounts).map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize whitespace-nowrap ${
                                    roleFilter === role
                                        ? 'bg-aidwise-blue text-white shadow-sm'
                                        : 'text-gray-500 hover:text-aidwise-text hover:bg-gray-50'
                                }`}
                            >
                                {role}s ({roleCounts[role]})
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 md:max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name, email, organization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aidwise-blue text-sm text-aidwise-text shadow-apple-sm transition-all"
                        />
                    </div>
                </div>

                {/* Table Card */}
                <Card className="overflow-hidden p-0 border border-aidwise-border shadow-apple">
                    <div className="p-5 border-b border-aidwise-border flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-md font-bold text-aidwise-text">Registered Accounts ({filteredUsers.length})</h3>
                        {error && <span className="text-sm text-red-500 font-semibold">{error}</span>}
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
                            <tbody className="divide-y divide-aidwise-border bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-semibold">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-aidwise-blue mr-2 align-middle"></div>
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 flex flex-col items-center">
                                            <AlertCircle className="mb-2 opacity-50 text-gray-400" size={32} />
                                            <p className="font-bold text-sm">No users match criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-aidwise-text">{user.name}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${
                                                    user.role === 'admin' 
                                                        ? 'bg-purple-150 text-purple-800 border border-purple-200' 
                                                        : user.role === 'ngo' 
                                                            ? 'bg-blue-105 text-blue-800 border border-blue-200' 
                                                            : 'bg-green-105 text-green-800 border border-green-200'
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
                                                <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                                    user.status === 'suspended' 
                                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                                        : 'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                    {user.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end items-center gap-2">
                                                    {user.role !== 'admin' ? (
                                                        <>
                                                            <button
                                                                onClick={() => openProfileModal(user.id, user.role)}
                                                                className="p-1.5 text-aidwise-blue hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                                title="View Profile"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleUserStatus(user.id, user.status)}
                                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                                                                    user.status === 'suspended'
                                                                        ? 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
                                                                        : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200'
                                                                }`}
                                                            >
                                                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic font-semibold">Protected</span>
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

                {/* MODAL: ADMIN CREATES NEW USER */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Create User Account"
                >
                    <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                        {createError && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-semibold animate-in fade-in duration-200">
                                ⚠️ {createError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setCreateRole('donor')}
                                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                                    createRole === 'donor' 
                                        ? 'border-aidwise-blue bg-blue-50 text-aidwise-blue font-bold' 
                                        : 'border-gray-200 text-gray-450 hover:bg-gray-50'
                                }`}
                            >
                                Donor
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreateRole('ngo')}
                                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                                    createRole === 'ngo' 
                                        ? 'border-aidwise-blue bg-blue-50 text-aidwise-blue font-bold' 
                                        : 'border-gray-200 text-gray-450 hover:bg-gray-50'
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
                            <div className="space-y-4 border-t border-aidwise-border pt-4 mt-2 animate-in slide-in-from-top-2 duration-300">
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

                {/* Profile View Modals */}
                <NgoProfileView
                    isOpen={profileModal.open && profileModal.userRole === 'ngo'}
                    onClose={closeProfileModal}
                    ngoId={profileModal.userId}
                />
                <DonorProfileView
                    isOpen={profileModal.open && profileModal.userRole === 'donor'}
                    onClose={closeProfileModal}
                    donorId={profileModal.userId}
                />

            </div>
        </DashboardLayout>
    );
};

export default AdminUsers;
