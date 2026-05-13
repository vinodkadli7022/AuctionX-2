-- Migration 005: Create bids table with composite index
-- ============================================================

CREATE TABLE IF NOT EXISTS bids (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES auction_sessions(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,   -- in Lakhs
  placed_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Composite index — most queried combination for bid history lookups
CREATE INDEX IF NOT EXISTS idx_bids_session_player_time
  ON bids(session_id, player_id, placed_at DESC);

CREATE INDEX IF NOT EXISTS idx_bids_franchise ON bids(franchise_id);
