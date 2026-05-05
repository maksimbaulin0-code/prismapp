import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './lib/auth';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        close: () => void;
        themeParams: Record<string, string>;
      };
    };
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const { loading, signIn } = useAuth();

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      
      // Авторизация через Telegram
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      if (tgUser?.id) {
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        signIn(tgUser.id, fullName || 'Пользователь');
      }
    }
  }, [signIn]);

  const renderPage = () => {
    switch (activeTab) {
      case 'bookings':
        return <Bookings activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'profile':
        return <Profile activeTab={activeTab} onTabChange={setActiveTab} />;
      default:
        return <Home activeTab={activeTab} onTabChange={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent">Загрузка...</div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;