import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LandingPage from './components/LandingPage';
import WorkerDashboard from './components/WorkerDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import LanguageSelector from './components/LanguageSelector';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function App() {
  const { i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsAuthenticated(true);
        i18n.changeLanguage(response.data.language || 'hi');
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron/10 to-heritage-green/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LanguageSelector />
      
      {!isAuthenticated ? (
        <LandingPage onLogin={checkAuth} />
      ) : (
        user?.role === 'worker' ? (
          <WorkerDashboard user={user} onLogout={handleLogout} />
        ) : (
          <EmployerDashboard user={user} onLogout={handleLogout} />
        )
      )}
    </div>
  );
}

export default App;
