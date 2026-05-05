import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

export default function Welcome() {
  const { signIn, loading } = useAuth();
  const [name, setName] = useState('');
  const [step, setStep] = useState<'welcome' | 'name'>('welcome');
  const [error, setError] = useState('');

  const handleStart = () => {
    setStep('name');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Введите ваше имя');
      return;
    }
    
    // For demo, use a random ID (in production, would come from Telegram)
    const fakeTelegramId = Date.now();
    await signIn(fakeTelegramId, name.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent">Загрузка...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-6"
        >
          <span className="text-4xl">💅</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2"
        >
          BeautyFind
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8"
        >
          Находи лучших мастеров красоты<br/>записывайся онлайн
        </motion.p>

        {step === 'name' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-4"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Как вас зовут?"
              className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-accent text-center"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-accent text-background rounded-soft font-semibold"
            >
              Продолжить
            </button>
          </motion.div>
        )}

        {step === 'welcome' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleStart}
            className="px-8 py-3 bg-accent text-background rounded-soft font-semibold"
          >
            Начать
          </motion.button>
        )}
      </div>

      <div className="p-4 text-center">
        <p className="text-xs text-gray-500">
          Нажимая "Начать", вы соглашаетесь с условиями использования
        </p>
      </div>
    </motion.div>
  );
}