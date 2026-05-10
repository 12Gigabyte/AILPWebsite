import React from 'react';

const Profile = ({ onNavigate }) => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error("Failed to parse user data");
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold bg-slate-50">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                    <p className="mb-4 text-slate-600">No user data found. Please log in again.</p>
                    <button onClick={() => onNavigate('landing')} className="text-indigo-600 font-bold hover:underline">Go to Login</button>
                </div>
            </div>
        );
    }

    // 🛡️ The shield: prevents React from crashing if an object is passed
    const renderSafe = (val) => {
        if (typeof val === 'string' || typeof val === 'number') return val;
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        return "Not specified";
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start animate-fade-in">
            <div className="bg-white shadow-xl rounded-[24px] p-10 w-full max-w-2xl border border-slate-200 mt-10">

                <button
                    onClick={() => onNavigate('dashboard')}
                    className="mb-8 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 w-fit cursor-pointer"
                >
                    <span>←</span> Back to Dashboard
                </button>

                <h1 className="text-4xl font-extrabold text-slate-900 mb-10 text-center tracking-tight">
                    User Profile
                </h1>

                <div className="space-y-6 text-lg">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">Full Name</span>
                        <span className="font-semibold text-slate-800">{renderSafe(user.name)}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">Email</span>
                        <span className="font-semibold text-slate-800">{renderSafe(user.email)}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">Institution / Workplace</span>
                        <span className="font-semibold text-slate-800">{renderSafe(user.institution)}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">Date of Birth</span>
                        <span className="font-semibold text-slate-800">{renderSafe(user.dob)}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">Age</span>
                        <span className="font-semibold text-slate-800">{renderSafe(user.age)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2">
                        <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">Current Streak</span>
                        <span className="font-bold text-orange-600 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-xl">
                            {renderSafe(user.streak)} 🔥
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;