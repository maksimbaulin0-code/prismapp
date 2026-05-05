import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecialistCard, SpecialistCardSkeleton } from '../components/SpecialistCard';
import { CategoryScroll } from '../components/CategoryScroll';
import { SearchBar } from '../components/SearchBar';
import { BottomNav } from '../components/BottomNav';
import { SpecialistProfile } from '../components/SpecialistProfile';
import { ProOnboardingForm } from '../components/ProOnboardingForm';
import { Specialist } from '@/types';

// Mock data
const MOCK_SPECIALISTS: Specialist[] = [
  {
    id: '1',
    name: 'Ink Master Studio',
    category: 'tattoo',
    rating: 4.9,
    reviewCount: 234,
    location: 'Downtown, NY',
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400',
    bio: 'Award-winning tattoo artists specializing in realism and fine line work.',
    services: [
      { id: 's1', name: 'Small Tattoo', price: 150, duration: 60 },
      { id: 's2', name: 'Medium Piece', price: 350, duration: 180 },
      { id: 's3', name: 'Full Sleeve', price: 1200, duration: 480 },
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
    location: 'SoHo, NY',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    bio: 'Premium nail art and care services with attention to detail.',
    services: [
      { id: 's1', name: 'Gel Manicure', price: 45, duration: 45 },
      { id: 's2', name: 'Acrylic Full Set', price: 75, duration: 90 },
      { id: 's3', name: 'Nail Art (per nail)', price: 5, duration: 10 },
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
    location: 'Brooklyn, NY',
    imageUrl: 'https://images.unsplash.com/photo-1620331313174-9187a5f5a5f8?w=400',
    bio: 'Professional piercing studio with sterile environment and experienced piercers.',
    services: [
      { id: 's1', name: 'Ear Lobe', price: 30, duration: 15 },
      { id: 's2', name: 'Cartilage', price: 45, duration: 20 },
      { id: 's3', name: 'Nose Piercing', price: 50, duration: 20 },
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
  { id: 'all', name: 'All', icon: '🔍' },
  { id: 'tattoo', name: 'Tattoo', icon: '🎨' },
  { id: 'nails', name: 'Nails', icon: '💅' },
  { id: 'piercing', name: 'Piercing', icon: '✨' },
  { id: 'makeup', name: 'Makeup', icon: '💄' },
  { id: 'hair', name: 'Hair', icon: '💇' },
  { id: 'lashes', name: 'Lashes', icon: '👁️' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [showProOnboarding, setShowProOnboarding] = useState(false);
  const [isProMode, setIsProMode] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Debounced search filtering
  const filteredSpecialists = MOCK_SPECIALISTS.filter((specialist) => {
    const matchesCategory = selectedCategory === 'all' || specialist.category === selectedCategory;
    const matchesSearch = specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialist.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookService = (service: any) => {
    alert(`Booking ${service.name} for $${service.price}`);
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
      {/* Header */}
      <header className="sticky top-0 glass border-b border-border px-4 py-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">BeautyFind</h1>
          <button
            onClick={() => setIsProMode(!isProMode)}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-sharp hover:bg-white/5 transition-colors"
          >
            {isProMode ? 'Client View' : 'Pro Mode'}
          </button>
        </div>
        
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>

      {/* Categories */}
      <CategoryScroll
        categories={CATEGORIES.map((c) => ({ ...c, icon: <span>{c.icon}</span> }))}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Featured Section */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isProMode ? 'Your Dashboard' : 'Featured Specialists'}
          </h2>
          {!isProMode && (
            <button
              onClick={() => setShowProOnboarding(true)}
              className="text-xs text-gray-400 hover:text-accent transition-colors"
            >
              Become a Pro →
            </button>
          )}
        </div>

        {isProMode ? (
          <div className="glass p-6 rounded-soft text-center">
            <h3 className="font-semibold mb-2">Welcome to Pro Dashboard</h3>
            <p className="text-sm text-gray-400 mb-4">Manage your bookings, services, and portfolio.</p>
            <button
              onClick={() => setShowProOnboarding(true)}
              className="px-4 py-2 bg-accent text-background rounded-soft text-sm font-semibold"
            >
              Edit Profile
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SpecialistCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="space-y-4"
          >
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
                  <p>No specialists found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
