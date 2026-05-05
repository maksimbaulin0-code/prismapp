import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'prismapp',
  user: process.env.DB_USER || 'maksimbaulin',
  password: process.env.DB_PASSWORD || '',
});

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
  services?: Service[];
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
}

// SQL functions
export const db = {
  async query(text: string, params?: any[]) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (e) {
      console.error('DB Error:', e);
      throw e;
    }
  },

  async getUser(telegramId: number) {
    const result = await this.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    return result.rows[0] || null;
  },

  async createUser(telegramId: number, name: string) {
    const result = await this.query(
      'INSERT INTO users (telegram_id, name) VALUES ($1, $2) RETURNING *',
      [telegramId, name]
    );
    return result.rows[0];
  },

  async getSpecialists(category?: string) {
    let query = 'SELECT * FROM specialists';
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY rating DESC';
    
    const result = await this.query(query, params);
    return result.rows;
  },

  async getSpecialistById(id: number) {
    const result = await this.query('SELECT * FROM specialists WHERE id = $1', [id]);
    const specialist = result.rows[0];
    
    if (specialist) {
      const servicesResult = await this.query(
        'SELECT * FROM services WHERE specialist_id = $1',
        [id]
      );
      specialist.services = servicesResult.rows;
    }
    
    return specialist || null;
  },

  async createBooking(userId: number, specialistId: number, serviceId: number, date: string) {
    const result = await this.query(
      'INSERT INTO bookings (user_id, specialist_id, service_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, specialistId, serviceId, date]
    );
    return result.rows[0];
  },

  async getUserBookings(userId: number) {
    const result = await this.query(
      `SELECT b.*, 
              s.name as specialist_name, s.category, s.location, s.image_url,
              svc.name as service_name, svc.price, svc.duration
       FROM bookings b
       LEFT JOIN specialists s ON b.specialist_id = s.id
       LEFT JOIN services svc ON b.service_id = svc.id
       WHERE b.user_id = $1
       ORDER BY b.date DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      specialist_id: row.specialist_id,
      service_id: row.service_id,
      date: row.date,
      status: row.status,
      created_at: row.created_at,
      specialist: row.specialist_name ? {
        name: row.specialist_name,
        category: row.category,
        location: row.location,
        image_url: row.image_url,
      } : undefined,
      service: row.service_name ? {
        name: row.service_name,
        price: row.price,
        duration: row.duration,
      } : undefined,
    }));
  },
};

export default db;