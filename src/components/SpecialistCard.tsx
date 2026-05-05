import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpecialistCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  imageUrl: string;
  index?: number;
  onClick?: () => void;
}

export function SpecialistCard({
  name,
  category,
  rating,
  reviewCount,
  location,
  imageUrl,
  index = 0,
  onClick,
}: SpecialistCardProps) {
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
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 glass px-2 py-1 rounded-sharp text-xs font-medium">
          {category}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-sharp flex items-center gap-1">
          <span className="text-accent">★</span>
          <span className="text-xs font-semibold">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-accent tracking-tight">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{location}</span>
          <span>•</span>
          <span>{reviewCount} reviews</span>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-soft transition-colors duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}

// Skeleton Loader for Specialist Card
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
