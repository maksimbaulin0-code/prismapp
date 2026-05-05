import { db, type Specialist, type Service } from './db';

export async function getSpecialists(category?: string): Promise<Specialist[]> {
  try {
    const specialists = await db.getSpecialists(category);
    return specialists;
  } catch (e) {
    console.log('Using mock data - DB not connected');
    return getMockSpecialists();
  }
}

export async function getSpecialistById(id: number): Promise<Specialist | null> {
  try {
    return await db.getSpecialistById(id);
  } catch (e) {
    const mock = getMockSpecialists();
    return mock.find(s => s.id === id) || null;
  }
}

export async function getServices(specialistId: number): Promise<Service[]> {
  try {
    const specialist = await db.getSpecialistById(specialistId);
    return specialist?.services || [];
  } catch (e) {
    return [];
  }
}

export async function createBooking(
  userId: number,
  specialistId: number,
  serviceId: number,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.createBooking(userId, specialistId, serviceId, date);
    return { success: true };
  } catch (e) {
    console.error('Booking error:', e);
    return { success: false, error: String(e) };
  }
}

export async function getUserBookings(userId: number): Promise<any[]> {
  try {
    return await db.getUserBookings(userId);
  } catch (e) {
    return [];
  }
}

// Mock data fallback
function getMockSpecialists(): Specialist[] {
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