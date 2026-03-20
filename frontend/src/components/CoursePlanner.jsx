import { useState, useEffect } from 'react';

export default function CoursePlanner() {
    // 1. STATE: Start with an empty list. We will fill this from Python!
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', day: 'Monday', time: '', color: 'bg-blue-500' });

    // 2. THE FETCH EFFECT: Runs exactly once when the component first loads
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/courses/');
                const data = await response.json();
                setCourses(data); // Inject the Python data into our React state
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCourses();
    }, []); // The empty array [] means "Only run this once on load"

    // 3. DELETE HANDLER: Tells Python to delete it, then removes it from the screen
    const handleDelete = async (idToRemove) => {
        try {
            const response = await fetch(`http://localhost:8000/api/courses/${idToRemove}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // If Python successfully deleted it, remove it from our local screen
                setCourses(courses.filter(course => course.id !== idToRemove));
            }
        } catch (error) {
            console.error("Failed to delete course:", error);
        }
    };

    // 4. ADD HANDLER: Sends the form data to Python, then adds the saved result to the screen
    const handleAddCourse = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/api/courses/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCourse)
            });

            if (response.ok) {
                const savedCourse = await response.json();
                // Python sends back the course WITH its brand new ID. Add that to the screen.
                setCourses([...courses, savedCourse]);

                // Reset the form
                setIsModalOpen(false);
                setNewCourse({ name: '', day: 'Monday', time: '', color: 'bg-blue-500' });
            }
        } catch (error) {
            console.error("Failed to save course:", error);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Weekly Schedule</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage your classes and AI study sessions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                    + Add Course
                </button>
            </div>

            {/* SCHEDULE LIST */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col gap-3">

                    {courses.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-lg">
                            No courses scheduled. Click "+ Add Course" to get started!
                        </div>
                    ) : (
                        courses.map(course => (
                            <div key={course.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-1.5 h-10 rounded-full ${course.color}`}></div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-md">{course.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                            <span className="font-medium text-slate-600">{course.day}</span>
                                            <span>•</span>
                                            <span>{course.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(course.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 cursor-pointer"
                                    title="Remove course"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* THE MODAL OVERLAY */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 transform transition-all">

                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-slate-800">Add New Course</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1 rounded-md transition-colors cursor-pointer">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddCourse} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">Course Name</label>
                                <input
                                    type="text"
                                    required
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 bg-white"
                                    placeholder="e.g. Calculus I"
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Day</label>
                                    <select
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-900"
                                        value={newCourse.day}
                                        onChange={(e) => setNewCourse({ ...newCourse, day: e.target.value })}
                                    >
                                        <option>Monday</option>
                                        <option>Tuesday</option>
                                        <option>Wednesday</option>
                                        <option>Thursday</option>
                                        <option>Friday</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Time</label>
                                    <input
                                        type="text"
                                        required
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 bg-white"
                                        placeholder="10:00 AM"
                                        value={newCourse.time}
                                        onChange={(e) => setNewCourse({ ...newCourse, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    Save Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}