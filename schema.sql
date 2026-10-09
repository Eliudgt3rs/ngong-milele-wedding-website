-- PostgreSQL schema for Atieno & Mulei Wedding Website

CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  attendance VARCHAR(20) NOT NULL, -- 'accepts' or 'declines'
  guest_count INT NOT NULL DEFAULT 1,
  dietary_notes TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups and stats
CREATE INDEX IF NOT EXISTS idx_rsvps_attendance ON rsvps(attendance);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);
