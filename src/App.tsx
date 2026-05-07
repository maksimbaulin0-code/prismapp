import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './lib/auth';
import { BottomNav } from './components/BottomNav';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Welcome from './pages/Welcome';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
          };
        };
        ready: () => void;
      };
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      if (tgUser?.id) {
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        signIn(tgUser.id, fullName || 'Пользователь');
      }
    }
  }, [signIn]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Welcome />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'bookings':
        return <Bookings />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen pb-20"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
