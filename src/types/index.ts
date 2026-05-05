export type CategoryType = 'tattoo' | 'nails' | 'piercing' | 'makeup' | 'hair' | 'lashes';

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
}