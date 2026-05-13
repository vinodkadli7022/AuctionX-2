-- Migration 003: Create players table
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'player_role') THEN
        CREATE TYPE player_role AS ENUM ('Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'player_nationality') THEN
        CREATE TYPE player_nationality AS ENUM ('Indian', 'Overseas');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'player_status') THEN
        CREATE TYPE player_status AS ENUM ('upcoming', 'in-auction', 'sold', 'unsold');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS players (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(100) NOT NULL,
  role                  player_role NOT NULL,
  nationality           player_nationality NOT NULL,
  age                   INTEGER NOT NULL CHECK (age BETWEEN 15 AND 50),
  ipl_caps              INTEGER NOT NULL DEFAULT 0,
  base_price            INTEGER NOT NULL,           -- in Lakhs
  photo_url             VARCHAR(500),
  status                player_status NOT NULL DEFAULT 'upcoming',
  sold_to_franchise_id  UUID REFERENCES franchises(id) ON DELETE SET NULL,
  sold_price            INTEGER,                    -- in Lakhs
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_players_role ON players(role);
CREATE INDEX IF NOT EXISTS idx_players_nationality ON players(nationality);
CREATE INDEX IF NOT EXISTS idx_players_name ON players USING gin(to_tsvector('english', name));
