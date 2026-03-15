import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    // This runs exactly once when the dashboard loads
    useEffect(() => {
        fetch("http://localhost:8000/api/dashboard")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch data");
                return response.json();
            })
            .then((data) => setDashboardData(data))
            .catch((err) => setError(err.message));
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>{dashboardData ? dashboardData.title : "Loading Dashboard..."}</h1>

            {error && (
                <div style={{ color: "red", padding: "10px", border: "1px solid red" }}>
                    <strong>Error:</strong> {error} (Did you start the Python server?)
                </div>
            )}

            {dashboardData && (
                <div style={{ background: "#f4f4f4", padding: "15px", borderRadius: "8px" }}>
                    <p><strong>System Status:</strong> {dashboardData.status}</p>
                    <p><strong>Squad Members Online:</strong> {dashboardData.active_users}</p>
                </div>
            )}
        </div>
    );
}