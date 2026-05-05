import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Specialist, Service } from '@/types';

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
      {/* Pinned Header */}
      <div className="sticky top-0 glass border-b border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-sharp transition-colors"
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
          className="w-full py-3 bg-accent text-background rounded-soft font-semibold glow-active"
          onClick={() => selectedService && onBook(specialist.services.find(s => s.id === selectedService)!)}
        >
          Book Now{selectedService ? ` - $${specialist.services.find(s => s.id === selectedService)?.price}` : ''}
        </motion.button>
      </div>

      {/* Profile Image & Info */}
      <div className="px-4 py-6">
        <motion.div
          layoutId={`card-${specialist.name}`}
          className="relative h-64 rounded-soft overflow-hidden mb-4"
        >
          <img
            src={specialist.imageUrl}
            alt={specialist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="glass px-2 py-1 rounded-sharp text-xs font-medium">
                {specialist.category}
              </span>
              <span className="glass px-2 py-1 rounded-sharp flex items-center gap-1 text-xs">
                <span>★</span>
                <span>{specialist.rating}</span>
                <span className="text-gray-400">({specialist.reviewCount})</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">{specialist.location}</p>
          </div>
        </motion.div>

        {/* Bio */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{specialist.bio}</p>
        </div>

        {/* Services List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Services</h2>
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
                  'p-4 rounded-soft border cursor-pointer transition-all',
                  selectedService === service.id
                    ? 'bg-accent text-background border-accent'
                    : 'bg-card border-border hover:border-white/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className={cn('text-xs mt-1', selectedService === service.id ? 'text-background/70' : 'text-gray-400')}>
                      {service.duration} min
                    </p>
                  </div>
                  <span className="font-semibold">${service.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Portfolio</h2>
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
                className="relative aspect-square rounded-soft overflow-hidden cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-xs font-medium text-white">{item.title}</p>
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
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
