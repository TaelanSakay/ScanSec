import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, FileText, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Vulnerabilities', icon: Shield, path: '/vulnerabilities' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="flex flex-col h-full w-full">
      <div className="flex flex-col gap-2 mt-8">
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