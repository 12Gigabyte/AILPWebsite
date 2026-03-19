import { useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';


export default function App() {
  // STATE: Acts as a simple router. Starts on the 'landing' page.
  const [currentPage, setCurrentPage] = useState('landing');

  // RENDER LOGIC: Decides which component to show based on the state
  return (
    <div>
      {currentPage === 'landing' && <Landing onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
    </div>
  );
}