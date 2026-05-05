import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database(path.join(__dirname, '../data/marketplace.db'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    is_pro BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS specialists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    bio TEXT,
    category TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    specialist_id INTEGER,
    name TEXT,
    price INTEGER,
    duration INTEGER,
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
  );

  CREATE TABLE IF NOT EXISTS portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    specialist_id INTEGER,
    image_url TEXT,
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    specialist_id INTEGER,
    service_id INTEGER,
    appointment_date TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (specialist_id) REFERENCES specialists(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
  );
`);

// Seed initial data (only if empty)
const specialistCount = db.prepare('SELECT COUNT(*) as count FROM specialists').get() as { count: number };
if (specialistCount.count === 0) {
  // First create users
  const userStmt = db.prepare(`
    INSERT OR IGNORE INTO users (telegram_id, username, first_name, is_pro)
    VALUES (?, ?, ?, ?)
  `);

  const users = [
    ['1', 'anna_ink', 'Anna', 1],
    ['2', 'maria_nails', 'Maria', 1],
    ['3', 'alex_pierce', 'Alex', 1],
    ['4', 'lisa_lashes', 'Lisa', 1]
  ];

  users.forEach(user => userStmt.run(...user));

  // Add sample specialists
  const stmt = db.prepare(`
    INSERT INTO specialists (user_id, name, bio, category, rating, reviews_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const specialists = [
    [1, 'Anna Ink', 'Professional tattoo artist with 5 years experience', 'Tattoo', 4.9, 127],
    [2, 'Maria Nails', 'Nail art specialist, gel & acrylic expert', 'Nails', 4.8, 89],
    [3, 'Alex Pierce', 'Certified piercer, sterile environment guaranteed', 'Piercing', 5.0, 234],
    [4, 'Lisa Lashes', 'Eyelash extensions & brow shaping pro', 'Lashes', 4.7, 56]
  ];

  specialists.forEach(spec => stmt.run(...spec));

  // Add sample services
  const serviceStmt = db.prepare(`
    INSERT INTO services (specialist_id, name, price, duration)
    VALUES (?, ?, ?, ?)
  `);

  const services = [
    [1, 'Small Tattoo', 5000, 60],
    [1, 'Medium Tattoo', 10000, 120],
    [1, 'Large Tattoo', 20000, 180],
    [2, 'Manicure Classic', 1500, 45],
    [2, 'Gel Polish', 2500, 60],
    [2, 'Acrylic Extension', 4000, 90],
    [3, 'Ear Piercing', 2000, 30],
    [3, 'Nose Piercing', 2500, 30],
    [3, 'Navel Piercing', 3500, 45],
    [4, 'Classic Lashes', 3000, 90],
    [4, 'Volume Lashes', 4500, 120],
    [4, 'Brow Shaping', 1500, 30]
  ];

  services.forEach(serv => serviceStmt.run(...serv));
}

// API Routes

// Get all specialists
app.get('/api/specialists', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM specialists WHERE 1=1';
  const params: any[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR bio LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const specialists = db.prepare(query).all(...params);
  res.json(specialists);
});

// Get specialist by ID
app.get('/api/specialists/:id', (req, res) => {
  const specialist = db.prepare('SELECT * FROM specialists WHERE id = ?').get(req.params.id);
  if (!specialist) {
    return res.status(404).json({ error: 'Specialist not found' });
  }
  res.json(specialist);
});

// Get services for a specialist
app.get('/api/specialists/:id/services', (req, res) => {
  const services = db.prepare('SELECT * FROM services WHERE specialist_id = ?').all(req.params.id);
  res.json(services);
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM specialists').all();
  res.json(categories.map((c: any) => c.category));
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const { user_id, specialist_id, service_id, appointment_date } = req.body;
  
  try {
    const result = db.prepare(`
      INSERT INTO bookings (user_id, specialist_id, service_id, appointment_date)
      VALUES (?, ?, ?, ?)
    `).run(user_id, specialist_id, service_id, appointment_date);
    
    res.json({ id: result.lastInsertRowid, status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
app.get('/api/users/:id/bookings', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, s.name as specialist_name, srv.name as service_name, srv.price
    FROM bookings b
    JOIN specialists s ON b.specialist_id = s.id
    JOIN services srv ON b.service_id = srv.id
    WHERE b.user_id = ?
  `).all(req.params.id);
  res.json(bookings);
});

// Save or update user
app.post('/api/users', (req, res) => {
  const { telegram_id, username, first_name, last_name, is_pro } = req.body;
  
  try {
    const existing = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
    
    if (existing) {
      db.prepare(`
        UPDATE users SET username = ?, first_name = ?, last_name = ?, is_pro = ?
        WHERE telegram_id = ?
      `).run(username, first_name, last_name, is_pro ? 1 : 0, telegram_id);
      
      res.json({ ...existing, username, first_name, last_name, is_pro });
    } else {
      const result = db.prepare(`
        INSERT INTO users (telegram_id, username, first_name, last_name, is_pro)
        VALUES (?, ?, ?, ?, ?)
      `).run(telegram_id, username, first_name, last_name, is_pro ? 1 : 0);
      
      res.json({ 
        id: result.lastInsertRowid, 
        telegram_id, 
        username, 
        first_name, 
        last_name, 
        is_pro 
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 SQLite database: /data/marketplace.db`);
});
