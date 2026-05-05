import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Login
 * Shared login form used for both Employee and Manager portals.
 * @param {'employee' | 'manager'} role - determines branding and redirect
 */
const ROLE_CONFIG = {
    employee: {
        label: 'Employee Portal',
        icon: '👤',
        accent: 'blue',
        demoEmail: 'employee1@company.com',
        redirect: '/dashboard',
        // Tailwind classes per role
        btnClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400',
        ringClass: 'focus:ring-blue-400',
        backPath: '/login',
    },
    manager: {
        label: 'Manager Portal',
        icon: '👔',
        accent: 'purple',
        demoEmail: 'manager1@company.com',
        redirect: '/manager',
        btnClass: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-400',
        ringClass: 'focus:ring-purple-400',
        backPath: '/login',
    },
};

const Login = ({ role = 'employee' }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const config = ROLE_CONFIG[role];

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Email and password are required');
            return;
        }
        setLoading(true);
        try {
            const user = await login(form.email.trim(), form.password);

            // Guard: ensure the user's actual role matches this portal
            if (user.role !== role) {
                setError(`This portal is for ${role}s only. Please use the ${user.role} portal.`);
                setLoading(false);
                return;
            }

            navigate(config.redirect, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const quickFill = () => {
        setForm({ email: config.demoEmail, password: 'password123' });
        setError('');
    };

    return (
        <div
            className="relative min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="relative z-10 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">

                {/* Back link */}
                <button
                    onClick={() => navigate('/login')}
                    className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
                >
                    ← Back
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">{config.icon}</div>
                    <h1 className="text-2xl font-bold text-gray-800">{config.label}</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@company.com"
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${config.ringClass} focus:border-transparent`}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${config.ringClass} focus:border-transparent`}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full ${config.btnClass} disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Demo quick-fill */}
                <div className="mt-6 border-t border-gray-100 pt-5">
                    <p className="text-xs text-gray-400 text-center mb-3">Quick sign-in (demo)</p>
                    <button
                        onClick={quickFill}
                        className="w-full text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 py-2 px-3 rounded-lg transition-colors"
                    >
                        {config.icon} Fill demo {role} credentials
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">Password: password123</p>
                </div>

            </div>
        </div>
    );
};

export default Login;
