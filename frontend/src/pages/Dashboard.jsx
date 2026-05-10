import { useState, useEffect } from 'react';
import CoursePlanner from '../components/CoursePlanner';
import PdfAnalyser from '../components/PdfAnalyser';
import Profile from './Profile';

export default function Dashboard({ onNavigate }) {
    // We immediately grab the username from memory when the component loads
    const user = JSON.parse(localStorage.getItem('user'));
    const [userName, setUserName] = useState(user?.name || 'Student');
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [dashboardStats, setDashboardStats] = useState({ courses: 0, flashcards: 0, streak: 1 });

    // NEW: Fetch stats securely from the Cloud using the user's ID!
    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (activeTab === 'overview' && userName) {
                try {
                    // 1. Ask the cloud for this specific user's courses
                    const coursesRes = await fetch(`http://localhost:8000/api/course/library/${userName}`);
                    const savedCourses = coursesRes.ok ? await coursesRes.json() : [];

                    // 2. Ask the cloud for this specific user's PDFs
                    const pdfsRes = await fetch(`http://localhost:8000/api/pdf/library/${userName}`);
                    const savedPdfs = pdfsRes.ok ? await pdfsRes.json() : [];

                    // 3. Count up all the flashcards inside those PDFs
                    let totalCards = 0;
                    savedPdfs.forEach(pdf => {
                        if (pdf.ai_analysis && pdf.ai_analysis.flashcards) {
                            totalCards += pdf.ai_analysis.flashcards.length;
                        }
                    });

                    // Grab their real streak from memory (default to 1 if missing)
                    const realStreak = parseInt(localStorage.getItem('userStreak')) || 1;

                    // 4. Update the screen
                    setDashboardStats({
                        courses: savedCourses.length,
                        flashcards: totalCards,
                        streak: realStreak // THE FAKE '3' IS GONE!
                    });
                } catch (err) {
                    console.error("Failed to fetch stats from cloud", err);
                }
            }
        };

        fetchDashboardStats();
    }, [activeTab, userName]); // This re-runs anytime the tab or user changes

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('userStreak'); 
        onNavigate('landing');
    };

    const OverviewContent = () => (
        <div className="flex flex-col gap-8 animate-fade-in w-full">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
                <h2 className="text-3xl font-bold mb-2">Welcome back, {userName.split(' ')[0] || 'Student'}!</h2>
                <p className="text-indigo-100">You have no upcoming deadlines today. Great time to review some flashcards!</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-800">{dashboardStats.courses}</p>
                        <p className="text-sm text-slate-500 font-medium">Active Courses</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-800">{dashboardStats.flashcards}</p>
                        <p className="text-sm text-slate-500 font-medium">Flashcards Generated</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-800">{dashboardStats.streak}</p>
                        <p className="text-sm text-slate-500 font-medium">Day Streak</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-5">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setActiveTab('planner')}
                        className="flex items-center gap-5 bg-white border border-slate-200 p-8 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-left group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-slate-50 group-hover:bg-indigo-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Explore a Topic</h4>
                            <p className="text-slate-500">Let AI build a custom learning path.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('analyser')}
                        className="flex items-center gap-5 bg-white border border-slate-200 p-8 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all text-left group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-slate-50 group-hover:bg-emerald-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Analyze Document</h4>
                            <p className="text-slate-500">Generate flashcards from your notes.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
             {/* GLOBAL FIXED HEADER */}
            <header className="h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                    >
                        {isSidebarOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        )}
                    </button>
                    <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">SynapseAI</h1>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">{userName}</span>
                    <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {userName ? userName.charAt(0).toUpperCase() : 'S'}
                    </div>
                </div>
            </header>

            {/* BODY CONTAINER */}
            <div className="flex flex-1 pt-16 h-screen w-full">

                {/* LEFT SIDEBAR */}
                <aside className={`bg-white border-r border-slate-200 flex flex-col fixed top-16 h-[calc(100vh-4rem)] z-20 transition-transform duration-300 ease-in-out w-72 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <nav className="flex-1 py-6 px-6 flex flex-col gap-3 overflow-y-auto">
                        <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Overview</button>
                        <button onClick={() => setActiveTab('planner')} className={`w-full text-left px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer ${activeTab === 'planner' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Course Explorer</button>
                        <button onClick={() => setActiveTab('analyser')} className={`w-full text-left px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer ${activeTab === 'analyser' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>PDF Analyser</button>
                        <button onClick={() => onNavigate('profile')} className="w-full text-left px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer text-slate-600 hover:bg-slate-50">Profile</button>
                    </nav>

                    <div className="p-6 border-t border-slate-100">
                        <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors cursor-pointer">Log out</button>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
                    <div className="flex-1 overflow-y-auto p-8 w-full">
                        <div className="max-w-7xl mx-auto h-full w-full">

                            <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
                                <OverviewContent />
                            </div>

                            <div className={activeTab === 'planner' ? 'block animate-fade-in bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-[calc(100vh-8rem)]' : 'hidden'}>
                                <CoursePlanner />
                            </div>

                            <div className={activeTab === 'analyser' ? 'block animate-fade-in bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-[calc(100vh-8rem)]' : 'hidden'}>
                                <PdfAnalyser />
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}