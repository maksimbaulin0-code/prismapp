import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowLeft, X } from 'lucide-react';
import type { Specialist, Service } from '@/lib/api';

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
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const services = specialist.services || [];
  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Mock portfolio images if none provided
  const portfolio = (specialist as any).portfolio || [
    specialist.image_url,
    'https://images.unsplash.com/photo-1560707303-4e9803d1ad31?w=400',
    'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400',
    'https://images.unsplash.com/photo-1590246294792-a8b137c4096a?w=400',
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      {/* Pinned Header */}
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-sharp transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold truncate px-2">{specialist.name}</h1>
          <div className="w-9" />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-accent text-background rounded-soft font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            if (selectedService) onBook(selectedService);
          }}
          disabled={!selectedService}
        >
          {selectedService
            ? `Забронировать — ${selectedService.price}₽`
            : 'Выберите услугу'}
        </motion.button>
      </div>

      <div className="px-4 py-6">
        {/* Hero Image */}
        <motion.div
          layoutId={`specialist-image-${specialist.id}`}
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

        {/* Name (shared layout) */}
        <motion.h2
          layoutId={`specialist-name-${specialist.id}`}
          className="text-2xl font-bold mb-2"
        >
          {specialist.name}
        </motion.h2>

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">О себе</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{specialist.bio || 'Нет описания'}</p>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Услуги</h3>
          <div className="space-y-2">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  setSelectedServiceId(service.id === selectedServiceId ? null : service.id)
                }
                className={cn(
                  'p-4 rounded-soft border cursor-pointer transition-all',
                  selectedServiceId === service.id
                    ? 'bg-accent text-background border-accent glow-active'
                    : 'bg-card border-border hover:border-white/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        selectedServiceId === service.id
                          ? 'text-background/70'
                          : 'text-gray-400'
                      )}
                    >
                      {service.duration} мин
                    </p>
                  </div>
                  <span className="font-semibold text-lg">{service.price}₽</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Портфолио</h3>
          <div className="grid grid-cols-2 gap-2">
            {portfolio.map((url: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedImage(url)}
                className="relative aspect-square rounded-soft overflow-hidden cursor-pointer"
              >
                <img src={url} alt={`portfolio-${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-xs font-medium text-white">Работа {idx + 1}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={expandedImage}
              alt="Expanded"
              className="max-w-full max-h-[80vh] object-contain rounded-soft"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 p-2 glass rounded-sharp"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
