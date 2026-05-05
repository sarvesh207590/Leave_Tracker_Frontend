import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCalendar } from '../services/leaveService';

/**
 * TeamCalendar
 * Shows approved leave requests for the current week + next week.
 * Supports filtering by leave type.
 * Entries are grouped by date for a calendar-style view.
 */

const LEAVE_TYPES = ['Sick', 'Casual', 'WFH', 'Comp-off'];

const typeColors = {
    Sick: 'bg-red-100 text-red-700 border-red-200',
    Casual: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    WFH: 'bg-blue-100 text-blue-700 border-blue-200',
    'Comp-off': 'bg-green-100 text-green-700 border-green-200',
};

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short',
    });

/**
 * Build an array of dates for the current week (Mon) through next week (Sun).
 */
const getTwoWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 14; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
    }
    return dates;
};

/**
 * Check if a leave entry covers a given date.
 */
const coversDate = (entry, date) => {
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
};

const TeamCalendar = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('');

    const twoWeekDates = getTwoWeekDates();

    const fetchCalendar = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getCalendar(leaveTypeFilter);
            setEntries(data.entries);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load calendar');
        } finally {
            setLoading(false);
        }
    }, [leaveTypeFilter]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    // Group entries by date
    const entriesByDate = twoWeekDates.reduce((acc, date) => {
        const key = date.toISOString().split('T')[0];
        acc[key] = entries.filter((e) => coversDate(e, date));
        return acc;
    }, {});

    const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
    const isToday = (date) => {
        const t = new Date();
        return date.toDateString() === t.toDateString();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Team Calendar</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Current week + next week — approved leaves</p>
                    </div>

                    {/* Leave type filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500 whitespace-nowrap">Filter by type:</label>
                        <select
                            value={leaveTypeFilter}
                            onChange={(e) => setLeaveTypeFilter(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">All types</option>
                            {LEAVE_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {loading ? (
                    <LoadingSpinner message="Loading calendar..." />
                ) : (
                    <>
                        {/* Week labels */}
                        <div className="grid grid-cols-1 gap-6">
                            {[0, 1].map((weekIndex) => {
                                const weekDates = twoWeekDates.slice(weekIndex * 7, weekIndex * 7 + 7);
                                const weekLabel = weekIndex === 0 ? 'This Week' : 'Next Week';

                                return (
                                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                                            <h2 className="text-sm font-semibold text-gray-600">{weekLabel}</h2>
                                        </div>

                                        {/* Desktop: 7-column grid */}
                                        <div className="hidden sm:grid grid-cols-7 divide-x divide-gray-100">
                                            {weekDates.map((date) => {
                                                const key = date.toISOString().split('T')[0];
                                                const dayEntries = entriesByDate[key] || [];
                                                const weekend = isWeekend(date);
                                                const today = isToday(date);

                                                return (
                                                    <div
                                                        key={key}
                                                        className={`min-h-[120px] p-2 ${weekend ? 'bg-gray-50' : 'bg-white'}`}
                                                    >
                                                        <div className={`text-xs font-semibold mb-2 ${today ? 'text-blue-600' : weekend ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            <div>{date.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                                                            <div className={`text-base ${today ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}`}>
                                                                {date.getDate()}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {dayEntries.map((entry) => (
                                                                <div
                                                                    key={entry._id}
                                                                    className={`text-xs px-1.5 py-1 rounded border truncate ${typeColors[entry.leaveType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                                    title={`${entry.userId?.name} — ${entry.leaveType}`}
                                                                >
                                                                    {entry.userId?.name?.split(' ')[0]}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Mobile: stacked list */}
                                        <div className="sm:hidden divide-y divide-gray-100">
                                            {weekDates.map((date) => {
                                                const key = date.toISOString().split('T')[0];
                                                const dayEntries = entriesByDate[key] || [];
                                                const weekend = isWeekend(date);
                                                const today = isToday(date);
                                                if (weekend && dayEntries.length === 0) return null;
                                                return (
                                                    <div key={key} className={`px-4 py-3 flex items-start gap-3 ${weekend ? 'bg-gray-50' : ''}`}>
                                                        <div className={`text-xs font-semibold w-12 shrink-0 ${today ? 'text-blue-600' : weekend ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            <div>{date.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                                                            <div className={`text-base font-bold ${today ? 'text-blue-600' : ''}`}>{date.getDate()}</div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 flex-1">
                                                            {dayEntries.length === 0 ? (
                                                                <span className="text-xs text-gray-300">No leaves</span>
                                                            ) : dayEntries.map((entry) => (
                                                                <span
                                                                    key={entry._id}
                                                                    className={`text-xs px-2 py-0.5 rounded border ${typeColors[entry.leaveType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                                >
                                                                    {entry.userId?.name?.split(' ')[0]} · {entry.leaveType}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            {LEAVE_TYPES.map((t) => (
                                <div key={t} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${typeColors[t]}`}>
                                    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                                    {t}
                                </div>
                            ))}
                        </div>

                        {/* Empty state */}
                        {entries.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-3xl mb-2">📅</p>
                                <p className="text-sm">No approved leaves in the next two weeks</p>
                            </div>
                        )}
                    </>
                )}

            </main>
        </div>
    );
};

export default TeamCalendar;
