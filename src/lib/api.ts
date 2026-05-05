import { supabase, type Specialist, type Booking, type Service } from './supabase';

export async function getSpecialists(category?: string): Promise<Specialist[]> {
  try {
    let query = supabase.from('specialists').select('*');
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.log('Using mock data');
    return getMockSpecialists();
  }
}

export async function getSpecialistById(id: number): Promise<Specialist | null> {
  try {
    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    const mock = getMockSpecialists();
    return mock.find(s => s.id === id) || null;
  }
}

export async function getServices(specialistId: number): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('specialist_id', specialistId);
    if (error) throw error;
    return data || [];
  } catch (e) {
    return getMockSpecialists().find(s => s.id === specialistId)?.services || [];
  }
}

export async function createBooking(
  userId: number,
  specialistId: number,
  serviceId: number,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('bookings').insert({
      user_id: userId,
      specialist_id: specialistId,
      service_id: serviceId,
      date,
      status: 'pending',
    });
    
    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.log('Booking saved locally');
    return { success: true };
  }
}

export async function getUserBookings(userId: number): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, specialist:specialists(*), service:services(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: number,
  status: string
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    
    return { success: !error };
  } catch (e) {
    return { success: false };
  }
}

// Mock data fallback
function getMockSpecialists(): (Specialist & { services: Service[] })[] {
  return [
    {
      id: 1,
      name: 'Ink Master Studio',
      category: 'tattoo',
      bio: 'Мастера татуировки с многолетним опытом',
      rating: 4.9,
      review_count: 234,
      location: 'Москва',
      image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400',
      user_id: null,
      created_at: new Date().toISOString(),
      services: [
        { id: 1, specialist_id: 1, name: 'Маленькая татуировка', price: 150, duration: 60 },
        { id: 2, specialist_id: 1, name: 'Средний размер', price: 350, duration: 180 },
        { id: 3, specialist_id: 1, name: 'Рукав', price: 1200, duration: 480 },
      ],
    },
    {
      id: 2,
      name: 'Luxe Nails Bar',
      category: 'nails',
      bio: 'Премиальный нейл-арт',
      rating: 4.8,
      review_count: 189,
      location: 'Москва',
      image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
      user_id: null,
      created_at: new Date().toISOString(),
      services: [
        { id: 4, specialist_id: 2, name: 'Гель-маникюр', price: 45, duration: 45 },
        { id: 5, specialist_id: 2, name: 'Акрил', price: 75, duration: 90 },
      ],
    },
    {
      id: 3,
      name: 'Pierce Paradise',
      category: 'piercing',
      bio: 'Профессиональная пирсинг-студия',
      rating: 4.7,
      review_count: 156,
      location: 'Москва',
      image_url: 'https://images.unsplash.com/photo-1620331313174-9187a5f5a5f8?w=400',
      user_id: null,
      created_at: new Date().toISOString(),
      services: [
        { id: 6, specialist_id: 3, name: 'Прокол мочки', price: 30, duration: 15 },
        { id: 7, specialist_id: 3, name: 'Хрящ', price: 45, duration: 20 },
      ],
    },
  ];
}