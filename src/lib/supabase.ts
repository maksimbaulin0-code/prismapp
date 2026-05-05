import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eocunpyahrckxihrseir.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY3VucHlhaHJja3hpaHJzZWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzM0MzAsImV4cCI6MjA5MzU0OTQzMH0.oAI3U7bIGsVAlEJkjld_ZXMb7wnsF9ncpafp7n4fO1o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: number;
  telegram_id: number;
  name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Specialist {
  id: number;
  name: string;
  category: string;
  bio: string | null;
  rating: number;
  review_count: number;
  location: string | null;
  image_url: string | null;
  user_id: number | null;
  created_at: string;
}

export interface Service {
  id: number;
  specialist_id: number;
  name: string;
  price: number;
  duration: number;
}

export interface Booking {
  id: number;
  user_id: number | null;
  specialist_id: number | null;
  service_id: number | null;
  date: string;
  status: string;
  created_at: string;
  specialist?: Specialist;
  service?: Service;
  user?: User;
}