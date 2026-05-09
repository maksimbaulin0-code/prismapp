import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { getUserBookings } from '../lib/api';
import { Calendar, Clock, FileText, X, Paperclip, Trash2 } from 'lucide-react';
import { updateBookingStatus } from '../lib/api';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    const data = await getUserBookings(user.id);
    setBookings(data);
    setIsLoading(false);
  };

  const upcomingBookings = bookings.filter((b) => new Date(b.date) > new Date());
  const historyBookings = bookings.filter((b) => new Date(b.date) <= new Date());
  const displayBookings = activeSegment === 'upcoming' ? upcomingBookings : historyBookings;

  const statusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return 'Ожидает';
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-gray-500/20 text-gray-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
                <div className="h-5 w-1/2 bg-gray-700 rounded mb-2" />
                <div className="h-4 w-1/3 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : displayBookings.length > 0 ? (
          <div className="space-y-4">
            {displayBookings.map((booking: any) => (
              <motion.button
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedBooking(booking)}
                className="w-full text-left glass p-4 rounded-soft hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{booking.specialist_name || 'Мастер'}</h3>
                    <p className="text-sm text-gray-400">{booking.service_name || 'Услуга'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-sharp text-xs font-medium ${statusStyle(booking.status)}`}>
                    {statusLabel(booking.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                    })}
                    <Clock className="w-4 h-4 ml-2" />
                    {new Date(booking.date).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <span className="font-semibold">{booking.price || 0}₽</span>
                </div>
                {booking.attachments?.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Paperclip className="w-3 h-3" />
                    {booking.attachments.length} файл(ов)
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {activeSegment === 'upcoming'
                ? 'У вас пока нет бронирований'
                : 'Нет завершённых бронирований'}
            </p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full max-w-md mx-4 mb-20 sm:mb-4 rounded-2xl p-6 border border-border max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Детали записи</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Мастер</p>
                  <p className="font-semibold">{selectedBooking.specialist_name || 'Мастер'}</p>
                </div>

                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Услуга</p>
                  <p className="font-semibold">{selectedBooking.service_name || 'Услуга'}</p>
                  <p className="text-accent font-bold mt-1">{selectedBooking.price || 0}₽</p>
                </div>

                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Дата и время</p>
                  <p className="font-semibold">
                    {new Date(selectedBooking.date).toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-gray-400">
                    {new Date(selectedBooking.date).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Phone removed from booking details */}

                {selectedBooking.notes && (
                  <div className="glass p-4 rounded-xl flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Пожелания</p>
                      <p className="text-sm mt-1">{selectedBooking.notes}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.attachments?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Прикреплённые файлы</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedBooking.attachments.map((url: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusStyle(selectedBooking.status)}`}>
                  {statusLabel(selectedBooking.status)}
                </div>

                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'cancelled');
                      loadBookings();
                      setSelectedBooking(null);
                    }}
                    className="w-full mt-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Отменить запись
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
