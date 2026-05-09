import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { LogOut, Edit2, Heart, Bell, MessageCircle, Info, X, ChevronRight } from 'lucide-react';

export default function Profile() {
  const { user, signOut, updateUserName } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditName(user?.name || '');
    }
  }, [user?.name, isEditing]);

  const handleSave = async () => {
    const next = editName.trim();
    if (!next) {
      setEditName(user?.name || '');
      setIsEditing(false);
      return;
    }
    try {
      await updateUserName(next);
      setIsEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сохранить имя. Проверьте сеть и что запущен API.');
      setEditName(user?.name || '');
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleSave();
    if (e.key === 'Escape') {
      setEditName(user?.name || '');
      setIsEditing(false);
    }
  };

  const menuItems = [
    { id: 'favorites', label: 'Избранное', icon: Heart, description: 'Ваши избранные мастера' },
    { id: 'notifications', label: 'Уведомления', icon: Bell, description: 'Настройки уведомлений' },
    { id: 'support', label: 'Поддержка', icon: MessageCircle, description: 'Связаться с нами' },
    { id: 'about', label: 'О приложении', icon: Info, description: 'Версия 0.0.1' },
  ];

  const handleMenuClick = (id: string) => {
    setActiveModal(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 glass border-b border-border px-4 py-4 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
      </header>

      <div className="p-4">
        <div className="glass p-6 rounded-soft mb-6">
          <div className="flex items-center gap-4">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold">
                {user?.name?.[0] || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
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
              onClick={() => (isEditing ? void handleSave() : setIsEditing(true))}
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
                onClick={() => handleMenuClick(item.id)}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-soft hover:bg-white/5 transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
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

      {/* Modal for menu items */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-card w-full max-w-sm rounded-2xl p-5 border border-border max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {menuItems.find((i) => i.id === activeModal)?.label}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {activeModal === 'favorites'
                  ? 'Здесь будут ваши избранные мастера.'
                  : activeModal === 'notifications'
                  ? 'Настройки уведомлений будут доступны в следующем обновлении.'
                  : activeModal === 'support'
                  ? 'Напишите нам в Telegram: @beautyfind_support'
                  : 'Prism v0.0.1\nПриложение для поиска бьюти-мастеров.'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
