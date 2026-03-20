import { useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  // STATE: Check localStorage before deciding which page to load first
  const [currentPage, setCurrentPage] = useState(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    return isAuth === 'true' ? 'dashboard' : 'landing';
  });

  // RENDER LOGIC
  return (
    <div>
      {currentPage === 'landing' && <Landing onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
    </div>
  );
}