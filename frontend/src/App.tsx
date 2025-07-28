import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Vulnerabilities from './components/Vulnerabilities';
import Reports from './components/Reports';
import Settings from './components/Settings';
import History from './components/History';
import HelpGuide from './components/HelpGuide';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import MainLayout from './components/MainLayout';
import { User } from './api';
import { authManager } from './utils/authUtils';
import { ScanProvider } from './context/ScanContext';

const LoginWrapper: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  return (
    <Login
      onLoginSuccess={onLoginSuccess}
      onSwitchToRegister={() => navigate('/signup')}
    />
  );
};

const RegisterWrapper: React.FC<{ onRegisterSuccess: () => void }> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();
  return (
    <Register
      onRegisterSuccess={onRegisterSuccess}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
};

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = await authManager.initialize();
        setAuthenticated(isAuth);
        if (isAuth) setCurrentUser(authManager.getCurrentUser());
      } catch {
        setAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLoginSuccess = async () => {
    const valid = await authManager.validateToken();
    if (valid) {
      setAuthenticated(true);
      setCurrentUser(authManager.getCurrentUser());
    } else {
      setAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const handleLogout = () => {
    authManager.clearAuth();
    setAuthenticated(false);
    setCurrentUser(null);
    // Redirect to homepage after logout
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-textSecondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            authenticated 
              ? <Navigate to="/dashboard/new-scan" replace /> 
              : <LoginWrapper onLoginSuccess={handleLoginSuccess} />
          }/>
          <Route path="/signup" element={
            authenticated 
              ? <Navigate to="/dashboard/new-scan" replace /> 
              : <RegisterWrapper onRegisterSuccess={handleLoginSuccess} />
          }/>

          {/* Protected Dashboard */}
          <Route path="/dashboard/*" element={
            authenticated ? (
              <ScanProvider>
                <MainLayout onLogout={handleLogout} user={currentUser}/>
              </ScanProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }>
            <Route index element={<Dashboard/>}/>
            <Route path="new-scan" element={<Dashboard/>}/>
            <Route path="vulnerabilities" element={<Vulnerabilities/>}/>
            <Route path="reports" element={<Reports/>}/>
            <Route path="history" element={<History/>}/>
            <Route path="help" element={<HelpGuide/>}/>
            <Route path="settings" element={<Settings/>}/>
          </Route>

          {/* Homepage route */}
          <Route path="/" element={<Home />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to={authenticated ? "/dashboard/new-scan" : "/"} replace />}/>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
