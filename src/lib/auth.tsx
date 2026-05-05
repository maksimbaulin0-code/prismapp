import { useEffect, useState, createContext, useContext } from 'react';
import { createUser } from './api';

interface User {
  id: number;
  telegram_id: number;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (telegramId: number, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const stored = localStorage.getItem('prism_user');
    if (stored) {
      const params = JSON.parse(stored);
      if (params.telegram_id) {
        try {
          const newUser = await createUser(params.telegram_id, params.name || 'Пользователь');
          setUser(newUser);
        } catch (e) {
          setUser({
            id: Date.now(),
            telegram_id: params.telegram_id,
            name: params.name,
          });
        }
      }
    }
    setLoading(false);
  };

  const signIn = async (telegramId: number, name?: string) => {
    try {
      const newUser = await createUser(telegramId, name || 'Пользователь');
      setUser(newUser);
      localStorage.setItem('prism_user', JSON.stringify(newUser));
    } catch (e) {
      const offlineUser = {
        id: Date.now(),
        telegram_id: telegramId,
        name: name || 'Пользователь',
      };
      setUser(offlineUser);
      localStorage.setItem('prism_user', JSON.stringify(offlineUser));
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('prism_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}