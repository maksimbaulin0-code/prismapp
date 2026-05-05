import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProfileProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface UserProfile {
  name: string;
  phone: string;
  favorites: number;
  bookings: number;
}

const MOCK_PROFILE: UserProfile = {
  name: 'Александр',
  phone: '+7 (999) 123-45-67',
  favorites: 12,
  bookings: 5,
};

export default function Profile({ activeTab, onTabChange }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);

  const handleSave = () => {
    setProfile(editData);
    setIsEditing(false);
  };

  const menuItems = [
    { id: 'favorites', label: 'Избранное', icon: '❤️', count: profile.favorites },
    { id: 'history', label: 'История брони', icon: '📅', count: profile.bookings },
    { id: 'notifications', label: 'Уведомления', icon: '🔔' },
    { id: 'support', label: 'Поддержка', icon: '💬' },
    { id: 'about', label: 'О приложении', icon: 'ℹ️' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 glass border-b border-border px-4 py-4 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
      </header>

      <div className="p-4">
        <div className="glass p-6 rounded-soft mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold">
              {profile.name[0]}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-border outline-none text-lg font-semibold"
                />
              ) : (
                <h2 className="text-xl font-semibold">{profile.name}</h2>
              )}
              <p className="text-sm text-gray-400">{profile.phone}</p>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-2 hover:bg-white/10 rounded-sharp"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass p-4 rounded-soft text-center">
            <p className="text-2xl font-bold text-accent">{profile.favorites}</p>
            <p className="text-sm text-gray-400">Избранных</p>
          </div>
          <div className="glass p-4 rounded-soft text-center">
            <p className="text-2xl font-bold text-accent">{profile.bookings}</p>
            <p className="text-sm text-gray-400">Бронирований</p>
          </div>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-soft hover:bg-white/5 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-sm text-gray-400">{item.count}</span>
              )}
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ))}
        </div>

        <button className="w-full mt-8 p-4 text-red-400 hover:bg-red-500/10 rounded-soft transition-colors">
          Выйти из аккаунта
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-area-bottom">
        <div className="flex justify-around items-center py-2 px-4">
          {[
            { id: 'search', label: 'Поиск', icon: SearchIcon },
            { id: 'bookings', label: 'Брони', icon: CalendarIcon },
            { id: 'profile', label: 'Профиль', icon: UserIcon },
          ].map((tab) => {
            const Icon = tab.icon;
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
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-accent' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}