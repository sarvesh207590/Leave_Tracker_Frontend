import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

/**
 * Navbar
 * Responsive navigation bar.
 * - Desktop (md+): horizontal links
 * - Mobile (<md): hamburger toggles a full-width drawer
 */
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    })();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setMenuOpen(false);
        navigate('/login');
    };

    // Active style helper
    const active = (path) =>
        location.pathname === path
            ? 'bg-blue-800 text-white'
            : 'text-blue-100 hover:bg-blue-700 hover:text-white';

    // Build nav items based on role
    const navItems = [
        ...(user?.role === 'employee'
            ? [
                { to: '/dashboard', label: 'Dashboard', icon: '📊' },
                { to: '/apply', label: 'Apply Leave', icon: '📝' },
            ]
            : []),
        ...(user?.role === 'manager'
            ? [
                { to: '/manager', label: 'Dashboard', icon: '📊' },
                { to: '/employees', label: 'Employees', icon: '👥' },
                { to: '/leave-history', label: 'History', icon: '📋' },
                { to: '/add-employee', label: 'Add Employee', icon: '➕' },
            ]
            : []),
        { to: '/calendar', label: 'Team Calendar', icon: '📅' },
        { to: '/profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <nav className="bg-blue-600 shadow-md relative z-40">
            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Brand */}
                    <span className="text-white text-lg font-bold tracking-tight shrink-0">
                        🗓 LeaveTracker
                    </span>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-1 overflow-x-auto">
                        {navItems.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${active(to)}`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: bell + user name + logout + hamburger */}
                    <div className="flex items-center gap-2 shrink-0">
                        {user?.role === 'employee' && <NotificationBell />}

                        {/* User name — visible on sm+ */}
                        {user && (
                            <div className="hidden sm:block text-right">
                                <p className="text-white text-sm font-medium leading-tight">{user.name}</p>
                                <p className="text-blue-200 text-xs capitalize">{user.role}</p>
                            </div>
                        )}

                        {/* Logout button — desktop only */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:block bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                            Logout
                        </button>

                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="md:hidden p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {menuOpen ? (
                                /* X icon */
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                /* Hamburger icon */
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile drawer ────────────────────────────────────────────── */}
            {menuOpen && (
                <div className="md:hidden bg-blue-700 border-t border-blue-500">
                    {/* User info strip */}
                    {user && (
                        <div className="px-4 py-3 border-b border-blue-600">
                            <p className="text-white text-sm font-semibold">{user.name}</p>
                            <p className="text-blue-300 text-xs capitalize">{user.role}</p>
                        </div>
                    )}

                    {/* Nav links — full width, stacked */}
                    <div className="px-2 py-2 space-y-1">
                        {navItems.map(({ to, label, icon }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active(to)}`}
                            >
                                <span>{icon}</span>
                                <span>{label}</span>
                            </Link>
                        ))}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-blue-600 transition-colors"
                        >
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
