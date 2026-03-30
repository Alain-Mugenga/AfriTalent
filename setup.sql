-- ============================================================
--  AfriTalent – Database Setup
--  Run once: psql -d your_database -f setup.sql
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role         VARCHAR(50) DEFAULT 'athlete',
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  country             VARCHAR(100) NOT NULL,
  sport               VARCHAR(100) NOT NULL,
  age                 INTEGER,
  bio                 TEXT,
  achievements        TEXT,
  photo_url           VARCHAR(500),
  highlight_video_url VARCHAR(500),
  stats               JSONB DEFAULT '{}',
  status              VARCHAR(50) DEFAULT 'pending',
  is_featured         BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Success stories table
CREATE TABLE IF NOT EXISTS success_stories (
  id         SERIAL PRIMARY KEY,
  athlete_id INTEGER REFERENCES athletes(id),
  title      VARCHAR(500) NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Seed admin user (password: admin123) ──────────────────────────────────────
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@afritalent.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- ── Seed featured athletes ────────────────────────────────────────────────────
INSERT INTO athletes (name, country, sport, age, bio, achievements, photo_url, stats, status, is_featured)
VALUES
(
  'Alain Mugenga',
  'Rwanda',
  'Basketball',
  20,
  'Alain is a dynamic point guard from Kigali, Rwanda, who brings explosive energy and sharp vision to every game. Known for his lightning-fast crossovers and court awareness, he is one of East Africa''s most exciting young basketball prospects.',
  'MVP – Rwanda Basketball League 2024
Best Point Guard – East Africa Championship 2023
Led Kigali Lions to national championship title',
  '/images/alain.jpeg',
  '{"PPG": "22", "APG": "8", "RPG": "5", "WIN%": "78%"}',
  'approved',
  TRUE
),
(
  'Rene Guido',
  'Burundi',
  'Football',
  19,
  'Rene is a technically gifted attacking midfielder from Bujumbura, Burundi. His vision, close control, and ability to unlock defences with a single pass make him one of the most talked-about young talents in Central African football.',
  'Top Scorer – Burundi Premier League 2024
Best Young Player – CECAFA U-20 Tournament 2023
Represented Burundi national U-20 team',
  '/images/rene.jpeg',
  '{"Goals": "18", "Assists": "12", "Matches": "24", "Pass%": "87%"}',
  'approved',
  TRUE
),
(
  'Aurel Karega',
  'Uganda',
  'Athletics',
  22,
  'Aurel is a powerful long-distance runner from Kampala, Uganda, who combines endurance with tactical race intelligence. Training on the hills of Kampala has built the kind of engine that wins continental medals.',
  'Gold Medal – East African Athletics Championship 5000m 2024
National Record holder – Uganda 10,000m
Bronze Medal – African Games 2023',
  '/images/aurel.jpeg',
  '{"5K PB": "13:21", "10K PB": "27:45", "Medals": "7", "Races": "31"}',
  'approved',
  TRUE
)
ON CONFLICT DO NOTHING;