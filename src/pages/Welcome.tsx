import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { Sparkles, ArrowRight, User } from 'lucide-react';

export default function Welcome() {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [step, setStep] = useState<'welcome' | 'name'>('welcome');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Введите ваше имя');
      return;
    }
    const fakeTelegramId = Date.now();
    await signIn(fakeTelegramId, name.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col relative overflow-hidden"
    >
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl"
        >
          <Sparkles className="w-12 h-12 text-accent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold mb-3 text-gradient"
        >
          Prism
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 mb-10 max-w-xs leading-relaxed"
        >
          Находи лучших мастеров красоты
          <br />
          и записывайся онлайн
        </motion.p>

        <AnimatePresence mode="wait">
          {step === 'name' ? (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xs space-y-4"
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Как вас зовут?"
                  className="w-full pl-12 pr-4 py-4 bg-card border border-white/[0.08] rounded-xl outline-none focus:border-white/30 text-center text-lg font-medium transition-all"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="w-full py-4 bg-accent text-background rounded-xl font-bold text-base magnetic-btn glow-strong flex items-center justify-center gap-2"
              >
                Продолжить
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <button
                onClick={() => setStep('welcome')}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Назад
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep('name')}
                className="px-10 py-4 bg-accent text-background rounded-xl font-bold text-base magnetic-btn glow-strong flex items-center justify-center gap-2 w-full max-w-xs"
              >
                Начать
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <p className="text-xs text-gray-600">
                Нажимая "Начать", вы соглашаетесь с условиями
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom decorative line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}
