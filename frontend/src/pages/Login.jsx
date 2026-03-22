import { useState } from 'react';

export default function Login({ onNavigate, onClose }) {
    // NEW: Toggle between Login and Signup modes
    const [isLoginMode, setIsLoginMode] = useState(true);

    const [name, setName] = useState(''); // Only used for signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsLoading(true);

        // Dynamically choose the endpoint and the payload based on the mode
        const endpoint = isLoginMode ? '/api/login' : '/api/signup';
        const payload = isLoginMode ? { email, password } : { name, email, password };

        try {
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (isLoginMode) {
                    // Login Success!
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userName', data.user);
                    // NEW: Save the real streak from the database!
                    localStorage.setItem('userStreak', data.streak);
                    onNavigate('dashboard');
                } else {
                    // Signup Success! Swap them back to login mode
                    setIsLoginMode(true);
                    setPassword(''); // Clear the password for security
                    setMessage({ text: 'Account created! You can now log in.', type: 'success' });
                }
            } else {
                setMessage({ text: data.detail || 'Authentication failed. Please try again.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Cannot connect to server. Is your Python backend running?', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // THE OVERLAY
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">

            {/* THE POPUP BOX */}
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 md:p-10 relative overflow-hidden transition-all duration-300">

                {/* THE CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                {/* HEADER */}
                <div className="text-center mb-8 mt-2">
                    <h1 className="text-3xl font-extrabold text-indigo-600 mb-2 tracking-tight">SynapseAI</h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {isLoginMode ? 'Welcome back! Please enter your details.' : 'Create an account to save your progress.'}
                    </p>
                </div>

                {/* MESSAGES (Errors or Success) */}
                {message.text && (
                    <div className={`mb-6 p-3 border rounded-xl text-sm text-center font-medium animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* NAME INPUT (Only shows if signing up) */}
                    {!isLoginMode && (
                        <div className="flex flex-col gap-1.5 animate-fade-in">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-900 text-sm"
                                placeholder="Alex Johnson"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-900 text-sm"
                            placeholder="you@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 relative">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-12 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-900 text-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* PRIMARY BUTTON */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 w-full bg-indigo-600 text-white py-3.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:bg-indigo-400 disabled:transform-none cursor-pointer flex justify-center items-center"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            isLoginMode ? 'Sign In' : 'Create Account'
                        )}
                    </button>

                    {/* TOGGLE MODE BUTTON */}
                    <div className="text-center mt-2">
                        <p className="text-sm text-slate-500">
                            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                    setMessage({ text: '', type: '' });
                                }}
                                className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all cursor-pointer"
                            >
                                {isLoginMode ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}