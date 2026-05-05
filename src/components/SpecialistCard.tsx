import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CATEGORY_MAP: Record<string, string> = {
  tattoo: 'Тату',
  nails: 'Ногти',
  piercing: 'Пирсинг',
  makeup: 'Макияж',
  hair: 'Волосы',
  lashes: 'Ресницы',
};

interface SpecialistCardProps {
  id: number;
  name: string;
  category: string;
  rating: number;
  review_count: number;
  location: string | null;
  image_url: string | null;
  bio?: string | null;
  index?: number;
  onClick?: () => void;
}

export function SpecialistCard({
  name,
  category,
  rating,
  review_count,
  location,
  image_url,
  index = 0,
  onClick,
}: SpecialistCardProps) {
  // bio is available but not displayed in card view
  return (
    <motion.div
      layoutId={`card-${name}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-soft bg-card border border-border',
        'cursor-pointer group'
      )}
      onClick={onClick}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image_url || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400'}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-3 left-3 glass px-2 py-1 rounded-sharp text-xs font-medium">
          {CATEGORY_MAP[category] || category}
        </div>

        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-sharp flex items-center gap-1">
          <span className="text-accent">★</span>
          <span className="text-xs font-semibold">{rating}</span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-accent tracking-tight">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{location || 'Москва'}</span>
          <span>•</span>
          <span>{review_count} отзывов</span>
        </div>

        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-soft transition-colors duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}

export function SpecialistCardSkeleton() {
  return (
    <div className="rounded-soft bg-card border border-border overflow-hidden">
      <div className="h-48 w-full skeleton-loader" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 skeleton-loader rounded-sharp" />
        <div className="h-4 w-1/2 skeleton-loader rounded-sharp" />
      </div>
    </div>
  );
}