import { useState, useRef } from 'react';

export default function PdfAnalyser() {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null); // <-- NEW: To store Python's response
    const fileInputRef = useRef(null);
    const [flippedCards, setFlippedCards] = useState({}); // <-- ADD THIS LINE

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const toggleCard = (index) => {
        setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setResult(null); // Clear old results
            } else {
                alert("Please upload a PDF file.");
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null); // Clear old results
        }
    };

    // --- THE REAL CLOUD CONNECTION ---
    const handleAnalyze = async () => {
        setIsAnalyzing(true);

        // 1. Package the file for the internet
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 2. Send it to your FastAPI Python backend
            const response = await fetch('http://localhost:8000/api/pdf/upload', {
                method: 'POST',
                body: formData, // Notice we don't use JSON.stringify here!
            });

            const data = await response.json();

            // 3. Save the extracted text to our React state
            if (response.ok) {
                setResult(data);
            } else {
                alert(`Error: ${data.detail}`);
            }
        } catch (err) {
            alert("Failed to connect to the server. Is Python running?");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalyser = () => {
        setFile(null);
        setResult(null);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in h-full">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Syllabus Analyser</h2>
                <p className="text-slate-500 text-sm mt-1">Upload your course syllabus PDF to automatically extract dates and assignments.</p>
            </div>

            <div
                onDragOver={!result ? handleDragOver : undefined}
                onDragLeave={!result ? handleDragLeave : undefined}
                onDrop={!result ? handleDrop : undefined}
                onClick={() => (!file && !result) && fileInputRef.current.click()}
                className={`flex-grow flex flex-col items-center justify-center border-2 rounded-2xl p-8 transition-all relative overflow-hidden ${result
                        ? 'border-indigo-200 bg-indigo-50/30' // Success State
                        : isDragging
                            ? 'border-indigo-500 bg-indigo-50/50 border-dashed' // Dragging State
                            : file
                                ? 'border-emerald-500 bg-emerald-50/30 border-dashed' // File Loaded State
                                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 border-dashed cursor-pointer' // Empty State
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="application/pdf"
                    className="hidden"
                />

                {/* STATE 1: SUCCESSFUL ANALYSIS */}
                {result ? (
                    <div className="flex flex-col w-full h-full animate-fade-in text-left">
                        {/* HEADER */}
                        <div className="flex items-center gap-3 mb-4 border-b border-indigo-100 pb-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 truncate w-full">{result.filename}</h3>
                                <p className="text-indigo-600 text-xs font-semibold">{result.total_pages} Pages Extracted</p>
                            </div>
                        </div>

                        {/* STUDY BUDDY UI */}
                        <div className="flex-grow bg-white border border-indigo-100 rounded-xl p-5 overflow-y-auto mb-4 shadow-inner text-left flex flex-col gap-4">
                            {result.ai_analysis ? (
                                <>
                                    <div className="border-b border-slate-100 pb-3">
                                        <h4 className="font-extrabold text-xl text-slate-800">{result.ai_analysis.document_title}</h4>
                                        <p className="text-sm text-slate-500 mt-1">AI-Generated Study Materials</p>
                                    </div>

                                    {/* FLASHCARDS SECTION */}
                                    <div>
                                        <h5 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                                            Flashcards
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {result.ai_analysis.flashcards && result.ai_analysis.flashcards.map((card, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => toggleCard(index)}
                                                    className="h-32 w-full cursor-pointer relative"
                                                >
                                                    {!flippedCards[index] ? (
                                                        /* Front of Card */
                                                        <div className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-all">
                                                            <p className="text-sm font-semibold text-indigo-900">{card.front}</p>
                                                        </div>
                                                    ) : (
                                                        /* Back of Card */
                                                        <div className="absolute inset-0 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-center text-center shadow-md overflow-y-auto animate-fade-in">
                                                            <p className="text-sm font-medium text-emerald-900">{card.back}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-3 text-center italic">Click a card to reveal the answer</p>
                                    </div>

                                    {/* QUICK QUIZ PREVIEW */}
                                    <div className="mt-2 pt-4 border-t border-slate-100">
                                        <h5 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">Mini Quiz ({result.ai_analysis.quiz?.length} Questions)</h5>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <p className="text-sm font-medium text-slate-800 mb-2">1. {result.ai_analysis.quiz?.[0]?.question}</p>
                                            <ul className="text-sm text-slate-600 space-y-1 pl-2 mb-3">
                                                {result.ai_analysis.quiz?.[0]?.options?.map((opt, i) => (
                                                    <li key={i}>• {opt}</li>
                                                ))}
                                            </ul>
                                            <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-500">
                                                Hover for Answer: <span className="text-white hover:text-emerald-600 transition-colors bg-slate-200 hover:bg-transparent rounded px-1">{result.ai_analysis.quiz?.[0]?.correct_answer}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-slate-500 italic">Processing data...</p>
                            )}
                        </div>

                        <button
                            onClick={resetAnalyser}
                            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            Analyze Another Document
                        </button>
                    </div>
                ) :

                    /* STATE 2: FILE LOADED & READY */
                    file ? (
                        <div className="flex flex-col items-center text-center w-full max-w-sm animate-scale-up">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <p className="text-slate-800 font-semibold truncate w-full px-4">{file.name}</p>
                            <p className="text-slate-500 text-sm mt-1 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                                >
                                    Remove
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                                    disabled={isAnalyzing}
                                    className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-indigo-400 flex justify-center items-center cursor-pointer"
                                >
                                    {isAnalyzing ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : 'Extract Data'}
                                </button>
                            </div>
                        </div>
                    ) :

                        /* STATE 3: EMPTY WAITING FOR DROP */
                        (
                            <div className="flex flex-col items-center text-center pointer-events-none">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-indigo-500">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                </div>
                                <p className="text-slate-700 font-semibold text-lg">Click to upload or drag and drop</p>
                                <p className="text-slate-500 text-sm mt-1">PDF documents only (max 10MB)</p>
                            </div>
                        )}
            </div>
        </div>
    );
}