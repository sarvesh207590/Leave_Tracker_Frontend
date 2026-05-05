import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getEmployees, adjustBalance, resetAllBalances } from '../services/managerService';

/**
 * EmployeesPage
 * Manager view — lists all employees with leave balances.
 * Supports per-employee balance adjustment and year-end reset-all.
 */
const LEAVE_TYPES = ['Sick', 'Casual', 'WFH', 'Comp-off'];
const MAX_BALANCE = { Sick: 10, Casual: 10, WFH: 15, 'Comp-off': 5 };

const balanceColor = (val, max) => {
    const pct = val / max;
    if (pct > 0.5) return 'bg-green-500';
    if (pct > 0.2) return 'bg-yellow-400';
    return 'bg-red-400';
};

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [search, setSearch] = useState('');

    // Adjust modal state
    const [adjustModal, setAdjustModal] = useState(null); // { emp, leaveType, value }
    const [adjusting, setAdjusting] = useState(false);
    const [resetting, setResetting] = useState(false);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchEmployees = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data.employees);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const filtered = employees.filter(
        (e) =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdjust = async () => {
        if (!adjustModal) return;
        setAdjusting(true);
        try {
            await adjustBalance(adjustModal.emp._id, adjustModal.leaveType, Number(adjustModal.value));
            showToast(`Updated ${adjustModal.leaveType} balance for ${adjustModal.emp.name}`);
            setAdjustModal(null);
            await fetchEmployees(); // refresh
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to adjust balance');
        } finally {
            setAdjusting(false);
        }
    };

    const handleResetAll = async () => {
        if (!window.confirm('Reset ALL employee leave balances to defaults? This cannot be undone.')) return;
        setResetting(true);
        try {
            const data = await resetAllBalances();
            showToast(data.message);
            await fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset balances');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
                    {toast}
                </div>
            )}

            {/* Adjust Balance Modal */}
            {adjustModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">Adjust Leave Balance</h3>
                        <p className="text-sm text-gray-500 mb-4">{adjustModal.emp.name}</p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Leave Type</label>
                                <select
                                    value={adjustModal.leaveType}
                                    onChange={(e) => setAdjustModal((p) => ({ ...p, leaveType: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    New Balance (current: {adjustModal.emp.leaveBalance?.[adjustModal.leaveType] ?? 0})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={adjustModal.value}
                                    onChange={(e) => setAdjustModal((p) => ({ ...p, value: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => setAdjustModal(null)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdjust}
                                disabled={adjusting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
                            >
                                {adjusting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">All Employees</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {employees.length} employee{employees.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            onClick={handleResetAll}
                            disabled={resetting}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                            {resetting ? 'Resetting...' : '🔄 Year-End Reset'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {loading ? (
                    <LoadingSpinner message="Loading employees..." />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-3xl mb-2">🔍</p>
                        <p className="text-sm">No employees found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((emp) => (
                            <div
                                key={emp._id}
                                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Employee info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {emp.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{emp.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                                    </div>
                                    {/* Adjust button */}
                                    <button
                                        onClick={() => setAdjustModal({ emp, leaveType: 'Sick', value: emp.leaveBalance?.Sick ?? 0 })}
                                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                                    >
                                        Adjust
                                    </button>
                                </div>

                                {/* Leave balance bars */}
                                <div className="space-y-2">
                                    {LEAVE_TYPES.map((type) => {
                                        const val = emp.leaveBalance?.[type] ?? 0;
                                        const max = MAX_BALANCE[type];
                                        const pct = Math.max(0, Math.min(100, (val / max) * 100));
                                        return (
                                            <div key={type}>
                                                <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                                                    <span>{type}</span>
                                                    <span className="font-medium text-gray-700">{val}/{max}</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${balanceColor(val, max)}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default EmployeesPage;
