import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Phone, FileText, Upload, Check, ChevronLeft } from 'lucide-react';
import type { Specialist, Service, TimeSlot } from '@/lib/api';
import { createBooking, getTimeSlots } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function slotDateKey(d: string): string {
  return String(d).slice(0, 10);
}

function slotTimeDisplay(t: string): string {
  return String(t).trim().slice(0, 5);
}

interface BookingModalProps {
  specialist: Specialist;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ specialist, onClose, onSuccess }: BookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchedSlots, setFetchedSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState<{
    masterName: string;
    serviceName: string;
    dateLabel: string;
    time: string;
    price: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const services = specialist.services || [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSlotsLoading(true);
      setFetchedSlots([]);
      try {
        const list = await getTimeSlots(specialist.id);
        if (!cancelled) {
          setFetchedSlots(
            list.map((s) => ({
              ...s,
              date: slotDateKey(s.date),
              time: slotTimeDisplay(s.time),
            }))
          );
        }
      } catch {
        if (!cancelled) setFetchedSlots([]);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [specialist.id]);

  const availableSlots =
    fetchedSlots.length > 0
      ? fetchedSlots
      : (specialist.timeSlots || []).map((s) => ({
          ...s,
          date: slotDateKey(s.date),
          time: slotTimeDisplay(s.time),
        }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой (макс 5МБ)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !selectedService || !selectedSlot) return;
    setIsSubmitting(true);

    try {
      await createBooking({
        user_id: user.id,
        specialist_id: specialist.id,
        service_id: selectedService.id,
        date: `${selectedSlot.date}T${selectedSlot.time}`,
      });

      const dateLabel = new Date(`${selectedSlot.date}T12:00:00`).toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      setBookingSuccess({
        masterName: specialist.name,
        serviceName: selectedService.name,
        dateLabel,
        time: selectedSlot.time,
        price: selectedService.price,
      });
    } catch (e) {
      alert('Ошибка при бронировании');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishSuccess = () => {
    setBookingSuccess(null);
    onSuccess();
  };

  const steps = ['Услуга', 'Слот', 'Контакты'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
      onClick={bookingSuccess ? undefined : onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card w-full max-w-lg mx-auto sm:mx-4 sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {bookingSuccess ? (
          <>
            <div className="sticky top-0 bg-card border-b border-border px-4 py-4 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Запись оформлена</h3>
                <button
                  type="button"
                  onClick={handleFinishSuccess}
                  className="p-2 hover:bg-white/10 rounded-full"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 pb-8 space-y-5">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center ring-2 ring-emerald-400/30">
                  <Check className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-center text-base leading-snug">
                Вы успешно записались к мастеру{' '}
                <span className="font-semibold text-white">{bookingSuccess.masterName}</span>
              </p>
              <div className="glass p-4 rounded-xl space-y-3 text-sm">
                <p>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Услуга</span>
                  <span className="font-medium">{bookingSuccess.serviceName}</span>
                </p>
                <p>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Дата и время</span>
                  <span className="font-medium capitalize">
                    {bookingSuccess.dateLabel} в {bookingSuccess.time}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Сумма</span>
                  <span className="font-bold text-accent text-lg">{bookingSuccess.price}₽</span>
                </p>
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Заявка отправлена мастеру. Он увидит её в приложении и сможет подтвердить запись или написать вам в Telegram.
              </p>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border p-4 safe-area-bottom">
              <button
                type="button"
                onClick={handleFinishSuccess}
                className="w-full py-3 bg-accent text-background rounded-xl font-semibold hover:bg-white/90 transition-all"
              >
                Понятно
              </button>
            </div>
          </>
        ) : (
          <>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-4 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="p-2 hover:bg-white/10 rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="font-semibold">Запись к {specialist.name}</h3>
                <div className="flex gap-1 mt-1">
                  {steps.map((s, i) => (
                    <div
                      key={s}
                      className={`h-1 rounded-full transition-all ${
                        i <= step ? 'w-8 bg-accent' : 'w-4 bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-24">
          <AnimatePresence mode="wait">
            {/* Step 0: Select Service */}
            {step === 0 && (
              <motion.div
                key="service-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <h4 className="text-sm text-gray-400 mb-2">Выберите услугу</h4>
                {services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    У мастера пока нет услуг
                  </div>
                ) : (
                  services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        selectedService?.id === service.id
                          ? 'bg-white text-black border-white'
                          : 'bg-card border-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 opacity-60" />
                          <span className={`text-sm ${selectedService?.id === service.id ? 'text-black/60' : 'text-gray-500'}`}>
                            {service.duration} мин
                          </span>
                        </div>
                      </div>
                      <span className={`text-xl font-bold ${selectedService?.id === service.id ? 'text-black' : 'text-accent'}`}>
                        {service.price}₽
                      </span>
                    </button>
                  ))
                )}
              </motion.div>
            )}

            {/* Step 1: Select Time Slot */}
            {step === 1 && (
              <motion.div
                key="slot-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <h4 className="text-sm text-gray-400 mb-2">Выберите дату и время</h4>
                {slotsLoading ? (
                  <div className="text-center py-8 text-gray-500 text-sm animate-pulse">Загрузка слотов…</div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    У мастера пока нет свободных слотов
                  </div>
                ) : (
                  Object.entries(
                    availableSlots.reduce((acc, slot) => {
                      const d = slot.date;
                      if (!acc[d]) acc[d] = [];
                      acc[d].push(slot);
                      return acc;
                    }, {} as Record<string, TimeSlot[]>)
                  ).map(([date, slots]) => (
                    <div key={date}>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        {new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            disabled={slot.isBooked}
                            className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                              selectedSlot?.id === slot.id
                                ? 'bg-accent text-background border-accent'
                                : slot.isBooked
                                  ? 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'
                                  : 'bg-card border-white/[0.06] hover:border-white/20'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <motion.div
                key="contact-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Номер телефона</label>
                  <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (999) 999-99-99"
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Пожелания (необязательно)</label>
                  <div className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3">
                    <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Опишите желаемый результат, уточните детали..."
                      rows={3}
                      className="flex-1 bg-transparent outline-none text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Фото для мастера (необязательно)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl hover:border-white/30 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-400">Прикрепить файлы</span>
                  </button>
                  {attachments.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {attachments.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeAttachment(idx)}
                            className="absolute top-0.5 right-0.5 p-1 bg-black/50 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="glass p-4 rounded-xl space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-400">Услуга:</span>{' '}
                    <span className="font-medium">{selectedService?.name}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">Дата:</span>{' '}
                    <span className="font-medium">
                      {selectedSlot && new Date(selectedSlot.date).toLocaleDateString('ru-RU')} в {selectedSlot?.time}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">Сумма:</span>{' '}
                    <span className="font-bold text-accent">{selectedService?.price}₽</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 safe-area-bottom">
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 0 && !selectedService) ||
                (step === 1 && !selectedSlot)
              }
              className="w-full py-3 bg-accent text-background rounded-xl font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Далее
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-accent text-background rounded-xl font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Создание записи...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Подтвердить запись — {selectedService?.price}₽
                </>
              )}
            </button>
          )}
        </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
