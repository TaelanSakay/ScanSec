import React from 'react';
import { Home, Shield, FileText, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: Home },
  { name: 'Vulnerabilities', icon: Shield },
  { name: 'Reports', icon: FileText },
  { name: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const [active, setActive] = React.useState('Dashboard');
  return (
    <nav className="flex flex-col h-full w-full">
      <div className="flex flex-col gap-2 mt-8">
        {navItems.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-textSecondary hover:bg-primary/10 hover:text-primary ${active === name ? 'bg-primary text-white' : ''}`}
            onClick={() => setActive(name)}
            aria-label={name}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden md:inline text-sm font-medium">{name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar; 