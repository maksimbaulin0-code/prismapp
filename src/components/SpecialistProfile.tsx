import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowLeft, X, Clock, MapPin, Star, Check } from 'lucide-react';
import type { Specialist, Service } from '@/lib/api';

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  tattoo: { label: 'Тату', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  nails: { label: 'Ногти', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  piercing: { label: 'Пирсинг', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  makeup: { label: 'Макияж', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  hair: { label: 'Волосы', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  lashes: { label: 'Ресницы', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
};

interface SpecialistProfileProps {
  specialist: Specialist & { services?: Service[] };
  onBack: () => void;
  onBook: (service: Service) => void;
}

export function SpecialistProfile({ specialist, onBack, onBook }: SpecialistProfileProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [bookedService, setBookedService] = useState<number | null>(null);

  const services = specialist.services || [];
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const categoryInfo = CATEGORY_MAP[specialist.category] || { label: specialist.category, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' };

  // Portfolio images
  const portfolio = [
    specialist.image_url,
    'https://images.unsplash.com/photo-1560707303-4e9803d1ad31?w=400',
    'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400',
    'https://images.unsplash.com/photo-1590246294792-a8b137c4096a?w=400',
  ].filter(Boolean) as string[];

  const handleBook = (service: Service) => {
    setBookedService(service.id);
    setTimeout(() => {
      onBook(service);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      {/* Hero Image */}
      <div className="relative h-72 w-full">
        <motion.div
          layoutId={`specialist-image-${specialist.id}`}
          className="absolute inset-0"
        >
          <img
            src={specialist.image_url || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400'}
            alt={specialist.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="absolute top-4 left-4 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold border backdrop-blur-md',
            categoryInfo.color
          )}
        >
          {categoryInfo.label}
        </motion.div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">{specialist.rating}</span>
              </div>
              <span className="text-sm text-gray-400">({specialist.review_count} отзывов)</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-4 relative z-10">
        {/* Name */}
        <motion.h2
          layoutId={`specialist-name-${specialist.id}`}
          className="text-3xl font-bold mb-2"
        >
          {specialist.name}
        </motion.h2>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-400 mb-6">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{specialist.location || 'Москва'}</span>
        </div>

        {/* Bio */}
        {specialist.bio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-4 rounded-xl mb-6"
          >
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">О мастере</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{specialist.bio}</p>
          </motion.div>
        )}

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Услуги</h3>
          <div className="space-y-2">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setSelectedServiceId(service.id === selectedServiceId ? null : service.id)
                }
                className={cn(
                  'relative p-4 rounded-xl border cursor-pointer transition-all overflow-hidden',
                  selectedServiceId === service.id
                    ? 'bg-white text-black border-white glow-active'
                    : 'bg-card border-white/[0.06] hover:border-white/20'
                )}
              >
                {bookedService === service.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Check className="w-6 h-6 text-green-500" />
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">{service.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      <span className={cn(
                        'text-sm',
                        selectedServiceId === service.id ? 'text-black/60' : 'text-gray-500'
                      )}>
                        {service.duration} мин
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xl font-bold',
                    selectedServiceId === service.id ? 'text-black' : 'text-accent'
                  )}>
                    {service.price}₽
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Book Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selectedService && handleBook(selectedService)}
          disabled={!selectedService}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-base transition-all magnetic-btn',
            selectedService
              ? 'bg-accent text-background glow-strong'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          )}
        >
          {selectedService
            ? `Забронировать — ${selectedService.price}₽`
            : 'Выберите услугу'}
        </motion.button>

        {/* Portfolio */}
        <div className="mt-8 mb-20">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Портфолио</h3>
          <div className="grid grid-cols-2 gap-2">
            {portfolio.map((url, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedImage(url)}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              >
                <img src={url} alt={`portfolio-${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={expandedImage}
              alt="Expanded"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
