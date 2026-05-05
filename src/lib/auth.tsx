import { useEffect, useState, createContext, useContext } from 'react';
import { db, type User } from './db';

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
          let existingUser = await db.getUser(params.telegram_id);
          
          if (!existingUser) {
            existingUser = await db.createUser(params.telegram_id, params.name || 'Пользователь');
          }
          
          if (existingUser) {
            setUser(existingUser);
          }
        } catch (e) {
          console.log('Using local user');
          setUser({
            id: Date.now(),
            telegram_id: params.telegram_id,
            name: params.name,
            phone: null,
            created_at: new Date().toISOString(),
          });
        }
      }
    }
    setLoading(false);
  };

  const signIn = async (telegramId: number, name?: string) => {
    try {
      let existingUser = await db.getUser(telegramId);
      
      if (!existingUser) {
        existingUser = await db.createUser(telegramId, name || 'Пользователь');
      }
      
      if (existingUser) {
        setUser(existingUser);
        localStorage.setItem('prism_user', JSON.stringify(existingUser));
      }
    } catch (e) {
      const offlineUser = {
        id: Date.now(),
        telegram_id: telegramId,
        name: name || 'Пользователь',
        phone: null,
        created_at: new Date().toISOString(),
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