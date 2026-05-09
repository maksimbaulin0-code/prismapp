import { useState, useEffect, useRef } from 'react';
import { useAuth } from './lib/auth';
import { BottomNav } from './components/BottomNav';
import { ProOnboardingForm, type ProProfileData } from './components/ProOnboardingForm';
import { getProProfile, saveProProfile, createSpecialist, updateSpecialist, getSpecialistByUserId, setStoredUserId, createOrGetUser, portfolioWithoutCoverUrl } from './lib/api';
import { getUserFromTelegramWebApp, isInsideTelegramWebApp } from './lib/telegramWebApp';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Welcome from './pages/Welcome';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            photo_url?: string;
          };
          start_param?: string;
        };
        ready: () => void;
        openTelegramLink?: (url: string) => void;
      };
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [showProOnboarding, setShowProOnboarding] = useState(false);
  const [isProMode, setIsProMode] = useState(false);
  const [proProfile, setProProfile] = useState<ProProfileData | null>(null);
  const [refSpecialistId, setRefSpecialistId] = useState<number | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { user, loading: authLoading, signIn, signedOut, applyServerUser } = useAuth();
  const profileLoadGen = useRef(0);
  /** Увеличивается при любом сохранении профиля из UI; загрузка с сервера не может затереть свежие правки. */
  const proProfileMutationEpoch = useRef(0);

  // Профиль мастера в БД привязан к users.id. Не подписываемся на весь `user` — иначе смена имени в TG
  // перезапускает загрузку и может гонкой затереть только что сохранённое имя салона (specialists.name ≠ users.name).
  useEffect(() => {
    let cancelled = false;
    const gen = ++profileLoadGen.current;

    async function loadProfileFromDB() {
      if (authLoading) return;

      if (!user?.telegram_id && !user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      const epochAtStart = proProfileMutationEpoch.current;
      try {
        const telegramId = user.telegram_id ?? user.id;
        const dbUser = await createOrGetUser(telegramId, user.name || 'Пользователь');

        if (cancelled || gen !== profileLoadGen.current) return;

        if (
          Number(dbUser.id) !== Number(user.id) ||
          Number(dbUser.telegram_id) !== Number(user.telegram_id)
        ) {
          applyServerUser(dbUser);
        }

        const specialist = await getSpecialistByUserId(dbUser.id);
        if (cancelled || gen !== profileLoadGen.current) return;
        if (proProfileMutationEpoch.current !== epochAtStart) return;

        if (specialist) {
          const cover =
            specialist.cover_image || specialist.image_url || '';
          const profileData: ProProfileData = {
            id: specialist.id,
            name: specialist.name,
            bio: specialist.bio || '',
            address: specialist.location || '',
            categories: [specialist.category],
            services: specialist.services?.map(s => ({
              name: s.name,
              price: s.price,
              duration: s.duration,
            })) || [],
            portfolio:
              portfolioWithoutCoverUrl(specialist.portfolio || [], cover) ??
              [],
            coverImage: cover,
            telegram: specialist.telegram || '',
            user_id: specialist.user_id,
          };
          setProProfile(profileData);
          saveProProfile(profileData);
          setIsProMode(true);
        } else {
          const stored = getProProfile();
          if (stored) {
            setProProfile(stored);
            setIsProMode(true);
          }
        }
      } catch (e) {
        console.error('Failed to load profile from DB:', e);
        if (cancelled || gen !== profileLoadGen.current) return;
        if (proProfileMutationEpoch.current !== epochAtStart) return;
        const stored = getProProfile();
        if (stored) {
          setProProfile(stored);
          setIsProMode(true);
        }
      } finally {
        if (!cancelled && gen === profileLoadGen.current) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfileFromDB();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, user?.telegram_id, applyServerUser]);

  // Telegram auth — runs once on mount
  useEffect(() => {
    if (isInsideTelegramWebApp()) {
      window.Telegram!.WebApp.ready();
      const tgUser = getUserFromTelegramWebApp();
      if (tgUser?.id) {
        setStoredUserId(tgUser.id);
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        signIn(tgUser.id, fullName || 'Пользователь');
      }
      // Внутри Telegram не подставляем Dev User — иначе профиль мастера окажется на «левом» users.id
    } else if (!signedOut && !localStorage.getItem('prism_user')) {
      const devUserId = 999999999;
      setStoredUserId(devUserId);
      signIn(devUserId, 'Dev User');
    }
    
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    let refId: number | null = null;
    if (ref) {
      const n = parseInt(ref, 10);
      if (!isNaN(n)) refId = n;
    }
    if (refId == null && isInsideTelegramWebApp()) {
      const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (typeof sp === 'string' && sp.startsWith('ref_')) {
        const n = parseInt(sp.slice(4), 10);
        if (!isNaN(n)) refId = n;
      }
    }
    if (refId != null) setRefSpecialistId(refId);
  }, []);

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Welcome />;
  }

  const handleProComplete = async (data: ProProfileData) => {
    try {
      const profileData = { ...data, user_id: user.id };
      saveProProfile(profileData);

      const specialist = profileData.id
        ? await updateSpecialist(profileData.id, profileData)
        : await createSpecialist(profileData);

      const updatedProfile = { ...profileData, id: specialist.id };
      proProfileMutationEpoch.current += 1;
      setProProfile(updatedProfile);
      saveProProfile(updatedProfile);
    } catch (e) {
      console.error('Failed to save pro profile:', e);
      proProfileMutationEpoch.current += 1;
      saveProProfile(data);
      setProProfile(data);
    }
    setShowProOnboarding(false);
    setIsProMode(true);
  };

  const handleSetProProfile = (profile: ProProfileData | null) => {
    proProfileMutationEpoch.current += 1;
    if (profile) {
      setProProfile(profile);
      saveProProfile(profile);
    } else {
      setProProfile(null);
      saveProProfile(null as any);
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'bookings':
        return <Bookings />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <Home
            isProMode={isProMode}
            proProfile={proProfile}
            onSetProProfile={handleSetProProfile}
            onToggleProMode={() => setIsProMode((prev) => !prev)}
            onShowProOnboarding={() => setShowProOnboarding(true)}
            refSpecialistId={refSpecialistId}
            onRefSpecialistUsed={() => setRefSpecialistId(null)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="min-h-screen pb-20">
        {renderPage()}
      </div>
      {!showProOnboarding && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      {showProOnboarding && (
        <ProOnboardingForm
          initialData={proProfile}
          onComplete={handleProComplete}
          onCancel={() => setShowProOnboarding(false)}
        />
      )}
    </div>
  );
}
