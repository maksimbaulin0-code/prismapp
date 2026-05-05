import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { getSpecialists as fetchSpecialists, getSpecialistById } from '../lib/api';
import { SpecialistCard, SpecialistCardSkeleton } from '../components/SpecialistCard';
import { CategoryScroll } from '../components/CategoryScroll';
import { SearchBar } from '../components/SearchBar';
import { SpecialistProfile } from '../components/SpecialistProfile';
import { ProOnboardingForm } from '../components/ProOnboardingForm';
import type { Specialist, Service } from '../lib/db';

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: '🔍' },
  { id: 'tattoo', name: 'Тату', icon: '🎨' },
  { id: 'nails', name: 'Ногти', icon: '💅' },
  { id: 'piercing', name: 'Пирсинг', icon: '✨' },
  { id: 'makeup', name: 'Макияж', icon: '💄' },
  { id: 'hair', name: 'Волосы', icon: '💇' },
  { id: 'lashes', name: 'Ресницы', icon: '👁️' },
];

interface HomeProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface SpecialistWithServices extends Specialist {
  services?: Service[];
}

export default function Home({ activeTab, onTabChange }: HomeProps) {
  const { user } = useAuth();
  const [specialists, setSpecialists] = useState<SpecialistWithServices[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistWithServices | null>(null);
  const [showProOnboarding, setShowProOnboarding] = useState(false);
  const [isProMode, setIsProMode] = useState(false);

  useEffect(() => {
    loadSpecialists();
  }, [selectedCategory]);

  const loadSpecialists = async () => {
    setIsLoading(true);
    const data = await fetchSpecialists(selectedCategory === 'all' ? undefined : selectedCategory);
    setSpecialists(data as SpecialistWithServices[]);
    setIsLoading(false);
  };

  const filteredSpecialists = specialists.filter((specialist) => {
    const matchesSearch = !searchQuery || 
      specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (specialist.bio?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleBookService = async (serviceId: number) => {
    if (!user || !selectedSpecialist) {
      alert('Сначала войдите через Telegram');
      return;
    }
    
    const { createBooking } = await import('../lib/api');
    const date = new Date().toISOString();
    const result = await createBooking(user.id, selectedSpecialist.id, serviceId, date);
    
    if (result.success) {
      alert('Бронирование создано!');
      setSelectedSpecialist(null);
    } else {
      alert('Ошибка: ' + result.error);
    }
  };

  const openSpecialist = async (specialist: Specialist) => {
    const fullData = await getSpecialistById(specialist.id);
    setSelectedSpecialist(fullData as SpecialistWithServices);
  };

  if (showProOnboarding) {
    return (
      <ProOnboardingForm
        onComplete={(data) => {
          console.log('Pro profile created:', data);
          setShowProOnboarding(false);
          setIsProMode(true);
        }}
        onCancel={() => setShowProOnboarding(false)}
      />
    );
  }

  if (selectedSpecialist) {
    return (
      <SpecialistProfile
        specialist={selectedSpecialist}
        onBack={() => setSelectedSpecialist(null)}
        onBook={(service) => handleBookService(service.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 glass border-b border-border px-4 py-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">BeautyFind</h1>
          <button
            onClick={() => setIsProMode(!isProMode)}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-sharp hover:bg-white/5"
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
          {!isProMode && user && (
            <button
              onClick={() => setShowProOnboarding(true)}
              className="text-xs text-gray-400 hover:text-accent"
            >
              Стать мастером →
            </button>
          )}
        </div>

        {isProMode ? (
          <div className="glass p-6 rounded-soft text-center">
            <h3 className="font-semibold mb-2">Добро пожаловать</h3>
            <p className="text-sm text-gray-400 mb-4">Управляйте бронированиями</p>
            <button
              onClick={() => setShowProOnboarding(true)}
              className="px-4 py-2 bg-accent text-background rounded-soft text-sm font-semibold"
            >
              Редактировать
            </button>
          </div>
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

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