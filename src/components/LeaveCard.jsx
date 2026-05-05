/**
 * LeaveCard
 * Reusable card showing leave request details.
 * Used in both Employee Dashboard and Manager Dashboard.
 *
 * @param {Object}   leave        - leave request object
 * @param {Function} onApprove    - optional, called with (id, comment) — manager only
 * @param {Function} onReject     - optional, called with (id, comment) — manager only
 * @param {Function} onCancel     - optional, called with (id) — employee only
 * @param {boolean}  showEmployee - show employee name (manager view)
 */
import { useState } from 'react';

const statusStyles = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Cancelled: 'bg-gray-100 text-gray-500',
};

const typeStyles = {
    Sick: 'bg-red-100 text-red-700',
    Casual: 'bg-yellow-100 text-yellow-700',
    WFH: 'bg-blue-100 text-blue-700',
    'Comp-off': 'bg-green-100 text-green-700',
};

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

const LeaveCard = ({ leave, onApprove, onReject, onCancel, showEmployee = false }) => {
    const [comment, setComment] = useState('');
    const [acting, setActing] = useState(false);

    const handleApprove = async () => {
        setActing(true);
        await onApprove(leave._id, comment);
        setActing(false);
    };

    const handleReject = async () => {
        setActing(true);
        await onReject(leave._id, comment);
        setActing(false);
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
        setActing(true);
        await onCancel(leave._id);
        setActing(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeStyles[leave.leaveType] || 'bg-gray-100 text-gray-700'}`}>
                        {leave.leaveType}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[leave.status]}`}>
                        {leave.status}
                    </span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {leave.workingDays} working day{leave.workingDays !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Employee name (manager view) */}
            {showEmployee && leave.userId && (
                <p className="text-sm font-semibold text-gray-800 mb-1">
                    👤 {leave.userId.name}
                </p>
            )}

            {/* Dates */}
            <p className="text-sm text-gray-600 mb-1">
                📅 {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
            </p>

            {/* Reason */}
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                💬 {leave.reason}
            </p>

            {/* Manager comment (if actioned) */}
            {leave.managerComment && (
                <p className="text-xs text-gray-400 italic mb-3">
                    Manager note: {leave.managerComment}
                </p>
            )}

            {/* Action buttons — only shown when onApprove/onReject are provided (manager view) */}
            {onApprove && onReject && leave.status === 'Pending' && (
                <div className="border-t border-gray-100 pt-3 mt-1 space-y-2">
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Optional comment..."
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleApprove}
                            disabled={acting}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                        >
                            {acting ? '...' : '✓ Approve'}
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={acting}
                            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                        >
                            {acting ? '...' : '✗ Reject'}
                        </button>
                    </div>
                </div>
            )}

            {/* Cancel button — employee view, only for Pending or Approved */}
            {onCancel && (leave.status === 'Pending' || leave.status === 'Approved') && (
                <div className="border-t border-gray-100 pt-3 mt-1">
                    <button
                        onClick={handleCancel}
                        disabled={acting}
                        className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                        {acting ? 'Cancelling...' : '✕ Cancel Leave'}
                    </button>
                    {leave.status === 'Approved' && (
                        <p className="text-xs text-gray-400 text-center mt-1">
                            Balance will be restored on cancellation
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaveCard;
