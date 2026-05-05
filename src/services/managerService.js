import api from './api';

/**
 * Manager service — wraps all /api/manager endpoints.
 */

export const getPending = async () => {
    const { data } = await api.get('/manager/pending');
    return data; // { requests }
};

export const approveLeave = async (id, comment = '') => {
    const { data } = await api.patch(`/manager/${id}/approve`, { comment });
    return data;
};

export const rejectLeave = async (id, comment = '') => {
    const { data } = await api.patch(`/manager/${id}/reject`, { comment });
    return data;
};

/**
 * Upload a CSV file to bulk-create employees.
 * @param {File} file - the CSV File object from the input
 */
export const bulkUploadEmployees = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/manager/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

/**
 * Create a single employee or manager.
 */
export const addEmployee = async (userData) => {
    const { data } = await api.post('/manager/add-employee', userData);
    return data;
};

/**
 * Fetch all employees with their leave balances.
 */
export const getEmployees = async () => {
    const { data } = await api.get('/manager/employees');
    return data;
};

/**
 * Fetch actioned leave history for the manager.
 */
export const getHistory = async (filters = {}) => {
    const { data } = await api.get('/manager/history', { params: filters });
    return data;
};

/**
 * Adjust a single employee's leave balance.
 */
export const adjustBalance = async (employeeId, leaveType, value) => {
    const { data } = await api.patch(`/manager/balance/${employeeId}`, { leaveType, value });
    return data;
};

/**
 * Reset all employees' leave balances to defaults (year-end).
 */
export const resetAllBalances = async () => {
    const { data } = await api.post('/manager/balance/reset-all');
    return data;
};

/**
 * Fetch current user's notifications.
 */
export const getNotifications = async () => {
    const { data } = await api.get('/auth/notifications');
    return data; // { notifications }
};

/**
 * Mark all notifications as read.
 */
export const markNotificationsRead = async () => {
    const { data } = await api.patch('/auth/notifications/read');
    return data;
};
