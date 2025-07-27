import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, FileText, Settings, Search, Clock, HelpCircle } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'Vulnerabilities', icon: Shield, path: '/dashboard/vulnerabilities' },
  { name: 'Reports', icon: FileText, path: '/dashboard/reports' },
  { name: 'History', icon: Clock, path: '/dashboard/history' },
  { name: 'Help Guide', icon: HelpCircle, path: '/dashboard/help' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  console.log("Sidebar rendered, current location:", location.pathname);
  
  return (
    <nav className="flex flex-col h-full w-64 bg-card border-r border-gray-200">
      <div className="flex flex-col gap-2 mt-8 p-4">
        {navItems.map(({ name, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={name}
              to={path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-textSecondary hover:bg-primary/10 hover:text-primary ${isActive ? 'bg-primary text-white' : ''}`}
              aria-label={name}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium">{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar; 