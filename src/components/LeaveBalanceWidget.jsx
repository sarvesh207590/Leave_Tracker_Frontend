/**
 * LeaveBalanceWidget
 * Displays leave balance for all 4 leave types as coloured cards.
 * @param {Object} balance - { Sick, Casual, WFH, 'Comp-off' }
 */

const typeConfig = {
    Sick: { color: 'bg-red-50 border-red-200', icon: '🤒', label: 'Sick' },
    Casual: { color: 'bg-yellow-50 border-yellow-200', icon: '🌴', label: 'Casual' },
    WFH: { color: 'bg-blue-50 border-blue-200', icon: '🏠', label: 'WFH' },
    'Comp-off': { color: 'bg-green-50 border-green-200', icon: '⏰', label: 'Comp-off' },
};

const LeaveBalanceWidget = ({ balance }) => {
    if (!balance) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(typeConfig).map(([type, config]) => (
                <div
                    key={type}
                    className={`${config.color} border rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm`}
                >
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-3xl font-bold text-gray-800">
                        {balance[type] ?? 0}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{config.label}</span>
                    <span className="text-xs text-gray-400">days left</span>
                </div>
            ))}
        </div>
    );
};

export default LeaveBalanceWidget;
