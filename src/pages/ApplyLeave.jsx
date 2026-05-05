import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { applyLeave, getManagers } from '../services/leaveService';

/**
 * ApplyLeave page
 * Form: leaveType, startDate, endDate, reason, managerId.
 * Fetches manager list from API for the dropdown.
 */
const LEAVE_TYPES = ['Sick', 'Casual', 'WFH', 'Comp-off'];

const ApplyLeave = () => {
    const navigate = useNavigate();

    const [managers, setManagers] = useState([]);
    const [mgrsLoading, setMgrsLoading] = useState(true);

    const [form, setForm] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        managerId: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch managers for dropdown on mount
    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const data = await getManagers();
                setManagers(data.managers);
            } catch {
                setError('Could not load managers. Please refresh.');
            } finally {
                setMgrsLoading(false);
            }
        };
        fetchManagers();
    }, []);

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for min attr

    const isWeekend = (dateStr) => {
        if (!dateStr) return false;
        const day = new Date(dateStr).getDay();
        return day === 0 || day === 6; // 0=Sun, 6=Sat
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.leaveType || !form.startDate || !form.endDate || !form.reason.trim() || !form.managerId) {
            setError('All fields are required');
            return;
        }

        if (new Date(form.startDate) > new Date(form.endDate)) {
            setError('Start date cannot be after end date');
            return;
        }

        if (isWeekend(form.startDate)) {
            setError('Start date cannot be a weekend');
            return;
        }

        if (isWeekend(form.endDate)) {
            setError('End date cannot be a weekend');
            return;
        }

        setSubmitting(true);
        try {
            await applyLeave(form);
            setSuccess('Leave request submitted successfully!');
            // Reset form
            setForm({ leaveType: '', startDate: '', endDate: '', reason: '', managerId: '' });
            // Redirect to dashboard after short delay
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            // Show server validation errors or message
            const data = err.response?.data;
            if (data?.errors) {
                setError(data.errors.map((e) => e.message).join(', '));
            } else {
                setError(data?.message || 'Failed to submit leave request');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-blue-600 hover:underline mb-2 inline-block"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Apply for Leave</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Fill in the details below to submit your request</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

                    {/* Success message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
                            ✓ {success}
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    {mgrsLoading ? (
                        <LoadingSpinner message="Loading form..." />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Leave Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Leave Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="leaveType"
                                    value={form.leaveType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">Select leave type</option>
                                    {LEAVE_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        min={today}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={form.endDate}
                                        onChange={handleChange}
                                        min={form.startDate}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Briefly describe the reason for your leave..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                />
                            </div>

                            {/* Manager */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reporting Manager <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="managerId"
                                    value={form.managerId}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">Select manager</option>
                                    {managers.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.name} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                            >
                                {submitting ? 'Submitting...' : 'Submit Leave Request'}
                            </button>

                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ApplyLeave;
