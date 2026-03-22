import { useState, useEffect } from 'react';

export default function CoursePlanner() {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Cloud State Management
    const [savedCourses, setSavedCourses] = useState([]);
    const [activeCourse, setActiveCourse] = useState(null);

    // We grab the logged-in user to fetch their specific data!
    const userName = localStorage.getItem('userName') || 'Student';

    const [quizAnswers, setQuizAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [isQuizActive, setIsQuizActive] = useState(false);

    // 1. Fetch from the Cloud Database when the component loads
    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/course/library/${userName}`);
                if (response.ok) {
                    const data = await response.json();
                    setSavedCourses(data);
                }
            } catch (err) {
                console.error("Could not connect to database");
            }
        };
        fetchLibrary();
    }, [userName]);

    const handleGenerateCourse = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsGenerating(true);

        try {
            // A. Ask AI to design the curriculum
            const response = await fetch('http://localhost:8000/api/course/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: topic }),
            });

            const data = await response.json();

            if (response.ok) {
                const newCourse = {
                    ...data,
                    createdAt: new Date().toLocaleDateString()
                };

                // B. Immediately save the finished curriculum to the MongoDB Cloud!
                const saveRes = await fetch('http://localhost:8000/api/course/library', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: userName,
                        course_data: newCourse
                    })
                });

                if (saveRes.ok) {
                    const savedData = await saveRes.json();
                    setSavedCourses(prev => [savedData, ...prev]);
                    openCourse(savedData);
                    setTopic('');
                }
            } else {
                alert(`Error: ${data.detail}`);
            }
        } catch (err) {
            alert("Failed to connect to the server.");
        } finally {
            setIsGenerating(false);
        }
    };

    const openCourse = (course) => {
        setActiveCourse(course);
        setQuizAnswers({});
        setShowResults(false);
        setIsQuizActive(false);
    };

    const deleteCourse = async (e, courseId) => {
        e.stopPropagation();

        // 1. Delete from MongoDB Cloud
        try {
            await fetch(`http://localhost:8000/api/course/library/${courseId}`, {
                method: 'DELETE'
            });
            // 2. Remove from the React screen
            setSavedCourses(prev => prev.filter(c => c.id !== courseId));
        } catch (err) {
            console.error("Failed to delete from cloud");
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">

            {!activeCourse ? (
                <div className="flex flex-col h-full">
                    {/* HEADER & SEARCH BAR */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-800">Course Library</h2>
                        <p className="text-slate-500 mt-2 mb-8 text-lg">Build your custom university. Enter a topic below to generate a new syllabus.</p>

                        <form onSubmit={handleGenerateCourse} className="flex gap-3 max-w-3xl">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </div>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Introduction to Astrophysics, React Native, World History..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-medium text-lg"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isGenerating || !topic.trim()}
                                className="py-4 px-8 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-indigo-400 flex items-center justify-center min-w-[160px] cursor-pointer text-lg"
                            >
                                {isGenerating ? (
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : 'Create Course'}
                            </button>
                        </form>
                    </div>

                    {/* SAVED COURSES GRID */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            Your Active Courses
                        </h3>

                        {isGenerating && (
                            <div className="w-full py-12 flex flex-col items-center justify-center text-indigo-500 bg-indigo-50/50 rounded-2xl border border-indigo-100 border-dashed mb-6 animate-pulse">
                                <svg className="w-10 h-10 mb-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                <p className="font-bold">Designing curriculum structure...</p>
                            </div>
                        )}

                        {savedCourses.length === 0 && !isGenerating ? (
                            <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-slate-200 border-dashed">
                                <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                <p className="font-medium text-lg">Your library is empty. Generate your first course above!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {savedCourses.map(course => (
                                    <div key={course.id} onClick={() => openCourse(course)} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-64 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">{course.modules?.length} Modules</span>
                                            <button onClick={(e) => deleteCourse(e, course.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Delete Course">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">{course.title}</h4>
                                        <p className="text-slate-500 text-sm line-clamp-3 flex-1">{course.description}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Created {course.createdAt}</span>
                                            <span className="flex items-center gap-1 text-indigo-500 group-hover:translate-x-1 transition-transform">Resume <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (

                <div className="flex flex-col h-full animate-fade-in w-full pb-12">
                    {!isQuizActive ? (
                        <>
                            {/* FAR LEFT BACK BUTTON */}
                            <div className="w-full mb-6">
                                <button
                                    onClick={() => setActiveCourse(null)}
                                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 font-bold transition-all cursor-pointer bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 w-max hover:-translate-x-1"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Library
                                </button>
                            </div>

                            <div className="max-w-4xl mx-auto w-full">
                                <div className="mb-12 text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                                    <h3 className="text-3xl font-extrabold text-indigo-700 mb-3">{activeCourse.title}</h3>
                                    <p className="text-slate-600 text-lg">{activeCourse.description}</p>
                                </div>

                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-indigo-100">
                                    {activeCourse.modules?.map((mod, idx) => (
                                        <div key={idx} className="relative flex items-start gap-6 group">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-indigo-500 text-white font-bold text-sm shadow shrink-0 relative z-10 mt-1">{idx + 1}</div>
                                            <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                                <h4 className="font-bold text-slate-800 text-lg mb-2">{mod.title}</h4>
                                                <p className="text-slate-600 text-sm leading-relaxed mb-4">{mod.description}</p>
                                                {mod.resources && mod.resources.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Recommended Study Material</h5>
                                                        <ul className="flex flex-col gap-2">
                                                            {mod.resources.map((res, rIdx) => (
                                                                <li key={rIdx}>
                                                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-slate-700 hover:text-indigo-600 transition-colors group/link cursor-pointer">
                                                                        <svg className="w-4 h-4 mt-0.5 text-slate-400 group-hover/link:text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{res.title}</span>
                                                                            <span className="text-xs text-slate-400">{res.type}</span>
                                                                        </div>
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {activeCourse.quiz && activeCourse.quiz.length > 0 && (
                                    <div className="mt-16 flex justify-center border-t border-slate-200 pt-10">
                                        <button onClick={() => setIsQuizActive(true)} className="group py-4 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all text-lg flex items-center gap-3 cursor-pointer hover:-translate-y-1">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                            Take Mastery Quiz
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (

                        <>
                            <div className="w-full mb-6">
                                <button onClick={() => setIsQuizActive(false)} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 font-bold transition-all cursor-pointer bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 w-max hover:-translate-x-1">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Back to Curriculum
                                </button>
                            </div>

                            <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <div className="text-center mb-8 border-b border-slate-100 pb-6">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-800">Final Mastery Quiz</h3>
                                    <p className="text-slate-500 mt-2">Test your knowledge on <strong>{activeCourse.title}</strong>.</p>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {activeCourse.quiz?.map((q, qIndex) => (
                                        <div key={qIndex} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                            <p className="font-bold text-slate-800 mb-4 text-lg">{qIndex + 1}. {q.question}</p>
                                            <div className="flex flex-col gap-3">
                                                {q.options.map((opt, oIndex) => {
                                                    const isSelected = quizAnswers[qIndex] === opt;
                                                    const isCorrect = opt === q.correct_answer;

                                                    let btnClass = "w-full text-left p-4 border rounded-xl text-sm transition-all ";
                                                    if (showResults) {
                                                        if (isCorrect) btnClass += "bg-emerald-100 border-emerald-400 text-emerald-900 font-bold shadow-sm";
                                                        else if (isSelected && !isCorrect) btnClass += "bg-red-50 border-red-300 text-red-800 line-through";
                                                        else btnClass += "bg-white border-slate-200 text-slate-400 opacity-60";
                                                    } else {
                                                        btnClass += isSelected ? "bg-indigo-100 border-indigo-400 text-indigo-900 font-bold shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer";
                                                    }

                                                    return (
                                                        <button key={oIndex} disabled={showResults} onClick={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: opt }))} className={btnClass}>
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    {!showResults ? (
                                        <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== activeCourse.quiz?.length} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-lg cursor-pointer">
                                            {Object.keys(quizAnswers).length !== activeCourse.quiz?.length ? "Answer all questions to grade" : "Grade My Quiz"}
                                        </button>
                                    ) : (
                                        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center animate-fade-in shadow-sm">
                                            <h3 className="text-3xl font-extrabold text-emerald-800">
                                                You scored {Object.keys(quizAnswers).filter(k => quizAnswers[k] === activeCourse.quiz[k].correct_answer).length} out of {activeCourse.quiz?.length}!
                                            </h3>
                                            <p className="text-emerald-700 font-medium mt-2 text-lg">Great job completing the curriculum!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}