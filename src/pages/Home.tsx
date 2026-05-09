import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { getSpecialists as fetchSpecialists, getSpecialistById, getSpecialistByUserId, getTimeSlots, addTimeSlot, deleteTimeSlot, saveProProfile, getSpecialistBookings, updateBookingStatus, updateSpecialist, createOrGetUser } from '../lib/api';
import { compressFileToJpegDataUrl } from '../lib/imageCompress';
import { getSpecialistReferralShareUrl } from '../lib/telegramLinks';
import type { ProProfileData, TimeSlot } from '../lib/api';
import { SpecialistCard, SpecialistCardSkeleton } from '../components/SpecialistCard';
import { CategoryScroll } from '../components/CategoryScroll';
import { SearchBar } from '../components/SearchBar';
import { SpecialistProfile } from '../components/SpecialistProfile';
import { Sparkles, Plus, Clock, Trash2, CalendarDays, Pencil, Check, X, Camera, MapPin, LayoutGrid, List, Share2, CheckCircle } from 'lucide-react';
import type { Specialist, Service } from '../lib/api';

const CATEGORIES = [
  { id: 'all', name: 'Все' },
  { id: 'tattoo', name: 'Тату' },
  { id: 'nails', name: 'Ногти' },
  { id: 'piercing', name: 'Пирсинг' },
  { id: 'makeup', name: 'Макияж' },
  { id: 'hair', name: 'Волосы' },
  { id: 'lashes', name: 'Ресницы' },
];

const CATEGORY_MAP: Record<string, string> = {
  tattoo: 'Тату',
  nails: 'Ногти',
  piercing: 'Пирсинг',
  makeup: 'Макияж',
  hair: 'Волосы',
  lashes: 'Ресницы',
};

const SLOT_TIME_OPTIONS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
] as const;

function normalizeSlotDateKey(d: string): string {
  return String(d).slice(0, 10);
}

function normalizeTimeLabel(t: string): string {
  return String(t).trim().slice(0, 5);
}

function slotsCountLabel(n: number): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return `${n} слот`;
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return `${n} слота`;
  return `${n} слотов`;
}

