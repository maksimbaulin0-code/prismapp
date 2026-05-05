import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecialistCard, SpecialistCardSkeleton } from '../components/SpecialistCard';
import { CategoryScroll } from '../components/CategoryScroll';
import { SearchBar } from '../components/SearchBar';
import { BottomNav } from '../components/BottomNav';
import { SpecialistProfile } from '../components/SpecialistProfile';
import { ProOnboardingForm } from '../components/ProOnboardingForm';
import { Specialist, CategoryType } from '@/types';
import { useTelegram } from '@/hooks/useTelegram';
import { 
  Search, 
  Calendar, 
  User, 
  Sparkles, 
  Palette, 
  Scissors, 
  Star, 
  MapPin,
  ChevronRight,
  Plus
} from 'lucide-react';

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
  { id: 'all', name: 'All', icon: <Search className="w-4 h-4" /> },
  { id: 'tattoo', name: 'Tattoo', icon: <Palette className="w-4 h-4" /> },
  { id: 'nails', name: 'Nails', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'piercing', name: 'Piercing', icon: <Star className="w-4 h-4" /> },
  { id: 'makeup', name: 'Makeup', icon: <Scissors className="w-4 h-4" /> },
  { id: 'hair', name: 'Hair', icon: <Scissors className="w-4 h-4" /> },
  { id: 'lashes', name: 'Lashes', icon: <Sparkles className="w-4 h-4" /> },
];

export default function Home() {
  const { tg, user, colorScheme, showMainButton, hideMainButton, setMainButtonText, showAlert, showBackButton, hideBackButton } = useTelegram();
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

  // Telegram Main Button for booking
  useEffect(() => {
    if (selectedSpecialist) {
      showMainButton('Book Now', () => {
        showAlert(`Booking request sent to ${selectedSpecialist.name}!`);
      });
      showBackButton(() => setSelectedSpecialist(null));
    } else {
      hideMainButton();
      hideBackButton();
    }

    return () => {
      hideMainButton();
      hideBackButton();
    };
  }, [selectedSpecialist, showMainButton, hideMainButton, showAlert, showBackButton, hideBackButton]);

  // Debounced search filtering
  const filteredSpecialists = MOCK_SPECIALISTS.filter((specialist) => {
    const matchesCategory = selectedCategory === 'all' || specialist.category === selectedCategory;
    const matchesSearch = specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialist.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookService = (service: any) => {
    if (tg) {
      tg.showConfirm(`Book ${service.name} for $${service.price}?`, (confirmed) => {
        if (confirmed) {
          showAlert(`Booking confirmed: ${service.name}`);
        }
      });
    } else {
      alert(`Booking ${service.name} for $${service.price}`);
    }
  };

  const handleProOnboardingComplete = (data: any) => {
    console.log('Pro profile created:', data);
    setShowProOnboarding(false);
    setIsProMode(true);
    if (tg) {
      showAlert('Your Pro profile has been created successfully!');
    }
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
      {/* Header - Vercel-style sticky nav */}
      <header className="sticky top-0 glass-strong border-b border-border z-50">
        <div className="px-4 py-3">
          {/* Breadcrumb-style header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight">BeautyFind</h1>
              <span className="text-border">/</span>
              <span className="text-xs text-accent-secondary">Discovery</span>
            </div>
            <button
              onClick={() => setIsProMode(!isProMode)}
              className={`px-2.5 py-1.5 text-xs font-medium border border-border rounded-sharp hover:border-border-hover transition-all duration-200 ${
                isProMode ? 'bg-white/5 text-accent' : 'text-accent-secondary'
              }`}
            >
              {isProMode ? 'Pro Dashboard' : 'Pro Mode'}
            </button>
          </div>
          
          {/* User greeting */}
          {user && (
            <p className="text-xs text-accent-secondary mb-3">
              Welcome back, <span className="text-accent">{user.firstName}</span>
            </p>
          )}
          
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      {/* Categories - Horizontal scroll */}
      <CategoryScroll
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Featured Section */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-accent-secondary uppercase tracking-wider">
            {isProMode ? 'Dashboard' : 'Featured Specialists'}
          </h2>
          {!isProMode && (
            <button
              onClick={() => setShowProOnboarding(true)}
              className="flex items-center gap-1 text-xs text-accent-secondary hover:text-accent transition-colors"
            >
              <Plus className="w-3 h-3" />
              Become a Pro
            </button>
          )}
        </div>

        {isProMode ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="glass p-5 rounded-soft border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Pro Dashboard</h3>
                <span className="status-dot green" title="Active" />
              </div>
              <p className="text-sm text-accent-secondary mb-4">
                Manage your bookings, services, and portfolio from here.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-card rounded-sharp border border-border">
                  <p className="text-lg font-bold">12</p>
                  <p className="text-xs text-accent-secondary">Bookings</p>
                </div>
                <div className="text-center p-3 bg-card rounded-sharp border border-border">
                  <p className="text-lg font-bold">4.9</p>
                  <p className="text-xs text-accent-secondary">Rating</p>
                </div>
                <div className="text-center p-3 bg-card rounded-sharp border border-border">
                  <p className="text-lg font-bold">28</p>
                  <p className="text-xs text-accent-secondary">Reviews</p>
                </div>
              </div>
              <button
                onClick={() => setShowProOnboarding(true)}
                className="w-full py-2.5 bg-accent text-background rounded-soft text-sm font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                Edit Profile
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
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
                  className="text-center py-12 text-accent-secondary"
                >
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No specialists found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
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
