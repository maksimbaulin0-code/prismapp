import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Specialist, Service } from '@/types';
import { ChevronLeft, X, Star, MapPin, Clock } from 'lucide-react';

interface SpecialistProfileProps {
  specialist: Specialist;
  onBack: () => void;
  onBook: (service: Service) => void;
}

export function SpecialistProfile({ specialist, onBack, onBook }: SpecialistProfileProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-40 overflow-y-auto pb-24"
    >
      {/* Pinned Header - Vercel-style */}
      <div className="sticky top-0 glass-strong border-b border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-sharp transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">{specialist.name}</h1>
          <div className="w-9" />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-accent text-background rounded-soft font-semibold glow-active text-sm"
          onClick={() => selectedService && onBook(specialist.services.find(s => s.id === selectedService)!)}
        >
          Book Now{selectedService ? ` — $${specialist.services.find(s => s.id === selectedService)?.price}` : ''}
        </motion.button>
      </div>

      {/* Profile Image & Info */}
      <div className="px-4 py-6">
        <motion.div
          layoutId={`card-${specialist.name}`}
          className="relative h-56 rounded-soft overflow-hidden mb-4 border border-border"
        >
          <img
            src={specialist.imageUrl}
            alt={specialist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="glass px-2 py-1 rounded-sharp text-[10px] font-medium uppercase tracking-wider">
                {specialist.category}
              </span>
              <span className="glass px-2 py-1 rounded-sharp flex items-center gap-1 text-[10px]">
                <Star className="w-3 h-3 fill-current" />
                <span>{specialist.rating}</span>
                <span className="text-accent-secondary">({specialist.reviewCount})</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-accent-secondary">
              <MapPin className="w-3 h-3" />
              <p>{specialist.location}</p>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-accent-secondary uppercase tracking-wider mb-2">About</h2>
          <p className="text-sm text-accent-secondary leading-relaxed">{specialist.bio}</p>
        </div>

        {/* Services List */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-accent-secondary uppercase tracking-wider mb-3">Services</h2>
          <div className="space-y-2">
            {specialist.services.map((service) => (
              <motion.div
                key={service.id}
                layoutId={`service-${service.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedService(service.id === selectedService ? null : service.id)}
                className={cn(
                  'p-3 rounded-soft border cursor-pointer transition-all duration-200',
                  selectedService === service.id
                    ? 'bg-accent text-background border-accent'
                    : 'bg-card border-border hover:border-border-hover'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{service.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn('text-xs flex items-center gap-1', selectedService === service.id ? 'text-background/70' : 'text-accent-secondary')}>
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">${service.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-accent-secondary uppercase tracking-wider mb-3">Portfolio</h2>
          <div className="grid grid-cols-2 gap-2">
            {specialist.portfolio.map((item, index) => (
              <motion.div
                key={item.id}
                layoutId={`portfolio-${item.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setExpandedImage(item.imageUrl)}
                className="relative aspect-square rounded-soft overflow-hidden cursor-pointer border border-border"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-[10px] font-medium">{item.title}</p>
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
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.img
              layoutId={`portfolio-${expandedImage}`}
              src={expandedImage}
              alt="Expanded"
              className="max-w-full max-h-full object-contain rounded-soft"
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
