import React from 'react';

export default function Dashboard({ onNavigate }) {

    // HANDLER: Clears the session and sends the user back to the front door
    const handleLogout = () => {
        // Later, you'll clear secure tokens here. For now, just redirect.
        onNavigate('landing');
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* SIDEBAR: The fixed navigation menu on the left */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        SynapseAI
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {/* Active Navigation Link */}
                    <a href="#" className="block px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                        Overview
                    </a>
                    {/* Inactive Navigation Links (Placeholders for your squad) */}
                    <a href="#" className="block px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        Course Planner
                    </a>
                    <a href="#" className="block px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        PDF Analyser
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT: The area where the actual AI tools will render */}
            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800">Welcome back, Student</h1>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full text-white flex items-center justify-center font-bold">
                        S
                    </div>
                </header>

                {/* Placeholder cards to show the team where their components will go */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex items-center justify-center text-slate-400 border-dashed border-2">
                        Squad A: Mount Course Planner Here
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex items-center justify-center text-slate-400 border-dashed border-2">
                        Squad B: Mount PDF Analyser Here
                    </div>
                </div>
            </main>

        </div>
    );
}