import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { createOrGetUser, updateUserDisplayName } from './api';

export interface User {
  id: number;
  telegram_id: number;
  name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (telegramId: number, name?: string) => Promise<void>;
  signOut: () => void;
  updateUserName: (name: string) => Promise<void>;
  /** Подставить users.id / telegram_id с сервера (после createOrGetUser), не теряя avatar_url */
  applyServerUser: (dbUser: { id: number; telegram_id: number; name: string }) => void;
  signedOut: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(() => {
    return !!localStorage.getItem('prism_signed_out');
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const stored = localStorage.getItem('prism_user');
    if (stored) {
      try {
        const params = JSON.parse(stored);
        // `id` must stay users.id from the API (FK for specialists.user_id). Never replace with telegram_id.
        const fixedUser = {
          ...params,
          telegram_id: params.telegram_id ?? params.id,
        };
        if (fixedUser.telegram_id) {
          setUser(fixedUser as User);
        }
      } catch {
        localStorage.removeItem('prism_user');
      }
    }
    setLoading(false);
  };

  // After restore from localStorage, id may be wrong (legacy bug). Reconcile with DB users.id.
  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const telegramId = user.telegram_id ?? user.id;
        const dbUser = await createOrGetUser(telegramId, user.name || 'Пользователь');
        if (cancelled) return;
        if (
          Number(dbUser.id) !== Number(user.id) ||
          Number(dbUser.telegram_id) !== Number(user.telegram_id)
        ) {
          const updated = { ...user, id: dbUser.id, telegram_id: dbUser.telegram_id, name: dbUser.name };
          setUser(updated);
          localStorage.setItem('prism_user', JSON.stringify(updated));
        }
      } catch {
        /* offline — keep session as-is */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user?.id, user?.telegram_id]);

  const signIn = async (telegramId: number, name?: string) => {
    localStorage.removeItem('prism_signed_out');
    setSignedOut(false);

    let avatar_url = undefined;
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      if (tgUser.photo_url) {
        avatar_url = tgUser.photo_url;
      }
    }

    try {
      const newUser = await createOrGetUser(telegramId, name || 'Пользователь');
      const userWithAvatar = { ...newUser, avatar_url };
      setUser(userWithAvatar);
      localStorage.setItem('prism_user', JSON.stringify(userWithAvatar));
    } catch (e) {
      const offlineUser = {
        id: telegramId,
        telegram_id: telegramId,
        name: name || 'Пользователь',
        avatar_url,
      };
      setUser(offlineUser);
      localStorage.setItem('prism_user', JSON.stringify(offlineUser));
    }
  };

  const signOut = () => {
    localStorage.removeItem('prism_user');
    localStorage.removeItem('prism_pro_profile');
    localStorage.removeItem('prism_user_id');
    localStorage.removeItem('prism_time_slots');
    localStorage.removeItem('prism_bookings');
    localStorage.removeItem('prism_reviews');
    localStorage.removeItem('prism_user_specialists');
    localStorage.setItem('prism_signed_out', 'true');
    setSignedOut(true);
    setUser(null);
  };

  const updateUserName = useCallback(async (name: string) => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const telegramId = Number(user.telegram_id ?? user.id);
    const prev = user;
    const optimistic: User = { ...user, name: trimmed };
    setUser(optimistic);
    localStorage.setItem('prism_user', JSON.stringify(optimistic));
    try {
      const saved = await updateUserDisplayName(telegramId, trimmed);
      const next: User = {
        ...user,
        id: saved.id,
        telegram_id: saved.telegram_id,
        name: saved.name,
        avatar_url: user.avatar_url,
      };
      setUser(next);
      localStorage.setItem('prism_user', JSON.stringify(next));
    } catch (e) {
      setUser(prev);
      localStorage.setItem('prism_user', JSON.stringify(prev));
      throw e;
    }
  }, [user]);

  const applyServerUser = useCallback((dbUser: { id: number; telegram_id: number; name: string }) => {
    setUser((prev) => {
      const next: User = {
        id: dbUser.id,
        telegram_id: dbUser.telegram_id,
        name: dbUser.name,
        avatar_url: prev?.avatar_url,
      };
      localStorage.setItem('prism_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, updateUserName, applyServerUser, signedOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
