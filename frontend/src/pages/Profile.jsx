import React from 'react';

const Profile = ({ onNavigate }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(user);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                No user data found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-start">
            <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-2xl border border-slate-200">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="mb-6 bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-xl font-semibold transition-all"
                >
    ← Back to Dashboard
</button>
                <h1 className="text-4xl font-bold text-indigo-600 mb-8 text-center">
                    User Profile
                </h1>

                <div className="space-y-5 text-lg">
                    <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-slate-700">Full Name</span>
                        <span>{user.name}</span>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-slate-700">Email</span>
                        <span>{user.email}</span>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-slate-700">Institution / Workplace</span>
                        <span>{user.institution}</span>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-slate-700">Date of Birth</span>
                        <span>{user.dob}</span>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-slate-700">Age</span>
                        <span>{user.age}</span>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-slate-700">Current Streak</span>
                        <span>{user.streak} 🔥</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;