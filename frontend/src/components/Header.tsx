import React from 'react';
import { Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-textPrimary text-lg">Vulnerability Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute left-2 top-1.5 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search vulnerabilities..."
            className="pl-8 pr-3 py-1.5 rounded border border-gray-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
          />
        </div>
        <button className="px-3 py-1.5 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">Filter</button>
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
      </div>
    </header>
  );
};

export default Header; 