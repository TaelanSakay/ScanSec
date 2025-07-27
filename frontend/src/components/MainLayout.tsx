import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { User } from '../api';

interface MainLayoutProps {
  onLogout: () => void;
  user: User | null;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout, user }) => {
  console.log("MainLayout rendered", { user, onLogout: typeof onLogout });
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 