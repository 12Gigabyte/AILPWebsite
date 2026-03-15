import { useState } from 'react';
import Landing from './components/Landing';
import Login from './components/Login'; // Your existing login card!

function App() {
  // We start on the 'landing' page by default
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div>
      {/* If current page is 'landing', show the Landing component */}
      {currentPage === 'landing' && (
        <Landing onNavigate={setCurrentPage} />
      )}

      {/* If current page is 'login', show the Login component */}
      {currentPage === 'login' && (
        <Login onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

export default App;