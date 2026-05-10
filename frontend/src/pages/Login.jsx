import { useState } from 'react';

export default function Login({ onNavigate, onClose }) {

    const [isLoginMode, setIsLoginMode] = useState(true);

    const [name, setName] = useState('');
    const [institution, setInstitution] = useState('');
    const [dob, setDob] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState('');

    const calculateAge = (dobString) => {
        const birthDate = new Date(dobString);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = isLoginMode
            ? '/api/login'
            : '/api/signup';

        const payload = isLoginMode
            ? { email, password }
            : { name, institution, dob, email, password };

        try {

            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {

                if (isLoginMode) {

                    // GET OLD SAVED PROFILE
                    const savedProfile = JSON.parse(
                        localStorage.getItem('profileData')
                    );

                    localStorage.setItem('isAuthenticated', 'true');

                    // SAVE PROFILE OBJECT
                    localStorage.setItem(
                        'user',
                        JSON.stringify(savedProfile)
                    );

                    onNavigate('dashboard');

                } else {

                    // CREATE PROFILE OBJECT
                    const profileObject = {
                        name,
                        email,
                        institution,
                        dob,
                        age: calculateAge(dob),
                        streak: 1
                    };

                    // SAVE LOCALLY
                    localStorage.setItem(
                        'profileData',
                        JSON.stringify(profileObject)
                    );

                    setMessage('Account created! Please login.');

                    setIsLoginMode(true);
                }

            } else {

                setMessage(data.detail || 'Something went wrong');

            }

        } catch (err) {

            setMessage('Cannot connect to backend');

        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-3xl p-8 w-full max-w-md">

                <button
                    onClick={onClose}
                    className="float-right"
                >
                    ✕
                </button>

                <h1 className="text-3xl font-bold text-indigo-600 mb-6">
                    SynapseAI
                </h1>

                {message && (
                    <div className="mb-4 text-red-500">
                        {message}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >

                    {!isLoginMode && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border p-3 rounded-xl"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Institution / Workplace"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
                                className="border p-3 rounded-xl"
                                required
                            />

                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="border p-3 rounded-xl"
                                required
                            />
                        </>
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-3 rounded-xl"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-3 rounded-xl"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-indigo-600 text-white py-3 rounded-xl font-semibold"
                    >
                        {isLoginMode ? 'Login' : 'Sign Up'}
                    </button>

                </form>

                <div className="mt-4 text-center">

                    <button
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="text-indigo-600 font-semibold"
                    >
                        {isLoginMode
                            ? 'Create Account'
                            : 'Already have an account? Login'
                        }
                    </button>

                </div>

            </div>

        </div>
    );
}