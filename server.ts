import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

// Load .env manually if not loaded by tsx
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch {
  // .env not found, use defaults
}

const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'prism',
  user: process.env.DB_USER || 'maksimbaulin',
  password: process.env.DB_PASSWORD || '',
});

app.use(cors());
// Default express.json limit (~100kb) drops specialist payloads with base64 cover/portfolio.
app.use(express.json({ limit: '64mb' }));

app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

// Helper function to execute queries
async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows;
}

async function queryOne(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows[0];
}

async function execute(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}

// API Routes

function dedupeSpecialistsByUser(rows: any[]): any[] {
  const byIdDesc = [...rows].sort((a, b) => Number(b.id) - Number(a.id));
  const seenUser = new Set<number>();
  const out: any[] = [];
  for (const s of byIdDesc) {
    const uid = s.user_id;
    if (uid != null) {
      const u = Number(uid);
      if (seenUser.has(u)) continue;
      seenUser.add(u);
    }
    out.push(s);
  }
  out.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  return out;
}

// Get all specialists
app.get('/api/specialists', async (req, res) => {
  try {
    const category = req.query.category as string;
    let sql = 'SELECT * FROM specialists';
    const params: any[] = [];
    
    if (category && category !== 'all') {
      sql += ' WHERE category = $1';
      params.push(category);
    }
    sql += ' ORDER BY rating DESC';
    
    let specialists = await query(sql, params);
    specialists = dedupeSpecialistsByUser(specialists);
    
    // Add services to each specialist
    for (const specialist of specialists) {
      specialist.services = await query(
        'SELECT * FROM services WHERE specialist_id = $1',
        [specialist.id]
      );
    }
    
    res.json(specialists);
  } catch (error) {
    console.error('Error fetching specialists:', error);
    res.status(500).json({ error: 'Failed to fetch specialists' });
  }
});

// Get specialist by ID
app.get('/api/specialists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const specialist = await queryOne('SELECT * FROM specialists WHERE id = $1', [id]);
    
    if (!specialist) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    specialist.services = await query('SELECT * FROM services WHERE specialist_id = $1', [id]);
    res.json(specialist);
  } catch (error) {
    console.error('Error fetching specialist:', error);
    res.status(500).json({ error: 'Failed to fetch specialist' });
  }
});

