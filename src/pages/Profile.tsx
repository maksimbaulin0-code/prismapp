import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { LogOut, Edit2, Heart, Calendar, Bell, MessageCircle, Info } from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  const handleSave = () => setIsEditing(false);

  const menuItems = [
    { id: 'favorites', label: 'Избранное', icon: Heart },
    { id: 'history', label: 'История брони', icon: Calendar },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'support', label: 'Поддержка', icon: MessageCircle },
    { id: 'about', label: 'О приложении', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 glass border-b border-border px-4 py-4 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
      </header>

      <div className="p-4">
        <div className="glass p-6 rounded-soft mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold">
              {user?.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSave}
                  className="w-full bg-transparent border-b border-border outline-none text-lg font-semibold"
                  autoFocus
                />
              ) : (
                <h2 className="text-xl font-semibold truncate">{user?.name || 'Гость'}</h2>
              )}
              <p className="text-sm text-gray-400">
                ID: {user?.telegram_id || 'Неизвестно'}
              </p>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-2 hover:bg-white/10 rounded-sharp shrink-0"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-soft hover:bg-white/5 transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="flex-1 font-medium">{item.label}</span>
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={signOut}
          className="w-full mt-8 p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 rounded-soft transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
