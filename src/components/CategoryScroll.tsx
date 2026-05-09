import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryItem {
  id: string;
  name: string;
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
    <div className="w-full overflow-x-auto scrollbar-hide py-3">
      <div className="flex gap-2 px-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              selectedCategory === category.id
                ? 'bg-white text-black'
                : 'bg-card text-gray-400 border border-white/[0.08] hover:border-white/20 hover:text-gray-200'
            )}
          >
            {category.name}
            {selectedCategory === category.id && (
              <motion.div
                layoutId="active-category"
                className="absolute inset-0 bg-white rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
