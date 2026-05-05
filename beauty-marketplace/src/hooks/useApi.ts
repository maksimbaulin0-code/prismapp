import { useState } from 'react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

export interface Specialist {
  id: number;
  user_id: number;
  name: string;
  bio: string;
  category: string;
  rating: number;
  reviews_count: number;
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
  user_id: number;
  specialist_id: number;
  service_id: number;
  appointment_date: string;
  status: string;
  specialist_name: string;
  service_name: string;
  price: number;
}

export interface User {
  id: number;
  telegram_id: string;
  username?: string;
  first_name: string;
  last_name?: string;
  is_pro: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async <T>(endpoint: string, options?: RequestInit): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Specialists
  const getSpecialists = async (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Specialist[]>(`/specialists${query}`);
  };

  const getSpecialistById = async (id: number) => {
    return request<Specialist>(`/specialists/${id}`);
  };

  const getServicesForSpecialist = async (specialistId: number) => {
    return request<Service[]>(`/specialists/${specialistId}/services`);
  };

  const getCategories = async () => {
    return request<string[]>('/categories');
  };

  // Bookings
  const createBooking = async (data: {
    user_id: number;
    specialist_id: number;
    service_id: number;
    appointment_date: string;
  }) => {
    return request<{ id: number; status: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const getUserBookings = async (userId: number) => {
    return request<Booking[]>(`/users/${userId}/bookings`);
  };

  // Users
  const saveUser = async (data: {
    telegram_id: string;
    username?: string;
    first_name: string;
    last_name?: string;
    is_pro: boolean;
  }) => {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return {
    loading,
    error,
    getSpecialists,
    getSpecialistById,
    getServicesForSpecialist,
    getCategories,
    createBooking,
    getUserBookings,
    saveUser,
  };
}
