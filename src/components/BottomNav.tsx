import { motion } from 'framer-motion';
import { Search, Calendar, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'search', label: 'Поиск', Icon: Search },
  { id: 'bookings', label: 'Брони', Icon: Calendar },
  { id: 'profile', label: 'Профиль', Icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="flex justify-around items-center py-2 px-4 pb-[env(safe-area-inset-bottom,8px)]">
        {TABS.map((tab) => {
          const { Icon } = tab;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 p-2 min-w-[64px]"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-1 w-8 h-1 bg-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
