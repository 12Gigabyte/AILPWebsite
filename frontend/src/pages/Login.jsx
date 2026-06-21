import { useState } from 'react';

export default function Login({ onNavigate, onClose }) {
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [institution, setInstitution] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // Password Visibility State
    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!isLoginMode && !agreeTerms) {
            setMessage({ text: 'You must agree to the Terms & Conditions', type: 'error' });
            return;
        }

        setIsLoading(true);

        const endpoint = isLoginMode ? '/api/login' : '/api/signup';
        const payload = isLoginMode
            ? { email, password }
            : { name, institution, dob, email, password };

        try {
            const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (isLoginMode) {
                    // Login Success
                    localStorage.setItem('isAuthenticated', 'true');

                    // 🛡️ SMART EXTRACTION: Hunt down 'profileData' first!
                    const backendUser = data.profileData || data.user || data || {};

                    const actualName = typeof backendUser === 'string' ? backendUser : (backendUser.name || email.split('@')[0]);
                    const actualInst = backendUser.institution || data.institution || "Not specified";
                    const actualDob = backendUser.dob || data.dob || "Not specified";
                    const actualAge = backendUser.age || data.age || "N/A";
                    const actualStreak = backendUser.streak || data.streak || 1;

                    const userData = {
                        name: actualName,
                        email: email,
                        institution: actualInst,
                        dob: actualDob,
                        age: actualAge,
                        streak: actualStreak
                    };

                    // 👻 KILL THE GHOST: Destroy any old conflicting memories
                    localStorage.removeItem('userName');
                    localStorage.removeItem('profileData'); // Just in case!

                    // Save the fresh, clean object securely
                    localStorage.setItem('user', JSON.stringify(userData));
                    onNavigate('dashboard');
                } else {
                    // Signup Success
                    setMessage({ text: 'Account created successfully! Please sign in.', type: 'success' });
                    setIsLoginMode(true);
                    setName('');
                    setInstitution('');
                    setDob('');
                    setPassword('');
                    setAgreeTerms(false);
                    setShowPassword(false);
                }
            } else {
                setMessage({ text: data.detail || 'An error occurred', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Cannot connect to server. Please ensure backend is running.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[420px] p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto scrollbar-hide">

                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer bg-slate-100 p-2 rounded-full hover:bg-slate-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <div className="text-center mb-5 mt-2">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Welcome to Synapse AI</h2>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                        {isLoginMode ? 'Sign In' : 'Create Account'}
                    </h3>
                </div>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    {!isLoginMode && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-bold text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 bg-slate-50 hover:bg-white placeholder:text-slate-400 text-sm"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-bold text-slate-700">Institution / Workplace</label>
                                <input
                                    type="text"
                                    placeholder="University / Company Name"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                    className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 bg-slate-50 hover:bg-white placeholder:text-slate-400 text-sm"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-bold text-slate-700">Date of Birth</label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 bg-slate-50 hover:bg-white text-slate-500 text-sm"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-slate-700">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@yourinstitution.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 bg-slate-50 hover:bg-white placeholder:text-slate-400 text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-slate-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full border border-slate-300 p-2.5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 bg-slate-50 hover:bg-white placeholder:text-slate-400 text-sm ${!showPassword && password ? 'tracking-widest' : ''}`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {!isLoginMode && (
                        <div className="flex items-center gap-2 mt-1 mb-1">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-[13px] font-medium text-slate-600 cursor-pointer">
                                I agree to the <span className="text-indigo-600 font-bold hover:underline">Terms & Conditions</span>
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-md shadow-indigo-600/20 text-base"
                    >
                        {isLoading ? (
                            <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            isLoginMode ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center pt-5 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-500">
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setMessage({ text: '', type: '' });
                                setShowPassword(false);
                            }}
                            className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                            {isLoginMode ? 'Create one.' : 'Sign In.'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}