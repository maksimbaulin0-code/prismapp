import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('search');

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