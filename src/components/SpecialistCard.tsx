import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Service } from '@/lib/api';

const CATEGORY_MAP: Record<string, { label: string }> = {
  tattoo: { label: 'Тату' },
  nails: { label: 'Ногти' },
  piercing: { label: 'Пирсинг' },
  makeup: { label: 'Макияж' },
  hair: { label: 'Волосы' },
  lashes: { label: 'Ресницы' },
};

interface SpecialistCardProps {
  id: number;
  name: string;
  category: string;
  rating: number;
  review_count: number;
  image_url: string | null;
  services?: Service[];
  index?: number;
  viewMode?: 'compact' | 'wide';
  onClick?: () => void;
}

export function SpecialistCard({
  id,
  name,
  category,
  rating,
  review_count,
  image_url,
  services,
  index = 0,
  viewMode = 'compact',
  onClick,
}: SpecialistCardProps) {
  const categoryLabel = CATEGORY_MAP[category]?.label || category;
  const minPrice = services && services.length > 0
    ? Math.min(...services.map(s => s.price))
    : null;

  const isWide = viewMode === 'wide';
  const thumbSrc =
    image_url ||
    'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400';
  const previewService =
    services && services.length > 0 ? services[0].name : null;

  if (isWide) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: index * 0.04 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className="cursor-pointer group rounded-3xl border border-white/[0.08] bg-card/50 backdrop-blur-sm p-4 sm:p-5 flex gap-5 sm:gap-6 items-center shadow-sm shadow-black/20 hover:border-white/[0.14] hover:bg-card/70 transition-colors min-h-[8.5rem] sm:min-h-[10rem]"
      >
        <div className="relative w-[8.25rem] h-[8.25rem] sm:w-36 sm:h-36 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden ring-1 ring-white/[0.08]">
          <img
            key={`${id}-${thumbSrc.length}`}
            src={thumbSrc}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 sm:gap-2.5 py-1">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug line-clamp-2">
              {name}
            </h3>
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/[0.08]">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-white tabular-nums">
                {rating || '—'}
              </span>
              {review_count > 0 && (
                <span className="text-xs text-gray-500 tabular-nums">
                  ({review_count})
                </span>
              )}
            </div>
          </div>

          <span className="inline-flex self-start px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-accent/15 text-accent border border-accent/20">
            {categoryLabel}
          </span>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base">
            {minPrice !== null ? (
              <span className="font-bold text-accent tabular-nums text-lg sm:text-xl">
                от {minPrice}₽
              </span>
            ) : (
              <span className="text-gray-500 text-base">Цена по запросу</span>
            )}
            {previewService && (
              <span className="text-sm text-gray-500 truncate max-w-full">
                · {previewService}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative rounded-2xl overflow-hidden mb-2 aspect-square">
        <img
          key={`${id}-${thumbSrc.length}`}
          src={thumbSrc}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md shrink-0">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-bold text-white">{rating || 'Новый'}</span>
            {review_count > 0 && (
              <span className="text-[10px] text-gray-300">({review_count})</span>
            )}
          </div>

          <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md shrink-0 flex items-center justify-center">
            <span className="text-[11px] font-medium text-white">{categoryLabel}</span>
          </div>
        </div>
      </div>

      <div className="px-0.5">
        <h3 className="text-sm font-semibold text-white truncate leading-tight">{name}</h3>
        {minPrice !== null ? (
          <p className="text-xs text-gray-400 mt-0.5">от {minPrice}₽</p>
        ) : (
          <p className="text-xs text-gray-500 mt-0.5">Цена по запросу</p>
        )}
      </div>
    </motion.div>
  );
}

export function SpecialistCardSkeleton() {
  return (
    <div>
      <div className="aspect-square rounded-2xl bg-card skeleton-loader" />
      <div className="mt-2 h-4 w-3/4 skeleton-loader rounded" />
      <div className="mt-1 h-3 w-1/2 skeleton-loader rounded" />
    </div>
  );
}
