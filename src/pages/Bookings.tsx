import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BOOKINGS = [
  {
    id: '1',
    specialistName: 'Ink Master Studio',
    service: 'Small Tattoo',
    date: '15 мая, 14:00',
    status: 'confirmed',
    price: 150,
  },
  {
    id: '2',
    specialistName: 'Luxe Nails Bar',
    service: 'Gel Manicure',
    date: '18 мая, 11:00',
    status: 'pending',
    price: 45,
  },
];

export default function Bookings() {
  const [activeSegment, setActiveSegment] = useState('upcoming');

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
              className={cn(
                'flex-1 py-2 rounded-sharp text-sm font-medium transition-colors',
                activeSegment === segment
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {segment === 'upcoming' ? 'Предстоящие' : 'История'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {BOOKINGS.map((booking) => (
            <motion.div
              key={booking.id}
              className="glass p-4 rounded-soft"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{booking.specialistName}</h3>
                  <p className="text-sm text-gray-400">{booking.service}</p>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 rounded-sharp text-xs font-medium',
                    booking.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  )}
                >
                  {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидает'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {booking.date}
                </div>
                <span className="font-semibold">${booking.price}</span>
              </div>
            </motion.div>
          ))}

          {BOOKINGS.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Нет бронирований</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}