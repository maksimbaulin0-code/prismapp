import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';

const CATEGORY_MAP: Record<string, { label: string; gradient: string }> = {
  tattoo: { label: 'Тату', gradient: 'from-red-500/20 to-orange-500/20' },
  nails: { label: 'Ногти', gradient: 'from-pink-500/20 to-rose-500/20' },
  piercing: { label: 'Пирсинг', gradient: 'from-cyan-500/20 to-blue-500/20' },
  makeup: { label: 'Макияж', gradient: 'from-purple-500/20 to-pink-500/20' },
  hair: { label: 'Волосы', gradient: 'from-blue-500/20 to-indigo-500/20' },
  lashes: { label: 'Ресницы', gradient: 'from-violet-500/20 to-purple-500/20' },
};

interface SpecialistCardProps {
  id: number;
  name: string;
  category: string;
  rating: number;
  review_count: number;
  location: string | null;
  image_url: string | null;
  index?: number;
  onClick?: () => void;
}

export function SpecialistCard({
  id,
  name,
  category,
  rating,
  review_count,
  location,
  image_url,
  index = 0,
  onClick,
}: SpecialistCardProps) {
  const categoryInfo = CATEGORY_MAP[category] || { label: category, gradient: 'from-gray-500/20 to-gray-600/20' };

  return (
    <motion.div
      layoutId={`specialist-card-${id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        type: 'spring',
        stiffness: 200,
        damping: 25,
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card border border-white/[0.06]',
        'cursor-pointer group card-glow'
      )}
    >
      {/* Image Container */}
      <div className="relative h-52 w-full overflow-hidden">
        <motion.div
          layoutId={`specialist-image-${id}`}
          className="absolute inset-0"
        >
          <img
            src={image_url || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400'}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </motion.div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Category Badge */}
        <div className={cn(
          'absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md',
          'bg-gradient-to-r border border-white/10',
          categoryInfo.gradient
        )}>
          {categoryInfo.label}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold">{rating}</span>
        </div>

        {/* Hover Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-accent text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowUpRight className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <motion.h3
            layoutId={`specialist-name-${id}`}
            className="text-lg font-bold text-white group-hover:text-gradient transition-all"
          >
            {name}
          </motion.h3>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location || 'Москва'}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>{review_count} отзывов</span>
        </div>

        {/* Bottom gradient line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

export function SpecialistCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
      <div className="h-52 w-full skeleton-loader" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-2/3 skeleton-loader rounded-lg" />
        <div className="h-4 w-1/2 skeleton-loader rounded-lg" />
      </div>
    </div>
  );
}
