// App.jsx
import { useState, useEffect } from 'react';
import './App.scss';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Notifications from './components/Notifications';
import HomePage from './pages/HomePage';
import LoanApplication from './pages/LoanApplication';
import ScholarshipsPage from './pages/ScholarshipsPage';
import GovernancePage from './pages/GovernancePage';
import DashboardPage from './pages/DashboardPage';
import { RegistrationPage } from './pages/RegistrationPage';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Notification system
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage setCurrentView={setCurrentView} />;
      case 'loans':
        return <LoanApplication addNotification={addNotification} setIsLoading={setIsLoading} isLoading={isLoading} />;
      case 'scholarships':
        return <ScholarshipsPage />;
      case 'governance':
        return <GovernancePage />;
      case 'dashboard':
        return <DashboardPage setCurrentView={setCurrentView} addNotification={addNotification} />;
      case 'register':
        return <RegistrationPage setCurrentView={setCurrentView} addNotification={addNotification} />;
      default:
        return <HomePage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="studifi-app">
      <Navigation setCurrentView={setCurrentView} currentView={currentView} />

      <Notifications notifications={notifications} />

      <main className="main-content">
        {renderCurrentView()}
      </main>

      <Footer />
    </div>
  );
}

export default App;