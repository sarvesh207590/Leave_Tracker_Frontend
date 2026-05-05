import { useNavigate } from 'react-router-dom';

/**
 * LoginLanding
 * Entry point — user picks their role before reaching the login form.
 * Routes to /login/employee or /login/manager.
 */
const LoginLanding = () => {
    const navigate = useNavigate();

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
            <div className="relative z-10 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8 text-center">

                {/* Header */}
                <div className="text-5xl mb-3">🗓</div>
                <h1 className="text-2xl font-bold text-gray-800">Leave Tracker</h1>
                <p className="text-gray-500 text-sm mt-1 mb-8">Who are you signing in as?</p>

                {/* Role cards */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/login/employee')}
                        className="group flex flex-col items-center gap-3 p-6 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        <span className="text-4xl">👤</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">Employee</p>
                            <p className="text-xs text-gray-400 mt-0.5">Apply & track leave</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/login/manager')}
                        className="group flex flex-col items-center gap-3 p-6 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl transition-all"
                    >
                        <span className="text-4xl">👔</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700">Manager</p>
                            <p className="text-xs text-gray-400 mt-0.5">Review & approve leave</p>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LoginLanding;
