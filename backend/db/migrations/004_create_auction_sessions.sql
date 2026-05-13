-- Migration 004: Create auction sessions table
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE session_status AS ENUM ('scheduled', 'live', 'paused', 'ended');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS auction_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(200) NOT NULL,
  status            session_status NOT NULL DEFAULT 'scheduled',
  current_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  started_at        TIMESTAMP WITH TIME ZONE,
  ended_at          TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON auction_sessions(status);
