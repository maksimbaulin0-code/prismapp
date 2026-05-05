import { useEffect, useState, createContext, useContext } from 'react';
import { supabase, type User } from './supabase';

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
    const stored = localStorage.getItem('telegram_user');
    if (stored) {
      const params = JSON.parse(stored);
      if (params.telegram_id) {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', params.telegram_id)
            .single();
          
          if (data) {
            setUser(data);
          } else {
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                telegram_id: params.telegram_id,
                name: params.name || 'Пользователь',
              })
              .select()
              .single();
            
            if (newUser) {
              setUser(newUser);
              localStorage.setItem('telegram_user', JSON.stringify(newUser));
            }
          }
        } catch (e) {
          console.log('Using offline mode');
        }
      }
    }
    setLoading(false);
  };

  const signIn = async (telegramId: number, name?: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (existingUser) {
        setUser(existingUser);
        localStorage.setItem('telegram_user', JSON.stringify(existingUser));
        return;
      }

      const { data: newUser } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          name: name || 'Пользователь',
        })
        .select()
        .single();

      if (newUser) {
        setUser(newUser);
        localStorage.setItem('telegram_user', JSON.stringify(newUser));
      }
    } catch (e) {
      console.log('Offline mode - user stored locally');
      const offlineUser = {
        id: Date.now(),
        telegram_id: telegramId,
        name: name || 'Пользователь',
        phone: null,
        created_at: new Date().toISOString(),
      };
      setUser(offlineUser);
      localStorage.setItem('telegram_user', JSON.stringify(offlineUser));
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('telegram_user');
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