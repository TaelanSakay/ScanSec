import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import VulnerabilityTable from './components/VulnerabilityTable';

const App: React.FC = () => {
  return (
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
          <VulnerabilityTable />
        </main>
      </div>
    </div>
  );
};

export default App;
