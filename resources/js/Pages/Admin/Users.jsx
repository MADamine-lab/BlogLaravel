// resources/js/Pages/Admin/Users.jsx
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Users({ pendingUsers, activeUsers, suspendedUsers, stats }) {
    const [activeTab, setActiveTab] = useState('pending');
    const { post, delete: destroy } = useForm();
    
    const handleApprove = (userId) => {
        if (confirm('Approve this user?')) {
            post(route('admin.users.approve', userId));
        }
    };
    
    const handleSuspend = (userId) => {
        const reason = prompt('Enter suspension reason (optional):');
        post(route('admin.users.suspend', userId), {
            data: { reason }
        });
    };
    
    const handleReactivate = (userId) => {
        if (confirm('Reactivate this user account?')) {
            post(route('admin.users.reactivate', userId));
        }
    };
    
    const handleDelete = (userId, userName) => {
        if (confirm(`Delete user "${userName}"? This action cannot be undone.`)) {
            destroy(route('admin.users.destroy', userId));
        }
    };
    
    const renderUserList = (users, showActions = true) => {
        if (users.length === 0) {
            return (
                <div className="text-center py-12 text-gray-500">
                    No users in this category
                </div>
            );
        }
        
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            {showActions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {user.status}
                                    </span>
                                </td>
                                {showActions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="text-green-600 hover:text-green-900 mr-3"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {user.status === 'active' && (
                                            <button
                                                onClick={() => handleSuspend(user.id)}
                                                className="text-yellow-600 hover:text-yellow-900 mr-3"
                                            >
                                                Suspend
                                            </button>
                                        )}
                                        {user.status === 'suspended' && (
                                            <button
                                                onClick={() => handleReactivate(user.id)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Reactivate
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    
    return (
        <AdminLayout>
            <Head title="User Management" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm font-medium text-gray-500">Total Users</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm font-medium text-gray-500">Pending Approval</div>
                            <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm font-medium text-gray-500">Active Users</div>
                            <div className="text-3xl font-bold text-green-600 mt-2">{stats.active}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm font-medium text-gray-500">Suspended</div>
                            <div className="text-3xl font-bold text-red-600 mt-2">{stats.suspended}</div>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                        activeTab === 'pending'
                                            ? 'border-yellow-500 text-yellow-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Pending ({stats.pending})
                                </button>
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                        activeTab === 'active'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Active ({stats.active})
                                </button>
                                <button
                                    onClick={() => setActiveTab('suspended')}
                                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                        activeTab === 'suspended'
                                            ? 'border-red-500 text-red-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Suspended ({stats.suspended})
                                </button>
                            </nav>
                        </div>
                        
                        <div className="p-6">
                            {activeTab === 'pending' && renderUserList(pendingUsers)}
                            {activeTab === 'active' && renderUserList(activeUsers)}
                            {activeTab === 'suspended' && renderUserList(suspendedUsers)}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}