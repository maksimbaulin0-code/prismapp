-- PostgreSQL schema for Prism app

-- Users (Telegram users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specialists
CREATE TABLE IF NOT EXISTS specialists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    bio TEXT,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    location TEXT,
    image_url TEXT,
    cover_image TEXT,
    telegram TEXT,
    user_id INTEGER REFERENCES users(id),
    portfolio TEXT[], -- array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    specialist_id INTEGER REFERENCES specialists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    duration INTEGER NOT NULL
);

-- Time slots (available slots for booking)
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    specialist_id INTEGER REFERENCES specialists(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM-DD
    time TEXT NOT NULL, -- HH:MM
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(specialist_id, date, time)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    specialist_id INTEGER REFERENCES specialists(id),
    service_id INTEGER REFERENCES services(id),
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    specialist_id INTEGER REFERENCES specialists(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_specialists_category ON specialists(category);
CREATE INDEX IF NOT EXISTS idx_specialists_rating ON specialists(rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_specialist ON bookings(specialist_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_specialist ON time_slots(specialist_id, date);
CREATE INDEX IF NOT EXISTS idx_reviews_specialist ON reviews(specialist_id);
