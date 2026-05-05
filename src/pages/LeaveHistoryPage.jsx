import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import LeaveCard from '../components/LeaveCard';
import { getHistory } from '../services/managerService';

/**
 * LeaveHistoryPage
 * Manager view — all actioned (Approved / Rejected / Cancelled) leave requests.
 * Supports filtering by status and leave type.
 */
const LeaveHistoryPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ status: '', leaveType: '' });

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
            const data = await getHistory(active);
            setRequests(data.requests);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleFilter = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
    const clearFilters = () => setFilters({ status: '', leaveType: '' });
    const hasFilters = Object.values(filters).some((v) => v !== '');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Leave History</h1>
                    <p className="text-gray-500 text-sm mt-0.5">All actioned leave requests</p>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-end">
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilter}
                            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">All</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Leave Type</label>
                        <select
                            name="leaveType"
                            value={filters.leaveType}
                            onChange={handleFilter}
                            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">All types</option>
                            {['Sick', 'Casual', 'WFH', 'Comp-off'].map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto">
                        {hasFilters && (
                            <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                                Clear filters
                            </button>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">{requests.length} record{requests.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
                )}

                {loading ? (
                    <LoadingSpinner message="Loading history..." />
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-3xl mb-2">📋</p>
                        <p className="text-sm">No actioned requests found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requests.map((req) => (
                            <LeaveCard key={req._id} leave={req} showEmployee />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeaveHistoryPage;
