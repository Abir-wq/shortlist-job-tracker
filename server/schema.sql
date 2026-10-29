-- Run with npm run db:migrate. Safe to run again; it does not erase data.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(100) NOT NULL,
  role VARCHAR(140) NOT NULL,
  location VARCHAR(120) NOT NULL DEFAULT '',
  job_url TEXT NOT NULL DEFAULT '',
  salary VARCHAR(120) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'Saved'
    CHECK (status IN ('Saved', 'Applied', 'Interview', 'Offer', 'Closed')),
  applied_date DATE,
  follow_up_date DATE,
  interview_at TIMESTAMPTZ,
  contact_name VARCHAR(120) NOT NULL DEFAULT '',
  next_action VARCHAR(240) NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  prep JSONB NOT NULL DEFAULT '[]',
  questions JSONB NOT NULL DEFAULT '[]',
  is_sample BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS applications_user_idx ON applications(user_id, created_at DESC);
