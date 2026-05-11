import { useState, useRef, useEffect } from 'react';

// 1. ACCEPT THE userName PROP HERE
export default function Chatbot({ setActiveTab, onNavigate, userName }) {
    const [isOpen, setIsOpen] = useState(false);

    // 2. LOAD MEMORY ON STARTUP
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('synapse_chat');
        if (saved) return JSON.parse(saved);
        return [{ role: 'assistant', content: 'Hi! I am your Synapse AI assistant. How can I help you today?' }];
    });

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 3. AUTO-SAVE MEMORY & SCROLL
    useEffect(() => {
        sessionStorage.setItem('synapse_chat', JSON.stringify(messages));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');

        // Package the chat history
        const historyToSend = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 4. SEND MESSAGE, HISTORY, AND USERNAME!
                body: JSON.stringify({
                    message: userMessage,
                    history: historyToSend,
                    username: userName || "Student"
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error("Backend error");

            if (data.action === "navigate") {
                const target = data.target;
                const replyMessage = `Taking you to the ${target} now!`;

                // 5. MEMORY BUG FIX: Save the bot's reply BEFORE changing the page
                const updatedHistory = [...historyToSend, { role: 'user', content: userMessage }, { role: 'assistant', content: replyMessage }];
                sessionStorage.setItem('synapse_chat', JSON.stringify(updatedHistory));
                setMessages(updatedHistory);

                if (target === 'profile') {
                    onNavigate('profile');
                } else if (['overview', 'planner', 'analyser'].includes(target)) {
                    setActiveTab(target);
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! The AI is currently experiencing high traffic or is offline. Please try again in a moment.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer animate-fade-in"
                >
                    💬
                </button>
            )}

            {/* Dark/Blurred Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-Out Side Panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="bg-indigo-600 text-white p-5 font-bold flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2 text-lg">
                        <span>✨</span>
                        <span>Synapse Assistant</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:text-indigo-200 cursor-pointer p-1 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-5 overflow-y-auto bg-slate-50 flex flex-col gap-4 text-base">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white self-end rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-sm'}`}>
                            {msg.content}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="bg-white border border-slate-200 text-slate-500 self-start p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                            <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base bg-slate-50"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-colors disabled:bg-indigo-300 cursor-pointer flex items-center justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
}