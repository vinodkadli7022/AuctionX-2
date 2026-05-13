-- Migration 006: Create squad_players table
-- ============================================================

CREATE TABLE IF NOT EXISTS squad_players (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  player_id    UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  price_paid   INTEGER NOT NULL,   -- in Lakhs
  acquired_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate squad entries
  CONSTRAINT uq_franchise_player UNIQUE (franchise_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_squad_franchise ON squad_players(franchise_id);
