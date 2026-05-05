import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { getUserBookings } from '../lib/api';
import { Booking } from '../lib/db';

interface BookingsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Bookings({ activeTab, onTabChange }: BookingsProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState('upcoming');

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const data = await getUserBookings(user.id);
    setBookings(data);
    setIsLoading(false);
  };

  const upcomingBookings = bookings.filter(b => new Date(b.date) > new Date());
  const historyBookings = bookings.filter(b => new Date(b.date) <= new Date());
  const displayBookings = activeSegment === 'upcoming' ? upcomingBookings : historyBookings;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 glass border-b border-border px-4 py-4 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Бронирования</h1>
      </header>

      <div className="p-4">
        <div className="flex gap-2 mb-6 bg-card rounded-soft p-1">
          {['upcoming', 'history'].map((segment) => (
            <button
              key={segment}
              onClick={() => setActiveSegment(segment)}
              className={`flex-1 py-2 rounded-sharp text-sm font-medium transition-colors ${
                activeSegment === segment
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {segment === 'upcoming' ? 'Предстоящие' : 'История'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-4 rounded-soft animate-pulse">
                <div className="h-5 w-1/2 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : displayBookings.length > 0 ? (
          <div className="space-y-4">
            {displayBookings.map((booking) => (
              <motion.div
                key={booking.id}
                className="glass p-4 rounded-soft"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{booking.specialist?.name || 'Мастер'}</h3>
                    <p className="text-sm text-gray-400">{booking.service?.name || 'Услуга'}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-sharp text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : booking.status === 'completed'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {booking.status === 'confirmed' ? 'Подтверждено' : 
                     booking.status === 'completed' ? 'Завершено' : 'Ожидает'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(booking.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <span className="font-semibold">{booking.service?.price || 0}₽</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {activeSegment === 'upcoming' 
                ? 'У вас пока нет бронирований' 
                : 'Нет завершённых бронирований'}
            </p>
            <button
              onClick={() => onTabChange('search')}
              className="mt-4 px-4 py-2 bg-accent text-background rounded-soft text-sm"
            >
              Записаться к мастеру
            </button>
          </div>
        )}
      </div>

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