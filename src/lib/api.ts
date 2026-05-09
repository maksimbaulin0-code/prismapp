import { shrinkProProfileImagesForApi } from './imageCompress';

const API_URL = '/api';

export interface Specialist {
  id: number;
  name: string;
  category: string;
  bio: string | null;
  rating: number;
  review_count: number;
  location: string | null;
  image_url: string | null;
  cover_image?: string | null;
  portfolio?: string[];
  services?: Service[];
  timeSlots?: TimeSlot[];
  telegram?: string;
  user_id?: number;
}

export interface Service {
  id: number;
  specialist_id: number;
  name: string;
  price: number;
  duration: number;
}

export interface TimeSlot {
  id: number;
  specialist_id: number;
  date: string;
  time: string;
  isBooked?: boolean;
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
  slot_id?: number;
  date: string;
  status: string;
  phone?: string;
  notes?: string;
  attachments?: string[];
  specialist_name?: string;
  service_name?: string;
  price?: number;
  duration?: number;
  user_name?: string;
}

export interface ProProfileData {
  id?: number;
  name: string;
  bio: string;
  address?: string;
  categories: string[];
  services: { name: string; price: number; duration: number }[];
  portfolio: string[];
  coverImage?: string;
  telegram?: string;
  user_id?: number;
}

const PRO_PROFILE_KEY = 'prism_pro_profile';
const USER_ID_KEY = 'prism_user_id';

export function setStoredUserId(id: number) {
  localStorage.setItem(USER_ID_KEY, id.toString());
}

