import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Specialist, Service } from '@/lib/supabase';

const CATEGORY_MAP: Record<string, string> = {
  tattoo: 'Тату',
  nails: 'Ногти',
  piercing: 'Пирсинг',
  makeup: 'Макияж',
  hair: 'Волосы',
  lashes: 'Ресницы',
};

interface SpecialistProfileProps {
  specialist: Specialist & { services?: Service[] };
  onBack: () => void;
  onBook: (service: Service) => void;
}

export function SpecialistProfile({ specialist, onBack, onBook }: SpecialistProfileProps) {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const services = specialist.services || [];
  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-40 overflow-y-auto pb-24"
    >
      <div className="sticky top-0 glass border-b border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-sharp"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{specialist.name}</h1>
          <div className="w-9" />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-accent text-background rounded-soft font-semibold"
          onClick={() => {
            const svc = services.find((s: Service) => s.id === selectedService);
            if (svc) onBook(svc);
          }}
          disabled={!selectedService}
        >
          Забронировать{selectedServiceData ? ` - ${selectedServiceData.price}₽` : ''}
        </motion.button>
      </div>

      <div className="px-4 py-6">
        <motion.div
          layoutId={`card-${specialist.name}`}
          className="relative h-64 rounded-soft overflow-hidden mb-4"
        >
          <img
            src={specialist.image_url || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400'}
            alt={specialist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="glass px-2 py-1 rounded-sharp text-xs font-medium">
                {CATEGORY_MAP[specialist.category] || specialist.category}
              </span>
              <span className="glass px-2 py-1 rounded-sharp flex items-center gap-1 text-xs">
                <span>★</span>
                <span>{specialist.rating}</span>
                <span className="text-gray-400">({specialist.review_count})</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">{specialist.location || 'Москва'}</p>
          </div>
        </motion.div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">О себе</h2>
          <p className="text-gray-400 text-sm">{specialist.bio || 'Нет описания'}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Услуги</h2>
          <div className="space-y-2">
            {services.map((service) => (
              <motion.div
                key={service.id}
                layoutId={`service-${service.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedService(service.id === selectedService ? null : service.id)}
                className={cn(
                  'p-4 rounded-soft border cursor-pointer',
                  selectedService === service.id
                    ? 'bg-accent text-background border-accent'
                    : 'bg-card border-border hover:border-white/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className={cn('text-xs mt-1', selectedService === service.id ? 'text-background/70' : 'text-gray-400')}>
                      {service.duration} мин
                    </p>
                  </div>
                  <span className="font-semibold">{service.price}₽</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}