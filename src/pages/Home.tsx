import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { getSpecialists as fetchSpecialists, getSpecialistById } from '../lib/api';
import { SpecialistCard, SpecialistCardSkeleton } from '../components/SpecialistCard';
import { CategoryScroll } from '../components/CategoryScroll';
import { SearchBar } from '../components/SearchBar';
import { SpecialistProfile } from '../components/SpecialistProfile';
import { ProOnboardingForm } from '../components/ProOnboardingForm';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import type { Specialist, Service } from '../lib/api';

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: '✨' },
  { id: 'tattoo', name: 'Тату', icon: '🎨' },
  { id: 'nails', name: 'Ногти', icon: '💅' },
  { id: 'piercing', name: 'Пирсинг', icon: '💎' },
  { id: 'makeup', name: 'Макияж', icon: '💄' },
  { id: 'hair', name: 'Волосы', icon: '💇' },
  { id: 'lashes', name: 'Ресницы', icon: '👁️' },
];

interface SpecialistWithServices extends Specialist {
  services?: Service[];
}

// Stagger animation config
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { user } = useAuth();
  const [specialists, setSpecialists] = useState<SpecialistWithServices[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistWithServices | null>(null);
  const [showProOnboarding, setShowProOnboarding] = useState(false);
  const [isProMode, setIsProMode] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load specialists when category changes
  useEffect(() => {
    loadSpecialists();
  }, [selectedCategory]);

  const loadSpecialists = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSpecialists(selectedCategory === 'all' ? undefined : selectedCategory);
      setSpecialists(data as SpecialistWithServices[]);
    } catch (e) {
      console.error('Failed to load specialists:', e);
    }
    setIsLoading(false);
  };

  const filteredSpecialists = useMemo(() => {
    if (!debouncedQuery) return specialists;
    const q = debouncedQuery.toLowerCase();
    return specialists.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.bio?.toLowerCase().includes(q) ?? false)
    );
  }, [specialists, debouncedQuery]);

  const handleBookService = async (service: Service) => {
    if (!user || !selectedSpecialist) {
      alert('Сначала войдите');
      return;
    }
    try {
      const { createBooking } = await import('../lib/api');
      const result = await createBooking(user.id, selectedSpecialist.id, service.id, new Date().toISOString());
      if (result.success) {
        alert(`Бронирование ${service.name} создано!`);
        setSelectedSpecialist(null);
      } else {
        alert('Ошибка: ' + result.error);
      }
    } catch (e) {
      alert('Ошибка при бронировании');
    }
  };

  const openSpecialist = useCallback(async (specialist: Specialist) => {
    const fullData = await getSpecialistById(specialist.id);
    setSelectedSpecialist(fullData as SpecialistWithServices);
  }, []);

  // FIX: Properly toggle pro mode and reset category when going back to client
  const toggleProMode = () => {
    setIsProMode((prev) => {
      const next = !prev;
      if (!next) {
        // Going back to client mode - reset everything
        setShowProOnboarding(false);
        setSelectedCategory('all');
      }
      return next;
    });
  };

  // FIX: Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Overlay: Pro Onboarding
  if (showProOnboarding) {
    return (
      <ProOnboardingForm
        onComplete={(data) => {
          console.log('Pro profile:', data);
          setShowProOnboarding(false);
        }}
        onCancel={() => setShowProOnboarding(false)}
      />
    );
  }

  // Overlay: Specialist Profile
  if (selectedSpecialist) {
    return (
      <SpecialistProfile
        specialist={selectedSpecialist}
        onBack={() => setSelectedSpecialist(null)}
        onBook={handleBookService}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Hero Header */}
      <header className="sticky top-0 z-30 glass border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-gradient">BeautyFind</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleProMode}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
              isProMode
                ? 'bg-accent text-background border-accent'
                : 'border-border hover:border-white/30 text-gray-300'
            }`}
          >
            {isProMode ? '👤 Клиент' : '✨ Мастер'}
          </motion.button>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>

      {/* Categories */}
      <CategoryScroll
        categories={CATEGORIES.map((c) => ({ ...c, icon: <span className="text-lg">{c.icon}</span> }))}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Content */}
      <section className="px-4 py-4">
        {/* Section Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h2 className="text-xl font-bold">
              {isProMode ? 'Ваш кабинет' : 'Популярные мастера'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isProMode 
                ? 'Управляйте профилем и записями'
                : `${filteredSpecialists.length} специалистов найдено`
              }
            </p>
          </div>
          
          {isProMode ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProOnboarding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Настроить
            </motion.button>
          ) : user ? (
            <motion.button
              whileHover={{ scale: 1.05, x: 3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsProMode(true);
                setShowProOnboarding(true);
              }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-accent transition-colors group"
            >
              Стать мастером
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ) : null}
        </motion.div>

        {/* Pro Mode Dashboard */}
        {isProMode ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <motion.div
              variants={itemVariants}
              className="glass gradient-border p-6 rounded-2xl text-center glow-strong"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Добро пожаловать</h3>
              <p className="text-gray-400 mb-6 max-w-xs mx-auto">
                Создайте профессиональный профиль и начните принимать клиентов
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProOnboarding(true)}
                className="px-8 py-3 bg-accent text-background rounded-full font-semibold text-sm magnetic-btn"
              >
                Настроить профиль
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <div className="glass p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-xs text-gray-500 mt-1">Записей</p>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-xs text-gray-500 mt-1">Отзывов</p>
              </div>
            </motion.div>
          </motion.div>
        ) : isLoading ? (
          /* Skeleton Loading */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SpecialistCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          /* Specialists List */
          <motion.div 
            layout
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredSpecialists.length > 0 ? (
                filteredSpecialists.map((specialist, index) => (
                  <SpecialistCard
                    key={specialist.id}
                    id={specialist.id}
                    name={specialist.name}
                    category={specialist.category}
                    rating={specialist.rating}
                    review_count={specialist.review_count}
                    location={specialist.location}
                    image_url={specialist.image_url}
                    index={index}
                    onClick={() => openSpecialist(specialist)}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg">Мастера не найдены</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Попробуйте изменить фильтры или поисковый запрос
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
