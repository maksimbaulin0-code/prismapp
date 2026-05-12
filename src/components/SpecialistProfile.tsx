import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowLeft, X, Clock, MapPin, Star, Mail } from 'lucide-react';
import type { Specialist, Service } from '@/lib/api';
import { BookingModal } from './BookingModal';
import { telegramContactToOpenUrl } from '@/lib/telegramLinks';

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
  onBookSuccess?: () => void;
}

export function SpecialistProfile({ specialist, onBack, onBookSuccess }: SpecialistProfileProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const services = specialist.services || [];
  const categoryInfo = CATEGORY_MAP[specialist.category] || { label: specialist.category, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' };

  const heroImage =
    specialist.cover_image ||
    specialist.image_url ||
    'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400';

  const coverUrls = new Set(
    [specialist.cover_image, specialist.image_url].filter(Boolean) as string[]
  );
  const portfolioGallery = [
    ...new Set(
      (specialist.portfolio || []).filter((url) => url && !coverUrls.has(url))
    ),
  ];

  const telegramLink = telegramContactToOpenUrl(specialist.telegram);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background z-50 overflow-y-auto"
      >
        {/* Hero Image */}
        <div className="relative h-72 w-full bg-card overflow-hidden">
          <motion.img
            layoutId={`specialist-image-${specialist.id}`}
            src={heroImage}
            alt={specialist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
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
                  <span className="text-sm font-bold text-yellow-400">{specialist.rating || 'Новый'}</span>
                </div>
                {specialist.review_count > 0 && (
                  <span className="text-sm text-gray-400">({specialist.review_count} отзывов)</span>
                )}
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
          <div className="flex items-center gap-2 text-gray-400 mb-3">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-sm">{specialist.location?.trim() || 'Адрес не указан'}</span>
          </div>

          {telegramLink && (
            <a
              href={telegramLink.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                const app = window.Telegram?.WebApp;
                if (app?.openTelegramLink && /^https:\/\/t\.me\//i.test(telegramLink.href)) {
                  e.preventDefault();
                  app.openTelegramLink(telegramLink.href);
                }
              }}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-6 border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:text-white transition-colors"
              aria-label={`Написать в Telegram: ${telegramLink.display}`}
              title={`Написать в Telegram: ${telegramLink.display}`}
            >
              <Mail className="w-5 h-5 shrink-0" strokeWidth={2} />
            </a>
          )}

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
            {services.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm bg-card rounded-xl border border-white/[0.06]">
                У мастера пока нет услуг
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card border-white/[0.06]"
                  >
                    <div>
                      <h4 className="font-semibold text-base">{service.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-sm text-gray-500">{service.duration} мин</span>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-accent">{service.price}₽</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Book Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBooking(true)}
            disabled={services.length === 0}
            className={cn(
              'w-full py-4 rounded-xl font-bold text-base transition-all magnetic-btn',
              services.length > 0
                ? 'bg-accent text-background glow-strong'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            )}
          >
            {services.length > 0 ? 'Записаться' : 'Нет доступных услуг'}
          </motion.button>

          {/* Portfolio */}
          {portfolioGallery.length > 0 && (
            <div className="mt-8 mb-20">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Портфолио</h3>
              <div className="grid grid-cols-2 gap-2">
                {portfolioGallery.map((url, idx) => (
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
          )}
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

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <BookingModal
            specialist={specialist}
            onClose={() => setShowBooking(false)}
            onSuccess={() => {
              setShowBooking(false);
              onBookSuccess?.();
              onBack();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
