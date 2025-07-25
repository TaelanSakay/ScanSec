import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Vulnerabilities from './components/Vulnerabilities';
import Reports from './components/Reports';
import Settings from './components/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex bg-background font-sans">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col">
          <Sidebar />
        </aside>
        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          {/* Main Content */}
          <main className="flex-1 bg-background p-4 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vulnerabilities" element={<Vulnerabilities />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
