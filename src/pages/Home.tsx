import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecialistCard, SpecialistCardSkeleton } from '../components/SpecialistCard';
import { CategoryScroll } from '../components/CategoryScroll';
import { SearchBar } from '../components/SearchBar';
import { SpecialistProfile } from '../components/SpecialistProfile';
import { ProOnboardingForm } from '../components/ProOnboardingForm';
import { Specialist } from '@/types';

const MOCK_SPECIALISTS: Specialist[] = [
  {
    id: '1',
    name: 'Ink Master Studio',
    category: 'tattoo',
    rating: 4.9,
    reviewCount: 234,
    location: 'Москва',
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400',
    bio: 'Мастера татуировки с многолетним опытом. Специализация: реализм и длинная работа.',
    services: [
      { id: 's1', name: 'Маленькая татуировка', price: 150, duration: 60 },
      { id: 's2', name: 'Средний размер', price: 350, duration: 180 },
      { id: 's3', name: 'Рукав полностью', price: 1200, duration: 480 },
    ],
    portfolio: [
      { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1560707303-4e9803d1ad31?w=300', title: 'Dragon Design' },
      { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=300', title: 'Floral Work' },
      { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1590246294792-a8b137c4096a?w=300', title: 'Portrait' },
      { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1562962230-16bc46364924?w=300', title: 'Geometric' },
    ],
  },
  {
    id: '2',
    name: 'Luxe Nails Bar',
    category: 'nails',
    rating: 4.8,
    reviewCount: 189,
    location: 'Москва',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    bio: 'Премиальный нейл-арт и уход за ногтями.',
    services: [
      { id: 's1', name: 'Гель-маникюр', price: 45, duration: 45 },
      { id: 's2', name: 'Акрил полный набор', price: 75, duration: 90 },
      { id: 's3', name: 'Нейл-арт (за ноготь)', price: 5, duration: 10 },
    ],
    portfolio: [
      { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300', title: 'Ombre Gel' },
      { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=300', title: 'French Tips' },
      { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1632922267756-9b71242b1592?w=300', title: 'Nail Art' },
      { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=300', title: 'Matte Finish' },
    ],
  },
  {
    id: '3',
    name: 'Pierce Paradise',
    category: 'piercing',
    rating: 4.7,
    reviewCount: 156,
    location: 'Москва',
    imageUrl: 'https://images.unsplash.com/photo-1620331313174-9187a5f5a5f8?w=400',
    bio: 'Профессиональная пирсинг-студия со стерильной средой.',
    services: [
      { id: 's1', name: 'Прокол мочки', price: 30, duration: 15 },
      { id: 's2', name: 'Хрящ', price: 45, duration: 20 },
      { id: 's3', name: 'Нос прокол', price: 50, duration: 20 },
    ],
    portfolio: [
      { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1620331313174-9187a5f5a5f8?w=300', title: 'Ear Stack' },
      { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1574676539904-e6c8e0655f07?w=300', title: 'Septum' },
      { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1599557283988-85433613f9cd?w=300', title: 'Daith' },
      { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300', title: 'Industrial' },
    ],
  },
];

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

export default function Home({ activeTab, onTabChange }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [showProOnboarding, setShowProOnboarding] = useState(false);
  const [isProMode, setIsProMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredSpecialists = MOCK_SPECIALISTS.filter((specialist) => {
    const matchesCategory = selectedCategory === 'all' || specialist.category === selectedCategory;
    const matchesSearch = specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialist.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookService = (service: any) => {
    alert(`Бронирование ${service.name} за $${service.price}`);
  };

  const handleProOnboardingComplete = (data: any) => {
    console.log('Pro profile created:', data);
    setShowProOnboarding(false);
    setIsProMode(true);
  };

  if (showProOnboarding) {
    return (
      <ProOnboardingForm
        onComplete={handleProOnboardingComplete}
        onCancel={() => setShowProOnboarding(false)}
      />
    );
  }

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
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 glass border-b border-border px-4 py-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">BeautyFind</h1>
          <button
            onClick={() => setIsProMode(!isProMode)}
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
          {!isProMode && (
            <button
              onClick={() => setShowProOnboarding(true)}
              className="text-xs text-gray-400 hover:text-accent transition-colors"
            >
              Стать мастером →
            </button>
          )}
        </div>

        {isProMode ? (
          <div className="glass p-6 rounded-soft text-center">
            <h3 className="font-semibold mb-2">Добро пожаловать</h3>
            <p className="text-sm text-gray-400 mb-4">Управляйте бронированиями и профилем</p>
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
                    {...specialist}
                    index={index}
                    onClick={() => setSelectedSpecialist(specialist)}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-400"
                >
                  <p>Мастера не найдены</p>
                  <p className="text-sm mt-1">Попробуйте изменить поиск</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

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