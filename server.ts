import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const db = new Database('prismapp.db');

app.use(cors());
app.use(express.json());

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specialists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  bio TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  location TEXT,
  image_url TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  specialist_id INTEGER REFERENCES specialists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  specialist_id INTEGER REFERENCES specialists(id),
  service_id INTEGER REFERENCES services(id),
  date TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed data
const count = db.prepare('SELECT COUNT(*) as cnt FROM specialists').get() as { cnt: number };
if (count.cnt === 0) {
  db.exec(`
    INSERT INTO specialists (name, category, bio, rating, review_count, location, image_url) VALUES
    ('Ink Master Studio', 'tattoo', 'Мастера татуировки с многолетним опытом', 4.9, 234, 'Москва', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400'),
    ('Luxe Nails Bar', 'nails', 'Премиальный нейл-арт', 4.8, 189, 'Москва', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'),
    ('Pierce Paradise', 'piercing', 'Профессиональная пирсинг-студия', 4.7, 156, 'Москва', 'https://images.unsplash.com/photo-1620331313174-9187a5f5a5f8?w=400');

    INSERT INTO services (specialist_id, name, price, duration) VALUES
    (1, 'Маленькая татуировка', 150, 60),
    (1, 'Средний размер', 350, 180),
    (1, 'Рукав', 1200, 480),
    (2, 'Гель-маникюр', 45, 45),
    (2, 'Акрил', 75, 90),
    (3, 'Прокол мочки', 30, 15),
    (3, 'Хрящ', 45, 20);
  `);
  console.log('Seeded database');
}

// API Routes
app.get('/api/specialists', (req, res) => {
  const category = req.query.category as string;
  let sql = 'SELECT * FROM specialists';
  const params: any[] = [];
  
  if (category && category !== 'all') {
    sql += ' WHERE category = ?';
    params.push(category);
  }
  sql += ' ORDER BY rating DESC';
  
  const stmt = db.prepare(sql);
  const specialists = params.length ? stmt.all(...params) : stmt.all();
  
  // Add services to each specialist
  const servicesStmt = db.prepare('SELECT * FROM services WHERE specialist_id = ?');
  const result = specialists.map((s: any) => ({
    ...s,
    services: servicesStmt.all(s.id)
  }));
  
  res.json(result);
});

app.get('/api/specialists/:id', (req, res) => {
  const { id } = req.params;
  const specialist = db.prepare('SELECT * FROM specialists WHERE id = ?').get(id);
  
  if (!specialist) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const services = db.prepare('SELECT * FROM services WHERE specialist_id = ?').all(id);
  res.json({ ...specialist, services });
});

app.post('/api/users', (req, res) => {
  const { telegram_id, name } = req.body;
  
  let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
  
  if (!user) {
    const result = db.prepare('INSERT INTO users (telegram_id, name) VALUES (?, ?)').run(telegram_id, name);
    user = { id: result.lastInsertRowid, telegram_id, name };
  }
  
  res.json(user);
});

app.post('/api/bookings', (req, res) => {
  const { user_id, specialist_id, service_id, date } = req.body;
  
  const result = db.prepare(
    'INSERT INTO bookings (user_id, specialist_id, service_id, date) VALUES (?, ?, ?, ?)'
  ).run(user_id, specialist_id, service_id, date);
  
  res.json({ success: true, id: result.lastInsertRowid });
});

app.get('/api/bookings/:userId', (req, res) => {
  const { userId } = req.params;
  
  const bookings = db.prepare(`
    SELECT b.*, 
           s.name as specialist_name, s.category, s.location, s.image_url,
           svc.name as service_name, svc.price, svc.duration
    FROM bookings b
    LEFT JOIN specialists s ON b.specialist_id = s.id
    LEFT JOIN services svc ON b.service_id = svc.id
    WHERE b.user_id = ?
    ORDER BY b.date DESC
  `).all(userId);
  
  res.json(bookings);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});