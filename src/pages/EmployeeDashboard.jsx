import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import LeaveBalanceWidget from '../components/LeaveBalanceWidget';
import LeaveCard from '../components/LeaveCard';
import { getBalance, getMyLeaves, cancelLeave } from '../services/leaveService';

/**
 * EmployeeDashboard
 * Shows leave balance, leave history with status + date range filters.
 */
const EmployeeDashboard = () => {
    const [balance, setBalance] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter state
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Build filter params — only include non-empty values
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== '')
            );
            const [balanceData, leavesData] = await Promise.all([
                getBalance(),
                getMyLeaves(activeFilters),
            ]);
            setBalance(balanceData.leaveBalance);
            setLeaves(leavesData.leaves);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({ status: '', startDate: '', endDate: '' });
    };

    const handleCancel = async (id) => {
        try {
            await cancelLeave(id);
            // Refresh both balance and list (balance may be restored)
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel leave request');
        }
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Track your leave balance and history</p>
                    </div>
                    <Link
                        to="/apply"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors text-center"
                    >
                        + Apply Leave
                    </Link>
                </div>

                {/* Leave Balance */}
                <section>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">Leave Balance</h2>
                    {loading && !balance ? (
                        <LoadingSpinner message="Loading balance..." />
                    ) : (
                        <LeaveBalanceWidget balance={balance} />
                    )}
                </section>

                {/* Filters */}
                <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-700">Leave History</h2>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                        {/* Status filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                <option value="">All statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Start date filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        {/* End date filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    {/* Leave list */}
                    {loading ? (
                        <LoadingSpinner message="Loading history..." />
                    ) : leaves.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p className="text-3xl mb-2">📭</p>
                            <p className="text-sm">No leave requests found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {leaves.map((leave) => (
                                <LeaveCard
                                    key={leave._id}
                                    leave={leave}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
};

export default EmployeeDashboard;
