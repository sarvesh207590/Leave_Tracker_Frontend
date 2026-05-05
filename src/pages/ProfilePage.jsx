import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

/**
 * ProfilePage
 * Both employees and managers can view their profile and change their password.
 * On successful name/password update, refreshes localStorage user data.
 */
const LEAVE_TYPES = ['Sick', 'Casual', 'WFH', 'Comp-off'];
const MAX_BALANCE = { Sick: 10, Casual: 10, WFH: 15, 'Comp-off': 5 };

const ProfilePage = () => {
    const navigate = useNavigate();
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    })();

    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Client-side password match check
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setSaving(true);
        try {
            const payload = { name };
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const { data } = await api.patch('/auth/profile', payload);

            // Update localStorage with new name
            const updatedUser = { ...user, name: data.user.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-500 text-sm mt-0.5">View your details and update your password</p>
                </div>

                {/* Profile card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    {/* Avatar + basic info */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Leave balance — employees only */}
                    {user.role === 'employee' && user.leaveBalance && (
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Leave Balance</p>
                            <div className="grid grid-cols-2 gap-3">
                                {LEAVE_TYPES.map((type) => {
                                    const val = user.leaveBalance[type] ?? 0;
                                    const max = MAX_BALANCE[type];
                                    const pct = Math.max(0, Math.min(100, (val / max) * 100));
                                    return (
                                        <div key={type} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-600 font-medium">{type}</span>
                                                <span className="text-gray-800 font-bold">{val}/{max}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Edit form */}
                    <form onSubmit={handleSave} className="space-y-4">
                        <p className="text-sm font-semibold text-gray-700">Update Details</p>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Email — read only */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Change Password <span className="text-xs font-normal text-gray-400">(leave blank to keep current)</span></p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        {message.text && (
                            <div className={`text-sm px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
