import { useState, useRef, useEffect } from 'react';

export default function PdfAnalyser() {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    // Cloud State Management
    const [savedAnalyses, setSavedAnalyses] = useState([]);
    const [activeAnalysis, setActiveAnalysis] = useState(null);

    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = userObj.name || 'Student';

    const [flippedCards, setFlippedCards] = useState({});
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [isQuizActive, setIsQuizActive] = useState(false);

    // 1. Fetch from the Cloud Database when the component loads
    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/pdf/library/${userName}`);
                if (response.ok) {
                    const data = await response.json();
                    setSavedAnalyses(data);
                }
            } catch (err) {
                console.error("Could not connect to database");
            }
        };
        fetchLibrary();
    }, [userName]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
            } else {
                alert("Please upload a PDF file.");
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // A. Send the PDF to Gemini to extract the data
            const response = await fetch('http://localhost:8000/api/pdf/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                const newAnalysis = {
                    ...data,
                    createdAt: new Date().toLocaleDateString()
                };

                // B. Immediately save the generated flashcards to the MongoDB Cloud!
                const saveRes = await fetch('http://localhost:8000/api/pdf/library', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: userName,
                        pdf_data: newAnalysis
                    })
                });

                if (saveRes.ok) {
                    const savedData = await saveRes.json();
                    setSavedAnalyses(prev => [savedData, ...prev]);
                    openAnalysis(savedData);
                    setFile(null);
                }
            } else {
                alert(`Error: ${data.detail}`);
            }
        } catch (err) {
            alert("Failed to connect to the server. Is Python running?");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const openAnalysis = (analysis) => {
        setActiveAnalysis(analysis);
        setFlippedCards({});
        setQuizAnswers({});
        setShowResults(false);
        setIsQuizActive(false);
    };

    const deleteAnalysis = async (e, id) => {
        e.stopPropagation();

        // 1. Delete from MongoDB Cloud
        try {
            await fetch(`http://localhost:8000/api/pdf/library/${id}`, {
                method: 'DELETE'
            });
            // 2. Remove from the React screen
            setSavedAnalyses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("Failed to delete from cloud");
        }
    };

    const toggleCard = (index) => {
        setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="flex flex-col min-h-full animate-fade-in">

            {/* VIEW 1: THE DOCUMENT LIBRARY */}
            {!activeAnalysis ? (
                <div className="flex flex-col h-full">
                    {/* UPLOAD ZONE */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-800">Document Library</h2>
                        <p className="text-slate-500 mt-2 mb-8 text-lg">Upload your syllabus or notes to generate custom flashcards and quizzes.</p>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !file && fileInputRef.current?.click()}
                            className={`w-full max-w-3xl border-2 rounded-2xl p-8 transition-all relative overflow-hidden ${isDragging ? 'border-indigo-500 bg-indigo-50/50 border-dashed'
                                    : file ? 'border-emerald-500 bg-emerald-50/30 border-dashed'
                                        : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 border-dashed cursor-pointer'
                                }`}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf" className="hidden" />

                            {file ? (
                                <div className="flex flex-col items-center text-center w-full max-w-md mx-auto animate-scale-up">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-sm">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    </div>
                                    <p className="text-slate-800 font-bold truncate w-full px-4 text-lg">{file.name}</p>
                                    <p className="text-slate-500 text-sm mt-1 mb-6 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                                    <div className="flex gap-4 w-full">
                                        <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                                            Remove
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} disabled={isAnalyzing} className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-indigo-400 flex justify-center items-center cursor-pointer">
                                            {isAnalyzing ? <svg className="animate-spin h-5 w-5 text-white" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Extract Data'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center pointer-events-none py-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-4 text-indigo-500">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    </div>
                                    <p className="text-slate-700 font-bold text-lg">Click to upload or drag and drop</p>
                                    <p className="text-slate-500 text-sm mt-1">PDF documents only (max 10MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SAVED DOCUMENTS GRID */}
                    <div className="flex-1 mt-4">
                        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            Your Analyzed Documents
                        </h3>

                        {savedAnalyses.length === 0 ? (
                            <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-slate-200 border-dashed">
                                <p className="font-medium text-lg">Your library is empty. Upload a PDF above to get started!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {savedAnalyses.map(analysis => (
                                    <div key={analysis.id} onClick={() => openAnalysis(analysis)} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col h-56 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">{analysis.total_pages} Pages</span>
                                            <button onClick={(e) => deleteAnalysis(e, analysis.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Delete Document">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-800 mb-1 truncate group-hover:text-emerald-700 transition-colors" title={analysis.filename}>{analysis.filename}</h4>
                                        <p className="text-slate-500 text-sm line-clamp-2 flex-1 font-medium">{analysis.ai_analysis?.document_title || "Processed Document"}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Analyzed {analysis.createdAt}</span>
                                            <span className="flex items-center gap-1 text-emerald-600 group-hover:translate-x-1 transition-transform">Review <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (

                /* VIEW 2: ACTIVE DOCUMENT (Flashcards & Quiz) */
                <div className="flex flex-col animate-fade-in w-full pb-12">

                    {!isQuizActive ? (
                        <>
                            {/* FAR LEFT BACK BUTTON */}
                            <div className="w-full mb-6">
                                <button
                                    onClick={() => setActiveAnalysis(null)}
                                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 font-bold transition-all cursor-pointer bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 w-max hover:-translate-x-1"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Back to Library
                                </button>
                            </div>

                            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
                                {/* DOCUMENT HEADER */}
                                <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-extrabold text-xl text-slate-800 truncate" title={activeAnalysis.filename}>
                                            {activeAnalysis.filename}
                                        </h3>
                                        <p className="text-emerald-600 text-sm font-semibold">{activeAnalysis.total_pages} Pages Extracted</p>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-left flex flex-col gap-8">
                                    {activeAnalysis.ai_analysis ? (
                                        <>
                                            <div className="border-b border-slate-100 pb-4 text-center">
                                                <h4 className="font-extrabold text-2xl text-slate-800">{activeAnalysis.ai_analysis.document_title}</h4>
                                                <p className="text-sm font-medium text-slate-500 mt-2">AI-Generated Study Materials</p>
                                            </div>

                                            {/* FLASHCARDS */}
                                            <div>
                                                <h5 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                                                    Flashcards
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {activeAnalysis.ai_analysis.flashcards && activeAnalysis.ai_analysis.flashcards.map((card, index) => (
                                                        <div key={index} onClick={() => toggleCard(index)} className="h-36 w-full cursor-pointer relative perspective-1000 group">
                                                            {!flippedCards[index] ? (
                                                                <div className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-center text-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                                                    <p className="text-sm font-bold text-indigo-900">{card.front}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="absolute inset-0 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-center text-center shadow-md overflow-y-auto animate-fade-in">
                                                                    <p className="text-sm font-semibold text-emerald-900">{card.back}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-4 text-center italic font-medium">Click a card to reveal the answer</p>
                                            </div>

                                            {/* TAKE QUIZ BUTTON */}
                                            {activeAnalysis.ai_analysis.quiz && activeAnalysis.ai_analysis.quiz.length > 0 && (
                                                <div className="mt-8 flex justify-center border-t border-slate-100 pt-8">
                                                    <button
                                                        onClick={() => setIsQuizActive(true)}
                                                        className="group py-4 px-8 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all text-lg flex items-center gap-3 cursor-pointer hover:-translate-y-1"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                                        Take Knowledge Check
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-slate-500 italic text-center py-10">Processing data...</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (

                        /* QUIZ ISOLATION VIEW */
                        <>
                            {/* FAR LEFT BACK BUTTON */}
                            <div className="w-full mb-6">
                                <button
                                    onClick={() => setIsQuizActive(false)}
                                    className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-bold transition-all cursor-pointer bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 w-max hover:-translate-x-1"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Back to Flashcards
                                </button>
                            </div>

                            <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <div className="text-center mb-8 border-b border-slate-100 pb-6">
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-800">Knowledge Check</h3>
                                    <p className="text-slate-500 mt-2">Test your knowledge on <strong>{activeAnalysis.ai_analysis.document_title}</strong>.</p>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {activeAnalysis.ai_analysis.quiz?.map((q, qIndex) => (
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
                                                        btnClass += isSelected
                                                            ? "bg-indigo-100 border-indigo-400 text-indigo-900 font-bold shadow-sm"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer";
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
                                        <button
                                            onClick={() => setShowResults(true)}
                                            disabled={Object.keys(quizAnswers).length !== activeAnalysis.ai_analysis.quiz?.length}
                                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-lg cursor-pointer"
                                        >
                                            {Object.keys(quizAnswers).length !== activeAnalysis.ai_analysis.quiz?.length
                                                ? "Answer all questions to grade"
                                                : "Grade My Quiz"}
                                        </button>
                                    ) : (
                                        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center animate-fade-in shadow-sm">
                                            <h3 className="text-3xl font-extrabold text-emerald-800">
                                                You scored {Object.keys(quizAnswers).filter(k => quizAnswers[k] === activeAnalysis.ai_analysis.quiz[k].correct_answer).length} out of {activeAnalysis.ai_analysis.quiz?.length}!
                                            </h3>
                                            <p className="text-emerald-700 font-medium mt-2 text-lg">Review your answers above.</p>
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