interface SpecialistWithServices extends Specialist {
  services?: Service[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface HomeProps {
  isProMode: boolean;
  proProfile: ProProfileData | null;
  onSetProProfile: (profile: ProProfileData) => void;
  onToggleProMode: () => void;
  onShowProOnboarding: () => void;
  refSpecialistId?: number | null;
  onRefSpecialistUsed?: () => void;
}

export default function Home({ isProMode, proProfile, onSetProProfile, onToggleProMode, onShowProOnboarding, refSpecialistId, onRefSpecialistUsed }: HomeProps) {
  const { user } = useAuth();
  const [specialists, setSpecialists] = useState<SpecialistWithServices[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistWithServices | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [selectedSlotTimes, setSelectedSlotTimes] = useState<string[]>([]);
  const [specialistId, setSpecialistId] = useState<number | null>(proProfile?.id || null);

  const [localProProfile, setLocalProProfile] = useState<ProProfileData | null>(proProfile);
  useEffect(() => { 
    if (proProfile) {
      setLocalProProfile(proProfile);
      setSpecialistId(proProfile.id || null);
    }
  }, [proProfile]);

  const portfolioWithoutCover = useMemo(() => {
    if (!localProProfile) return [];
    const c = localProProfile.coverImage?.trim();
    if (!c) return localProProfile.portfolio;
    return localProProfile.portfolio.filter((p) => p.trim() !== c);
  }, [localProProfile]);

  // Inline editing states
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [editBioValue, setEditBioValue] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [editAddressValue, setEditAddressValue] = useState('');
  const [addingService, setAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'wide'>('compact');
  const [incomingBookings, setIncomingBookings] = useState<any[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load specialists when category changes
  useEffect(() => {
    loadSpecialists();
  }, [selectedCategory]);

  // Handle ref specialist - open specialist profile
  useEffect(() => {
    if (refSpecialistId && !selectedSpecialist) {
      const loadRefSpecialist = async () => {
        const fullData = await getSpecialistById(refSpecialistId);
        if (fullData) {
          setSelectedSpecialist(fullData as SpecialistWithServices);
        }
        onRefSpecialistUsed?.();
      };
      loadRefSpecialist();
    }
  }, [refSpecialistId]);

  useEffect(() => {
    async function loadProData() {
      if (isProMode && specialistId) {
        try {
          const [slotsData, bookingsData] = await Promise.all([
            getTimeSlots(specialistId),
            getSpecialistBookings(specialistId)
          ]);
          setSlots(slotsData);
          setIncomingBookings(bookingsData);
        } catch (e) {
          console.error('Failed to load pro data:', e);
        }
      }
    }
    loadProData();
  }, [isProMode, specialistId]);

  // Reset selected specialist when switching modes and reload specialists
  useEffect(() => {
    setSelectedSpecialist(null);
    if (!isProMode) {
      setSpecialists([]);
      loadSpecialists();
    }
  }, [isProMode]);

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
    if (!debouncedQuery.trim()) return specialists;
    const q = debouncedQuery.toLowerCase().trim();
    return specialists.filter((s) => {
      const nameBio =
        s.name.toLowerCase().includes(q) ||
        (s.bio?.toLowerCase().includes(q) ?? false);
      const slug = (s.category || '').toLowerCase();
      const label = (CATEGORY_MAP[s.category] || s.category || '').toLowerCase();
      const categoryMatch = slug.includes(q) || label.includes(q);
      return nameBio || categoryMatch;
    });
  }, [specialists, debouncedQuery]);

  const slotTimesTakenForSelectedDate = useMemo(() => {
    if (!newSlotDate) return new Set<string>();
    const taken = new Set<string>();
    for (const s of slots) {
      if (normalizeSlotDateKey(s.date) === newSlotDate) {
        taken.add(normalizeTimeLabel(s.time));
      }
    }
    return taken;
  }, [slots, newSlotDate]);

  useEffect(() => {
    setSelectedSlotTimes([]);
  }, [newSlotDate]);

  const openSpecialist = useCallback(async (specialist: Specialist) => {
    const fullData = await getSpecialistById(specialist.id);
    setSelectedSpecialist(fullData as SpecialistWithServices);
  }, []);

  const handleAddSlot = async () => {
    if (!specialistId || !newSlotDate || selectedSlotTimes.length === 0) return;
    try {
      await Promise.all(
        selectedSlotTimes.map((time) =>
          addTimeSlot({ specialist_id: specialistId, date: newSlotDate, time })
        )
      );
      const slotsData = await getTimeSlots(specialistId);
      setSlots(slotsData);
      setSelectedSlotTimes([]);
      setNewSlotDate('');
      setShowSlotForm(false);
    } catch (e) {
      console.error('Failed to add slot:', e);
      alert(e instanceof Error ? e.message : 'Не удалось добавить слоты');
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!specialistId) return;
    try {
      await deleteTimeSlot(slotId);
      const slotsData = await getTimeSlots(specialistId);
      setSlots(slotsData);
    } catch (e) {
      console.error('Failed to delete slot:', e);
    }
  };

  const handleBookingAction = async (bookingId: number, status: 'confirmed' | 'cancelled') => {
    if (!specialistId) return;
    try {
      await updateBookingStatus(bookingId, status);
      const bookingsData = await getSpecialistBookings(specialistId);
      setIncomingBookings(bookingsData);
    } catch (e) {
      console.error('Failed to update booking:', e);
    }
  };

  const handleShareLink = () => {
    if (!specialistId) return;

    const link = getSpecialistReferralShareUrl(specialistId);
    navigator.clipboard.writeText(link).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    });
  };

  const saveProfileChanges = async (updates: Partial<ProProfileData>) => {
    if (!localProProfile) return;
    const previous = localProProfile;
    const updated = { ...localProProfile, ...updates };

    let targetId = Number(specialistId ?? proProfile?.id ?? localProProfile.id);
    if (!Number.isFinite(targetId)) targetId = NaN;

    // Канонический specialists.id по users.id с сервера (как после перезагрузки), не по session user.id — он мог быть telegram_id.
    const telegramId = user?.telegram_id ?? user?.id;
    if (telegramId != null) {
      try {
        const dbUser = await createOrGetUser(Number(telegramId), user?.name || 'Пользователь');
        const canonical = await getSpecialistByUserId(dbUser.id);
        if (canonical?.id != null) {
          targetId = Number(canonical.id);
        }
      } catch {
        /* оставляем targetId из состояния */
      }
    }

    const canSyncApi = Number.isFinite(targetId) && targetId > 0;
    const payload: ProProfileData = { ...updated, id: targetId };

    setLocalProProfile(payload);
    try {
      saveProProfile(payload);
    } catch {
      /* setStoredProProfile уже логирует; не блокируем сохранение на сервер */
    }
    onSetProProfile(payload);

    if (!canSyncApi) {
      console.warn('Нет specialist id — профиль только локально. Завершите регистрацию мастера.');
      return;
    }

    try {
      await updateSpecialist(targetId, payload);
    } catch (e) {
      console.error('Failed to update specialist:', e);
      setLocalProProfile(previous);
      try {
        saveProProfile(previous);
      } catch {
        /* ignore */
      }
      onSetProProfile(previous);
      alert(
        e instanceof Error
          ? e.message
          : 'Не удалось сохранить на сервер. Проверьте связь и что запущен бэкенд (npm run dev:server).'
      );
    }
  };

  const handleSaveName = async () => {
    if (editNameValue.trim()) await saveProfileChanges({ name: editNameValue.trim() });
    setEditingName(false);
  };

  const handleSaveBio = async () => {
    await saveProfileChanges({ bio: editBioValue.trim() });
    setEditingBio(false);
  };

  const handleSaveAddress = async () => {
    await saveProfileChanges({ address: editAddressValue.trim() });
    setEditingAddress(false);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Файл слишком большой'); return; }
    try {
      const coverImage = await compressFileToJpegDataUrl(file);
      await saveProfileChanges({ coverImage });
      setTimeout(() => loadSpecialists(), 100);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Не удалось обработать фото');
    }
    e.target.value = '';
  };

  const handleAddService = () => {
    const price = parseFloat(newServicePrice);
    const duration = parseInt(newServiceDuration);
    if (!newServiceName.trim() || !price || !duration) return;
    if (!localProProfile) return;
    const services = [...localProProfile.services, { name: newServiceName.trim(), price, duration }];
    saveProfileChanges({ services });
    setAddingService(false);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
  };

  const handleRemoveService = (index: number) => {
    if (!localProProfile) return;
    const services = localProProfile.services.filter((_, i) => i !== index);
    saveProfileChanges({ services });
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !localProProfile) return;
    const fileArray = Array.from(files);
    const newUrls: string[] = [];
    try {
      for (const file of fileArray) {
        if (file.size > 5 * 1024 * 1024) continue;
        newUrls.push(await compressFileToJpegDataUrl(file));
      }
      if (newUrls.length > 0) {
        const portfolio = [...localProProfile.portfolio, ...newUrls];
        await saveProfileChanges({ portfolio });
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Не удалось добавить фото');
    }
    e.target.value = '';
  };

  const handleRemovePortfolio = (index: number) => {
    if (!localProProfile) return;
    const portfolio = localProProfile.portfolio.filter((_, i) => i !== index);
    const removed = localProProfile.portfolio[index];
    const coverImage = localProProfile.coverImage === removed ? portfolio[0] || '' : localProProfile.coverImage;
    saveProfileChanges({ portfolio, coverImage });
  };

  // Overlay: Specialist Profile
  if (selectedSpecialist) {
    return (
      <SpecialistProfile
        specialist={selectedSpecialist}
        onBack={() => {
          setSelectedSpecialist(null);
          loadSpecialists();
        }}
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
            <h1 className="text-2xl font-bold tracking-tight text-gradient">Prism</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isProMode) setSelectedCategory('all');
              onToggleProMode();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
              isProMode
                ? 'bg-accent text-background border-accent'
                : 'border-border hover:border-white/30 text-gray-300'
            }`}
          >
            {isProMode ? '👤 Клиент' : '✨ Мастер'}
          </motion.button>
        </div>
        {!isProMode && <SearchBar value={searchQuery} onChange={setSearchQuery} />}
      </header>

      {/* Categories */}
      {!isProMode && (
        <CategoryScroll
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* View Toggle and Count */}
      {!isProMode && (
        <div className="px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredSpecialists.length} специалистов найдено
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === 'compact' ? 'wide' : 'compact')}
            className="p-2 rounded-lg bg-card border border-white/[0.06] text-gray-400 hover:text-white transition-colors"
            title={viewMode === 'compact' ? 'Широкий вид' : 'Компактный вид'}
          >
            {viewMode === 'compact' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </motion.button>
        </div>
      )}

      {/* Content */}
      <section className="px-4 py-4">

        {/* Pro Mode Header */}
        {isProMode && (
          <p className="mb-4 text-sm text-gray-500">
            Управляйте профилем и записями
          </p>
        )}

        {/* Pro Mode Dashboard */}
        {isProMode ? (
          localProProfile ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {/* Cover Image */}
              <motion.div variants={itemVariants} className="relative group">
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  accept="image/*"
                  className="hidden"
                />
                {localProProfile.coverImage || localProProfile.portfolio[0] ? (
                  <div className="relative aspect-[2/1] rounded-2xl overflow-hidden">
                    <img
                      src={localProProfile.coverImage || localProProfile.portfolio[0]}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => coverInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Сменить обложку
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full aspect-[2/1] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-white/30 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-500" />
                    <span className="text-sm text-gray-400">Загрузить обложку</span>
                  </button>
                )}
              </motion.div>

              {/* Profile Card */}
              <motion.div variants={itemVariants} className="glass p-6 rounded-2xl">
                {/* Name with inline edit */}
                <div className="flex items-center gap-2 mb-2 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className="flex-1 min-w-0 bg-card border border-border rounded-xl px-3 py-2 text-base font-bold outline-none"
                        autoFocus
                      />
                      <button onClick={handleSaveName} className="shrink-0 p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingName(false)} className="shrink-0 p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold truncate">{localProProfile.name}</h3>
                      <button
                        onClick={() => { setEditNameValue(localProProfile.name); setEditingName(true); }}
                        className="shrink-0 p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Bio with inline edit */}
                <div className="flex items-start gap-2 mb-4 min-w-0">
                  {editingBio ? (
                    <div className="flex items-start gap-2 w-full min-w-0">
                      <textarea
                        value={editBioValue}
                        onChange={(e) => setEditBioValue(e.target.value)}
                        rows={3}
                        className="flex-1 min-w-0 bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none resize-none"
                        autoFocus
                      />
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={handleSaveBio} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingBio(false)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 flex-1 min-w-0">{localProProfile.bio || 'Нет описания'}</p>
                      <button
                        onClick={() => { setEditBioValue(localProProfile.bio || ''); setEditingBio(true); }}
                        className="shrink-0 p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {localProProfile.categories.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">
                      {CATEGORY_MAP[cat] || cat}
                    </span>
                  ))}
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 mb-4 min-w-0">
                  {editingAddress ? (
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <input
                        type="text"
                        value={editAddressValue}
                        onChange={(e) => setEditAddressValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveAddress()}
                        placeholder="Адрес салона"
                        className="flex-1 min-w-0 bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none"
                        autoFocus
                      />
                      <button onClick={handleSaveAddress} className="shrink-0 p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingAddress(false)} className="shrink-0 p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                      <p className="text-sm text-gray-400 flex-1 min-w-0 truncate">{localProProfile.address || 'Адрес не указан'}</p>
                      <button
                        onClick={() => { setEditAddressValue(localProProfile.address || ''); setEditingAddress(true); }}
                        className="shrink-0 p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass p-3 rounded-xl text-center">
                    <p className="text-xl font-bold text-accent">{localProProfile.services.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Услуг</p>
                  </div>
                  <div className="glass p-3 rounded-xl text-center">
                    <p className="text-xl font-bold text-accent">{portfolioWithoutCover.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Фото</p>
                  </div>
                  <button
                    onClick={() => setShowBookings(!showBookings)}
                    className="glass p-3 rounded-xl text-center hover:bg-white/5 transition-colors"
                  >
                    <p className="text-xl font-bold text-accent">{incomingBookings.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Записей</p>
                  </button>
                </div>
                
                {/* Share Link Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareLink}
                  className="w-full mt-4 py-3 bg-accent/20 text-accent rounded-xl font-medium hover:bg-accent/30 transition-colors flex items-center justify-center gap-2"
                >
                  {shareLinkCopied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Ссылка скопирована!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Поделиться ссылкой на запись
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Incoming Bookings */}
              {showBookings && (
                <motion.div variants={itemVariants} className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Входящие записи</h3>
                  {incomingBookings.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm bg-card rounded-xl border border-white/[0.06]">
                      Записей пока нет
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {incomingBookings.map((booking: any) => (
                        <div key={booking.id} className="glass p-4 rounded-xl border border-white/[0.06]">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{booking.service_name || 'Услуга'}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(booking.date).toLocaleDateString('ru-RU')} в {new Date(booking.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                              booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {booking.status === 'confirmed' ? 'Подтверждено' : booking.status === 'cancelled' ? 'Отменено' : 'Ожидает'}
                            </span>
                          </div>
                          {booking.status === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30"
                              >
                                Подтвердить
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30"
                              >
                                Отклонить
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Time Slots Management */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Свободные слоты</h3>
                  <button
                    onClick={() => setShowSlotForm(!showSlotForm)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {showSlotForm ? 'Отмена' : 'Добавить'}
                  </button>
                </div>

                {showSlotForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="glass p-4 rounded-xl mb-3 space-y-3"
                  >
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Дата</label>
                      <input
                        type="date"
                        value={newSlotDate}
                        onChange={(e) => setNewSlotDate(e.target.value)}
                        className="w-full px-3 py-2 bg-card border border-border rounded-xl outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Время — можно выбрать несколько на эту дату
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {SLOT_TIME_OPTIONS.map((time) => {
                          const taken = slotTimesTakenForSelectedDate.has(time);
                          const selected = selectedSlotTimes.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={!newSlotDate || taken}
                              onClick={() => {
                                if (taken) return;
                                setSelectedSlotTimes((prev) =>
                                  prev.includes(time)
                                    ? prev.filter((t) => t !== time)
                                    : [...prev, time].sort()
                                );
                              }}
                              className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                                taken
                                  ? 'bg-white/[0.04] border-white/[0.04] text-gray-600 cursor-not-allowed line-through'
                                  : selected
                                    ? 'bg-accent text-background border-accent'
                                    : 'bg-card border-white/[0.06] hover:border-white/20 text-gray-300'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      disabled={!newSlotDate || selectedSlotTimes.length === 0}
                      className="w-full py-2 bg-accent text-background rounded-xl font-medium text-sm disabled:opacity-50"
                    >
                      {selectedSlotTimes.length === 0
                        ? 'Выберите время'
                        : `Добавить ${slotsCountLabel(selectedSlotTimes.length)}`}
                    </button>
                  </motion.div>
                )}

                {slots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm bg-card rounded-xl border border-white/[0.06]">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    Нет свободных слотов
                  </div>
                ) : (
                  <div className="space-y-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          slot.isBooked
                            ? 'bg-white/5 border-white/[0.03]'
                            : 'bg-card border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${slot.isBooked ? 'bg-red-400' : 'bg-green-400'}`} />
                          <div>
                            <p className={`text-sm font-medium ${slot.isBooked ? 'text-gray-500 line-through' : ''}`}>
                              {new Date(slot.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </p>
                            <p className={`text-xs ${slot.isBooked ? 'text-gray-600' : 'text-gray-400'}`}>
                              {slot.time}
                            </p>
                          </div>
                        </div>
                        {!slot.isBooked && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {slot.isBooked && (
                          <span className="text-xs text-red-400 px-2 py-1 bg-red-400/10 rounded-lg">Занят</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Services with inline editing */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Услуги</h3>
                  <button
                    onClick={() => setAddingService(!addingService)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {addingService ? 'Отмена' : 'Добавить'}
                  </button>
                </div>

                {addingService && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="glass p-4 rounded-xl mb-3 space-y-2"
                  >
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Название услуги"
                      className="w-full px-3 py-2 bg-card border border-border rounded-xl outline-none text-sm"
                    />
                    <div className="flex gap-2 min-w-0">
                      <input
                        type="number"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        placeholder="Цена (₽)"
                        className="min-w-0 flex-1 px-3 py-2 bg-card border border-border rounded-xl outline-none text-sm"
                      />
                      <input
                        type="number"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        placeholder="Мин."
                        inputMode="numeric"
                        className="w-[4.75rem] shrink-0 px-2 py-2 bg-card border border-border rounded-xl outline-none text-sm tabular-nums"
                      />
                    </div>
                    <button
                      onClick={handleAddService}
                      disabled={!newServiceName.trim() || !newServicePrice || !newServiceDuration}
                      className="w-full py-2 bg-accent text-background rounded-xl font-medium text-sm disabled:opacity-50"
                    >
                      Добавить услугу
                    </button>
                  </motion.div>
                )}

                {localProProfile.services.length === 0 && !addingService ? (
                  <div className="text-center py-6 text-gray-500 text-sm bg-card rounded-xl border border-white/[0.06]">
                    Услуги пока не добавлены
                  </div>
                ) : (
                  <div className="space-y-2">
                    {localProProfile.services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-card border border-white/[0.06] rounded-xl group"
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{service.duration} мин</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-accent">{service.price}₽</span>
                          <button
                            onClick={() => handleRemoveService(idx)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Portfolio with inline editing */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Портфолио</h3>
                  <input
                    type="file"
                    ref={portfolioInputRef}
                    onChange={handlePortfolioUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => portfolioInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs text-accent hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить
                  </button>
                </div>

                {portfolioWithoutCover.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm bg-card rounded-xl border border-white/[0.06]">
                    Фото пока не добавлены
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {localProProfile.portfolio.map((photo, idx) => {
                      const c = localProProfile.coverImage?.trim();
                      if (c && photo.trim() === c) return null;
                      return (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img src={photo} alt={`portfolio-${idx}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemovePortfolio(idx)}
                            className="absolute top-1 right-1 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
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
                  onClick={onShowProOnboarding}
                  className="px-8 py-3 bg-accent text-background rounded-full font-semibold text-sm magnetic-btn"
                >
                  Настроить профиль
                </motion.button>
              </motion.div>
            </motion.div>
          )
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SpecialistCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={viewMode === 'wide' ? 'space-y-4 sm:space-y-5' : 'grid grid-cols-2 gap-3'}>
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
                    image_url={specialist.cover_image ?? specialist.image_url}
                    services={specialist.services}
                    index={index}
                    viewMode={viewMode}
                    onClick={() => openSpecialist(specialist)}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-2 text-center py-16"
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
          </div>
        )}
      </section>
    </div>
  );
}