// Create or get user
app.post('/api/users', async (req, res) => {
  try {
    const { telegram_id, name } = req.body;
    
    let user = await queryOne('SELECT * FROM users WHERE telegram_id = $1', [telegram_id]);
    
    if (!user) {
      const result = await execute(
        'INSERT INTO users (telegram_id, name) VALUES ($1, $2) RETURNING *',
        [telegram_id, name]
      );
      user = result.rows[0];
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update client display name (users.name), keyed by telegram_id
async function handleUserDisplayNameUpdate(req: express.Request, res: express.Response) {
  try {
    const { telegram_id, name } = req.body;
    if (telegram_id == null || telegram_id === '') {
      return res.status(400).json({ error: 'telegram_id required' });
    }
    const nameTrim = name != null ? String(name).trim() : '';
    if (!nameTrim) {
      return res.status(400).json({ error: 'name required' });
    }

    const result = await execute(
      'UPDATE users SET name = $1 WHERE telegram_id = $2 RETURNING *',
      [nameTrim, telegram_id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

// POST — основной путь (часть хостингов/прокси некорректно прокидывает PATCH)
app.post('/api/users/update-name', handleUserDisplayNameUpdate);
app.patch('/api/users', handleUserDisplayNameUpdate);

// Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { user_id, specialist_id, service_id, date } = req.body;
    
    const result = await execute(
      'INSERT INTO bookings (user_id, specialist_id, service_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, specialist_id, service_id, date]
    );
    
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const bookings = await query(`
      SELECT b.*, 
             s.name as specialist_name, s.category, s.location, s.image_url,
             svc.name as service_name, svc.price, svc.duration
      FROM bookings b
      LEFT JOIN specialists s ON b.specialist_id = s.id
      LEFT JOIN services svc ON b.service_id = svc.id
      WHERE b.user_id = $1
      ORDER BY b.date DESC
    `, [userId]);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get specialist bookings (for specialists to see incoming bookings)
app.get('/api/specialist-bookings/:specialistId', async (req, res) => {
  try {
    const { specialistId } = req.params;
    
    const bookings = await query(`
      SELECT b.*, 
             u.name as user_name, u.telegram_id,
             svc.name as service_name, svc.price, svc.duration
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services svc ON b.service_id = svc.id
      WHERE b.specialist_id = $1
      ORDER BY b.date DESC
    `, [specialistId]);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching specialist bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await execute(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Time slots
app.get('/api/time-slots/:specialistId', async (req, res) => {
  try {
    const { specialistId } = req.params;
    const { date } = req.query;
    
    let sql = 'SELECT * FROM time_slots WHERE specialist_id = $1';
    const params: any[] = [specialistId];
    
    if (date) {
      sql += ' AND date = $2';
      params.push(date);
    }
    
    sql += ' ORDER BY date, time';
    
    const slots = await query(sql, params);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

app.post('/api/time-slots', async (req, res) => {
  try {
    const { specialist_id, date, time } = req.body;
    
    const result = await execute(
      'INSERT INTO time_slots (specialist_id, date, time) VALUES ($1, $2, $3) RETURNING *',
      [specialist_id, date, time]
    );
    
    res.json({ success: true, slot: result.rows[0] });
  } catch (error) {
    console.error('Error creating time slot:', error);
    res.status(500).json({ error: 'Failed to create time slot' });
  }
});

app.delete('/api/time-slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await execute('DELETE FROM time_slots WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({ error: 'Failed to delete time slot' });
  }
});

// Update specialist profile
app.put('/api/specialists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { name, bio, location, image_url, cover_image, telegram, portfolio, services, category } = body;

    const existing = await queryOne('SELECT * FROM specialists WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Specialist not found' });
    }

    const p = (v: unknown): string | null | undefined => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      if (v === '') return null;
      return v as string;
    };

    const nameNext =
      name !== undefined && name !== null && String(name).trim() !== ''
        ? String(name).trim()
        : String(existing.name ?? '').trim() || 'Мастер';
    const bioNext = bio !== undefined ? p(bio) : existing.bio;
    const locNext = location !== undefined ? p(location) : existing.location;

    const img = p(image_url);
    const cov = p(cover_image);
    const imageParam = img ?? cov;
    const coverParam = cov ?? img;
    const imageFinal = imageParam ?? coverParam ?? existing.image_url;
    const coverFinal = coverParam ?? imageParam ?? existing.cover_image;

    const telNext = telegram !== undefined ? (telegram === '' || telegram == null ? null : String(telegram)) : existing.telegram;
    const portNext = Object.prototype.hasOwnProperty.call(body, 'portfolio') ? portfolio : existing.portfolio;
    const catNext = category !== undefined && category !== null && String(category).trim() !== ''
      ? String(category).trim()
      : existing.category;

    const result = await execute(
      `
      UPDATE specialists 
      SET name = $1,
          bio = $2,
          location = $3,
          image_url = $4,
          cover_image = $5,
          telegram = $6,
          portfolio = $7,
          category = $8
      WHERE id = $9
      RETURNING *
    `,
      [nameNext, bioNext, locNext, imageFinal, coverFinal, telNext, portNext, catNext, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Specialist not found' });
    }
    
    if (Object.prototype.hasOwnProperty.call(body, 'services') && Array.isArray(services)) {
      await execute('DELETE FROM services WHERE specialist_id = $1', [id]);
      for (const service of services) {
        await execute(
          'INSERT INTO services (specialist_id, name, price, duration) VALUES ($1, $2, $3, $4)',
          [id, service.name, service.price, service.duration]
        );
      }
    }
    
    res.json({ success: true, specialist: result.rows[0] });
  } catch (error) {
    console.error('Error updating specialist:', error);
    res.status(500).json({ error: 'Failed to update specialist' });
  }
});

// Create specialist profile
app.post('/api/specialists', async (req, res) => {
  try {
    const { name, bio, category, location, image_url, cover_image, telegram, portfolio, services, user_id } = req.body;
    
    const result = await execute(`
      INSERT INTO specialists (name, bio, category, location, image_url, cover_image, telegram, portfolio, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [name, bio, category, location, image_url, cover_image, telegram, portfolio, user_id]);
    
    const specialistId = result.rows[0].id;
    
    // Add services
    if (services) {
      for (const service of services) {
        await execute(
          'INSERT INTO services (specialist_id, name, price, duration) VALUES ($1, $2, $3, $4)',
          [specialistId, service.name, service.price, service.duration]
        );
      }
    }
    
    res.json({ success: true, specialist: result.rows[0] });
  } catch (error) {
    console.error('Error creating specialist:', error);
    res.status(500).json({ error: 'Failed to create specialist' });
  }
});

// Get specialist by user_id
app.get('/api/specialists-by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const specialist = await queryOne(
      'SELECT * FROM specialists WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
      [userId]
    );
    
    if (specialist) {
      specialist.services = await query('SELECT * FROM services WHERE specialist_id = $1', [specialist.id]);
    }
    
    res.json(specialist);
  } catch (error) {
    console.error('Error fetching specialist by user:', error);
    res.status(500).json({ error: 'Failed to fetch specialist' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
