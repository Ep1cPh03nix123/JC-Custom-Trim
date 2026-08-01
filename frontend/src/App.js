import React, { useState } from 'react';
import AppNav from './components/AppNav';
import Home from './pages/Home';
import SavedTimesheets from './pages/SavedTimesheets';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', textAlign: 'left' }}>
      <AppNav page={page} onNavigate={setPage} />
      <div style={{ flex: 1, minHeight: 0 }}>
        {page === 'home' ? <Home /> : <SavedTimesheets />}
      </div>
    </div>
  );
}

export default App;