export function getStoredProProfile(): ProProfileData | null {
  try {
    const stored = localStorage.getItem(PRO_PROFILE_KEY);
    if (!stored || stored === 'null') return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setStoredProProfile(data: ProProfileData | null) {
  try {
    if (data) {
      localStorage.setItem(PRO_PROFILE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(PRO_PROFILE_KEY);
    }
  } catch (e) {
    console.warn('prism_pro_profile: не удалось записать в localStorage (часто лимит 5MB с base64)', e);
  }
}

/** Убирает из портфолио тот же URL, что и обложка (обложка хранится отдельно). */
export function portfolioWithoutCoverUrl(
  portfolio: string[] | undefined,
  coverUrl: string | null | undefined
): string[] | undefined {
  if (!portfolio?.length) return portfolio;
  const c = typeof coverUrl === 'string' ? coverUrl.trim() : '';
  if (!c) return portfolio;
  return portfolio.filter((p) => typeof p === 'string' && p.trim() !== c);
}

function unwrapSpecialistResponse(raw: unknown): Specialist {
  if (
    raw &&
    typeof raw === 'object' &&
    'specialist' in raw &&
    (raw as { specialist?: Specialist }).specialist
  ) {
    return (raw as { specialist: Specialist }).specialist;
  }
  return raw as Specialist;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    cache: options?.cache ?? 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const hint = await res.text().catch(() => '');
    let msg: string;
    if (res.status === 413) {
      msg =
        '413: запрос слишком большой. Часто лимит у nginx/ngrok. Фото сжимаются перед отправкой — попробуйте ещё раз или уменьшите файл.';
    } else if (res.status === 404) {
      msg = `404: не найдено${hint ? ` — ${hint.slice(0, 120)}` : ''}`;
    } else if (res.status === 502 || res.status === 503 || res.status === 0) {
      msg = `${res.status || 'Сеть'}: сервер API недоступен. Запустите бэкенд: npm run dev:server (порт 3001).`;
    } else {
      msg = `Ошибка ${res.status}${hint ? ` — ${hint.slice(0, 200)}` : ''}`;
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function createOrGetUser(telegramId: number, name: string): Promise<User> {
  return fetchApi<User>('/users', {
    method: 'POST',
    body: JSON.stringify({ telegram_id: telegramId, name }),
  });
}

/** Сохраняет отображаемое имя клиента в БД (вкладка «Профиль»). */
export async function updateUserDisplayName(telegramId: number, name: string): Promise<User> {
  const trimmed = String(name).trim();
  return fetchApi<User>('/users/update-name', {
    method: 'POST',
    body: JSON.stringify({ telegram_id: telegramId, name: trimmed }),
  });
}

export async function getSpecialists(category?: string): Promise<Specialist[]> {
  const url = category && category !== 'all' 
    ? `/specialists?category=${category}` 
    : '/specialists';
  return fetchApi<Specialist[]>(url);
}

export async function getSpecialistById(id: number): Promise<Specialist | null> {
  try {
    return await fetchApi<Specialist>(`/specialists/${id}`);
  } catch {
    return null;
  }
}

export async function getSpecialistByUserId(userId: number): Promise<Specialist | null> {
  try {
    return await fetchApi<Specialist>(`/specialists-by-user/${userId}`);
  } catch {
    return null;
  }
}

export async function createSpecialist(data: ProProfileData): Promise<Specialist> {
  const shrunk = await shrinkProProfileImagesForApi(data);
  const coverStr =
    typeof shrunk.coverImage === 'string' && shrunk.coverImage.trim()
      ? shrunk.coverImage.trim()
      : null;
  const raw = await fetchApi<unknown>('/specialists', {
    method: 'POST',
    body: JSON.stringify({
      name: shrunk.name,
      bio: shrunk.bio,
      category: shrunk.categories?.[0] || 'other',
      location: shrunk.address,
      image_url: shrunk.coverImage || shrunk.portfolio?.[0] || null,
      cover_image: shrunk.coverImage,
      portfolio: portfolioWithoutCoverUrl(shrunk.portfolio, coverStr),
      services: shrunk.services,
      telegram: shrunk.telegram,
      user_id: shrunk.user_id,
    }),
  });

  const specialist = unwrapSpecialistResponse(raw);

  setStoredProProfile({
    ...data,
    id: specialist.id,
    portfolio: specialist.portfolio ?? data.portfolio,
  });

  return specialist;
}

export async function updateSpecialist(id: number, data: Partial<ProProfileData>): Promise<Specialist> {
  const stored = getStoredProProfile();
  const merged: Partial<ProProfileData> = stored ? { ...stored, ...data } : { ...data };
  const shrunk = await shrinkProProfileImagesForApi(merged);
  const cover =
    typeof shrunk.coverImage === 'string' && shrunk.coverImage.trim()
      ? shrunk.coverImage.trim()
      : null;
  const thumb = cover || shrunk.portfolio?.[0] || null;

  const nameStr = String(shrunk.name ?? merged.name ?? stored?.name ?? '').trim();
  if (!nameStr) {
    throw new Error('Не задано имя профиля (name) для сохранения');
  }

  const putBody: Record<string, unknown> = {
    name: nameStr,
    bio: shrunk.bio ?? merged.bio ?? null,
    location: shrunk.address ?? merged.address ?? null,
    image_url: thumb,
    cover_image: cover ?? thumb,
    telegram: shrunk.telegram ?? merged.telegram ?? null,
    category: shrunk.categories?.[0] ?? merged.categories?.[0] ?? null,
  };
  const port = shrunk.portfolio ?? merged.portfolio;
  if (port !== undefined) {
    putBody.portfolio = portfolioWithoutCoverUrl(port, cover ?? thumb) ?? port;
  }
  const svcs = shrunk.services ?? merged.services;
  if (svcs !== undefined) putBody.services = svcs;

  const raw = await fetchApi<unknown>(`/specialists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(putBody),
  });

  const specialist = unwrapSpecialistResponse(raw);

  if (stored) {
    setStoredProProfile({
      ...stored,
      ...data,
      id: specialist.id,
      name: specialist.name,
      bio: specialist.bio ?? stored.bio,
      address: specialist.location ?? stored.address,
      coverImage: specialist.cover_image || specialist.image_url || stored.coverImage,
      portfolio: specialist.portfolio ?? stored.portfolio,
    });
  } else {
    const d = data as ProProfileData;
    setStoredProProfile({
      ...d,
      id: specialist.id,
      name: specialist.name,
      bio: specialist.bio ?? d.bio,
      address: specialist.location ?? d.address,
      coverImage: specialist.cover_image || specialist.image_url || d.coverImage,
      portfolio: specialist.portfolio ?? d.portfolio,
    });
  }

  return specialist;
}

export async function createBooking(booking: {
  user_id: number;
  specialist_id: number;
  service_id: number;
  date: string;
}): Promise<{ success: boolean; booking: Booking }> {
  return fetchApi<{ success: boolean; booking: Booking }>('/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
}

export async function getUserBookings(userId: number): Promise<Booking[]> {
  return fetchApi<Booking[]>(`/bookings/${userId}`);
}

export async function getSpecialistBookings(specialistId: number): Promise<Booking[]> {
  return fetchApi<Booking[]>(`/specialist-bookings/${specialistId}`);
}

export async function updateBookingStatus(bookingId: number, status: string): Promise<Booking> {
  return fetchApi<Booking>(`/bookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getTimeSlots(specialistId: number, date?: string): Promise<TimeSlot[]> {
  const url = date 
    ? `/time-slots/${specialistId}?date=${date}` 
    : `/time-slots/${specialistId}`;
  return fetchApi<TimeSlot[]>(url);
}

export async function addTimeSlot(slot: {
  specialist_id: number;
  date: string;
  time: string;
}): Promise<TimeSlot> {
  return fetchApi<TimeSlot>('/time-slots', {
    method: 'POST',
    body: JSON.stringify(slot),
  });
}

export async function deleteTimeSlot(slotId: number): Promise<void> {
  await fetchApi<void>(`/time-slots/${slotId}`, {
    method: 'DELETE',
  });
}

export function saveProProfile(data: ProProfileData) {
  setStoredProProfile(data);
}

export function getProProfile(): ProProfileData | null {
  return getStoredProProfile();
}
