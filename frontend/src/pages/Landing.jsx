import { useState } from 'react';
import Login from './Login'; // Import our new modal component


export default function Landing({ onNavigate }) {
    // Add this line right at the start of your component
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col overflow-hidden px-[5%] font-sans text-slate-900 bg-[#fafafa] bg-[radial-gradient(circle_at_0%_0%,rgba(224,231,255,0.5)_0%,transparent_40%),radial-gradient(circle_at_100%_0%,rgba(253,232,243,0.5)_0%,transparent_40%)]">

            {/* HEADER */}
            <nav className="flex justify-between items-center py-6">
                <div className="text-[1.4rem] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent px-6 py-2.5">
                    SynapseAI
                </div>
                <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm cursor-pointer"
                >
                    Log in
                </button>
            </nav>

            {/* HERO */}
            <header className="text-center py-[4vh] max-w-[700px] mx-auto">
                <h1 className="text-[3.5rem] font-bold text-black mb-5 tracking-tight leading-[1.2]">
                    Learn smarter, not harder
                </h1>
                <p className="text-[1.1rem] text-gray-500 leading-relaxed">
                    SynapseAI uses cutting-edge artificial intelligence to create personalized
                    learning paths that adapt to your unique style. Experience education that
                    evolves with you.
                </p>
            </header>

            {/* FEATURES */}
            <section className="flex justify-center gap-[30px] pb-[2vh]">

                {/* Card 1 */}
                <div className="bg-white border border-gray-100 rounded-2xl p-[40px_30px] flex-1 max-w-[320px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 bg-blue-50 text-blue-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                    </div>
                    <h3 className="text-[1.15rem] font-semibold text-gray-900 mb-3">Adaptive Learning</h3>
                    <p className="text-[0.9rem] text-gray-500 leading-relaxed">AI that adjusts to your pace and learning preferences in real-time</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-gray-100 rounded-2xl p-[40px_30px] flex-1 max-w-[320px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 bg-purple-50 text-purple-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h3 className="text-[1.15rem] font-semibold text-gray-900 mb-3">Track Progress</h3>
                    <p className="text-[0.9rem] text-gray-500 leading-relaxed">Visualize your growth with detailed analytics and insights</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white border border-gray-100 rounded-2xl p-[40px_30px] flex-1 max-w-[320px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 bg-pink-50 text-pink-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                    </div>
                    <h3 className="text-[1.15rem] font-semibold text-gray-900 mb-3">Vast Library</h3>
                    <p className="text-[0.9rem] text-gray-500 leading-relaxed">Access thousands of courses across every subject imaginable</p>
                </div>

            </section>

            {/* RENDER THE MODAL IF THE STATE IS TRUE */}
            {isLoginModalOpen && (
                <Login
                    onNavigate={onNavigate}
                    onClose={() => setIsLoginModalOpen(false)}
                />
            )}
        </div>
    );
}