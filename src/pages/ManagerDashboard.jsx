import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import LeaveCard from '../components/LeaveCard';
import { getPending, approveLeave, rejectLeave } from '../services/managerService';

/**
 * ManagerDashboard
 * Lists all pending leave requests for the authenticated manager.
 * Each card has Approve / Reject buttons with an optional comment.
 */
const ManagerDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getPending();
            setRequests(data.requests);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleApprove = async (id, comment) => {
        try {
            await approveLeave(id, comment);
            showToast('✓ Leave request approved');
            // Remove from list optimistically
            setRequests((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleReject = async (id, comment) => {
        try {
            await rejectLeave(id, comment);
            showToast('✗ Leave request rejected');
            setRequests((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject request');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Toast notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
                    {toast}
                </div>
            )}

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Review and action pending leave requests</p>
                </div>

                {/* Stats bar */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-lg">
                        {requests.length}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Pending Requests</p>
                        <p className="text-xs text-gray-400">Awaiting your action</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Request list */}
                {loading ? (
                    <LoadingSpinner message="Loading requests..." />
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">🎉</p>
                        <p className="text-base font-medium text-gray-500">All caught up!</p>
                        <p className="text-sm mt-1">No pending leave requests</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requests.map((req) => (
                            <LeaveCard
                                key={req._id}
                                leave={req}
                                showEmployee
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
};

export default ManagerDashboard;
