export interface Specialist {
  id: string;
  name: string;
  category: CategoryType;
  rating: number;
  reviewCount: number;
  location: string;
  imageUrl: string;
  bio: string;
  services: Service[];
  portfolio: PortfolioItem[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
}

export type CategoryType = 'tattoo' | 'nails' | 'piercing' | 'makeup' | 'hair' | 'lashes';

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  isPro: boolean;
  avatarUrl?: string;
}

export interface ProProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  categories: CategoryType[];
  services: Service[];
  portfolio: PortfolioItem[];
  isVerified: boolean;
}
