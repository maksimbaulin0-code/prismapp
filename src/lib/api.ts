const API_URL = 'http://localhost:3001/api';

export interface Specialist {
  id: number;
  name: string;
  category: string;
  bio: string | null;
  rating: number;
  review_count: number;
  location: string | null;
  image_url: string | null;
  services?: Service[];
}

export interface Service {
  id: number;
  specialist_id: number;
  name: string;
  price: number;
  duration: number;
}

export interface User {
  id: number;
  telegram_id: number;
  name: string;
}

export interface Booking {
  id: number;
  user_id: number;
  specialist_id: number;
  service_id: number;
  date: string;
  status: string;
}

export async function getSpecialists(category?: string): Promise<Specialist[]> {
  try {
    const url = category && category !== 'all' 
      ? `${API_URL}/specialists?category=${category}` 
      : `${API_URL}/specialists`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (e) {
    console.log('API not available, showing demo data');
    return getMockSpecialists();
  }
}

export async function getSpecialistById(id: number): Promise<Specialist | null> {
  try {
    const res = await fetch(`${API_URL}/specialists/${id}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (e) {
    const mock = getMockSpecialists();
    return mock.find(s => s.id === id) || null;
  }
}

export async function createUser(telegramId: number, name: string): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: telegramId, name }),
  });
  return await res.json();
}

export async function createBooking(
  userId: number,
  specialistId: number,
  serviceId: number,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        specialist_id: specialistId,
        service_id: serviceId,
        date,
      }),
    });
    await res.json();
    return { success: res.ok };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function getUserBookings(userId: number): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/bookings/${userId}`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

function getMockSpecialists(): Specialist[] {
  return [
    {
      id: 1,
      name: 'Ink Master Studio',
      category: 'tattoo',
      bio: 'Мастера татуировки',
      rating: 4.9,
      review_count: 234,
      location: 'Москва',
      image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400',
      services: [
        { id: 1, specialist_id: 1, name: 'Маленькая тату', price: 150, duration: 60 },
        { id: 2, specialist_id: 1, name: 'Средний размер', price: 350, duration: 180 },
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
      services: [
        { id: 3, specialist_id: 2, name: 'Гель-маникюр', price: 45, duration: 45 },
      ],
    },
    {
      id: 3,
      name: 'Pierce Paradise',
      category: 'piercing',
      bio: 'Пирсинг-студия',
      rating: 4.7,
      review_count: 156,
      location: 'Москва',
      image_url: 'https://images.unsplash.com/photo-1620331313174-9187a5f5a5f8?w=400',
      services: [
        { id: 4, specialist_id: 3, name: 'Прокол мочки', price: 30, duration: 15 },
      ],
    },
  ];
}