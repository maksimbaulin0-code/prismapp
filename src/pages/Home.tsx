import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { getSpecialists as fetchSpecialists, getSpecialistById } from '../lib/api';
import { SpecialistCard, SpecialistCardSkeleton } from '../components/SpecialistCard';
import { CategoryScroll } from '../components/CategoryScroll';
import { SearchBar } from '../components/SearchBar';
import { SpecialistProfile } from '../components/SpecialistProfile';
import { ProOnboardingForm } from '../components/ProOnboardingForm';
import type { Specialist, Service } from '../lib/api';

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: '🔍' },
  { id: 'tattoo', name: 'Тату', icon: '🎨' },
  { id: 'nails', name: 'Ногти', icon: '💅' },
  { id: 'piercing', name: 'Пирсинг', icon: '✨' },
  { id: 'makeup', name: 'Макияж', icon: '💄' },
  { id: 'hair', name: 'Волосы', icon: '💇' },
  { id: 'lashes', name: 'Ресницы', icon: '👁️' },
];

interface SpecialistWithServices extends Specialist {
  services?: Service[];
}

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

  useEffect(() => {
    loadSpecialists();
  }, [selectedCategory]);

  const loadSpecialists = async () => {
    setIsLoading(true);
    const data = await fetchSpecialists(selectedCategory === 'all' ? undefined : selectedCategory);
    setSpecialists(data as SpecialistWithServices[]);
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
    const { createBooking } = await import('../lib/api');
    const result = await createBooking(user.id, selectedSpecialist.id, service.id, new Date().toISOString());
    if (result.success) {
      alert(`Бронирование ${service.name} создано!`);
      setSelectedSpecialist(null);
    } else {
      alert('Ошибка: ' + result.error);
    }
  };

  const openSpecialist = async (specialist: Specialist) => {
    const fullData = await getSpecialistById(specialist.id);
    setSelectedSpecialist(fullData as SpecialistWithServices);
  };

  const toggleProMode = () => {
    setIsProMode((prev) => {
      const next = !prev;
      if (!next) setShowProOnboarding(false);
      return next;
    });
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold tracking-tight">BeautyFind</h1>
          <button
            onClick={toggleProMode}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-sharp hover:bg-white/5 transition-colors"
          >
            {isProMode ? 'Клиент' : 'Мастер'}
          </button>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>

      <CategoryScroll
        categories={CATEGORIES.map((c) => ({ ...c, icon: <span>{c.icon}</span> }))}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isProMode ? 'Ваш кабинет' : 'Популярные мастера'}
          </h2>
          {isProMode ? (
            <button
              onClick={() => setShowProOnboarding(true)}
              className="text-xs text-gray-400 hover:text-accent transition-colors"
            >
              Редактировать →
            </button>
          ) : user ? (
            <button
              onClick={() => {
                setIsProMode(true);
                setShowProOnboarding(true);
              }}
              className="text-xs text-gray-400 hover:text-accent transition-colors"
            >
              Стать мастером →
            </button>
          ) : null}
        </div>

        {isProMode ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-soft text-center"
          >
            <h3 className="font-semibold mb-2">Добро пожаловать в кабинет</h3>
            <p className="text-sm text-gray-400 mb-4">Управляйте записями и услугами</p>
            <button
              onClick={() => setShowProOnboarding(true)}
              className="px-4 py-2 bg-accent text-background rounded-soft text-sm font-semibold"
            >
              Настроить профиль
            </button>
          </motion.div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SpecialistCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div layout className="space-y-4">
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
                  className="text-center py-12 text-gray-400"
                >
                  <p>Мастера не найдены</p>
                  <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
