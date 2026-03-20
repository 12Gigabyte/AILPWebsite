import { useState } from 'react';

export default function Login({ onNavigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // NEW: Save a persistent keycard in the browser
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userName', data.user);

                onNavigate('dashboard');
            } else {
                setError(data.detail);
            }
        } catch (err) {
            setError("Could not connect to the server. Is Python running?");
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans gap-5 p-4">

            {/* BACK BUTTON */}
            <button
                className="self-start md:ml-[calc(50vw-200px)] bg-transparent border-none text-slate-500 text-[0.95rem] font-semibold cursor-pointer px-4 py-2 rounded-lg transition-all hover:bg-slate-200 hover:text-slate-900"
                onClick={() => onNavigate('landing')}
            >
                ← Back to Home
            </button>

            {/* LOGIN CARD */}
            <div className="bg-white p-10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.05),0_4px_10px_rgba(0,0,0,0.03)] w-full max-w-[400px] border border-gray-100">

                <div className="text-center mb-[30px]">
                    <h2 className="text-[1.75rem] font-bold text-gray-900 mb-2">Welcome to SynapseAI</h2>
                    <p className="text-[0.95rem] text-gray-500">Sign in to continue your AI learning journey.</p>
                </div>

                {error && (
                    <div className="text-red-700 bg-red-50 p-[10px] rounded-md mb-[15px] text-center text-[0.9rem] font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[0.85rem] font-semibold text-gray-800" htmlFor="email">Email Address</label>
                        <input
                            className="px-4 py-3 border border-gray-300 rounded-lg text-[1rem] transition-all outline-none text-gray-900 bg-white focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                            type="email"
                            id="email"
                            placeholder="name@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 text-left relative">
                        <label className="text-[0.85rem] font-semibold text-gray-800" htmlFor="password">Password</label>
                        <input
                            className="px-4 py-3 border border-gray-300 rounded-lg text-[1rem] transition-all outline-none text-gray-900 bg-white focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] pr-[40px]"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-[36px] bg-transparent border-none cursor-pointer text-slate-500 p-1 flex items-center justify-center hover:text-slate-700"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <a href="#" className="text-[0.85rem] text-blue-600 no-underline font-medium hover:underline">Forgot password?</a>
                    </div>

                    <button type="submit" className="bg-gray-900 text-white p-3 border-none rounded-lg text-[1rem] font-semibold cursor-pointer transition-all hover:bg-gray-800 active:scale-98">
                        Sign In
                    </button>
                </form>

                <div className="text-center mt-[25px] text-[0.9rem] text-gray-500">
                    <p>Don't have an account? <a href="#" className="text-blue-600 no-underline font-semibold hover:underline">Create one</a></p>
                </div>
            </div>
        </div>
    );
}