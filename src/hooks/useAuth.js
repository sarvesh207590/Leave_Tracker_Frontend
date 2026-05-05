import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * useAuth hook
 * Manages authentication state: user, token, login, logout.
 * Persists token + user to localStorage so state survives page refresh.
 */
const useAuth = () => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    /**
     * login — calls the auth API, stores token + user in state and localStorage.
     * @returns {Object} user object with role
     */
    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    /**
     * logout — clears state and localStorage.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    return { user, token, login, logout, isAuthenticated: !!token };
};

export default useAuth;
