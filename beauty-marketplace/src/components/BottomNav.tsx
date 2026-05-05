import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Calendar, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border safe-area-bottom z-50"
    >
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              layoutId={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 p-2 min-w-[64px]"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-accent-secondary'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium tracking-tight transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-accent-secondary'
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
