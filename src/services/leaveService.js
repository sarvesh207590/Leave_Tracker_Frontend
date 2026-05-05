import api from './api';

/**
 * Leave service — wraps all /api/leave endpoints.
 */

export const applyLeave = async (payload) => {
    const { data } = await api.post('/leave/apply', payload);
    return data; // { leaveRequest }
};

/**
 * @param {Object} filters - { status?, startDate?, endDate? }
 */
export const getMyLeaves = async (filters = {}) => {
    const { data } = await api.get('/leave/my', { params: filters });
    return data; // { leaves }
};

export const getBalance = async () => {
    const { data } = await api.get('/leave/balance');
    return data; // { leaveBalance }
};

/**
 * @param {string} leaveType - optional filter
 */
export const getCalendar = async (leaveType = '') => {
    const params = leaveType ? { leaveType } : {};
    const { data } = await api.get('/leave/calendar', { params });
    return data; // { entries }
};

/**
 * Fetch all managers for the Apply Leave form dropdown.
 */
export const getManagers = async () => {
    const { data } = await api.get('/auth/managers');
    return data; // { managers }
};

/**
 * Cancel a leave request by ID.
 */
export const cancelLeave = async (id) => {
    const { data } = await api.patch(`/leave/${id}/cancel`);
    return data;
};
