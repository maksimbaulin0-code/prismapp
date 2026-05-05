import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CategoryScrollProps {
  categories: CategoryItem[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryScroll({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryScrollProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <motion.div 
        className="flex gap-3 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            layoutId={`category-${category.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 min-w-[72px] p-3 rounded-soft border transition-all duration-200',
              selectedCategory === category.id
                ? 'bg-accent text-background border-accent glow-active'
                : 'bg-card text-gray-400 border-border hover:border-white/20'
            )}
          >
            <div className={cn(
              'p-2 rounded-sharp',
              selectedCategory === category.id ? 'bg-background' : 'bg-card'
            )}>
              {category.icon}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">
              {category.name}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
