-- Migration 001: Create franchises table and seed IPL franchise data
-- ============================================================

CREATE TABLE IF NOT EXISTS franchises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  short_name      VARCHAR(5) NOT NULL,
  logo_url        VARCHAR(500),
  home_city       VARCHAR(100),
  purse_remaining INTEGER NOT NULL DEFAULT 10000,  -- in Lakhs (10000 = 100 Cr)
  purse_total     INTEGER NOT NULL DEFAULT 10000,
  squad_count     INTEGER NOT NULL DEFAULT 0,
  overseas_count  INTEGER NOT NULL DEFAULT 0,
  primary_color   VARCHAR(7) NOT NULL,             -- hex color
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed all 8 IPL franchises
INSERT INTO franchises (name, short_name, home_city, primary_color, logo_url) VALUES
  ('Mumbai Indians',          'MI',  'Mumbai',    '#004BA0', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/mi.png'),
  ('Chennai Super Kings',     'CSK', 'Chennai',   '#F6C000', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/csk.png'),
  ('Royal Challengers Bengaluru', 'RCB', 'Bengaluru', '#CC0000', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/rcb.png'),
  ('Kolkata Knight Riders',   'KKR', 'Kolkata',   '#3A225D', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/kkr.png'),
  ('Delhi Capitals',          'DC',  'Delhi',     '#0078BC', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/dc.png'),
  ('Rajasthan Royals',        'RR',  'Jaipur',    '#EA1A85', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/rr.png'),
  ('Punjab Kings',            'PBKS','Mohali',    '#ED1B24', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/pbks.png'),
  ('Sunrisers Hyderabad',     'SRH', 'Hyderabad', '#F7A721', 'https://res.cloudinary.com/demo/image/upload/v1/ipl-logos/srh.png')
ON CONFLICT DO NOTHING;
