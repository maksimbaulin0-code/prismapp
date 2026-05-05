import { useState } from 'react';
import { motion } from 'framer-motion';

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

export default function Profile() {
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
        {/* Profile Card */}
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

        {/* Quick Stats */}
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

        {/* Menu */}
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

        {/* Logout */}
        <button className="w-full mt-8 p-4 text-red-400 hover:bg-red-500/10 rounded-soft transition-colors">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}