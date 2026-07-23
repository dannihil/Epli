-- =============================================================
-- EPLI Pricing — Supabase Schema
-- Run this in the Supabase SQL editor
-- =============================================================

CREATE TABLE pricing (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug  text        NOT NULL,        -- e.g. "macbook-pro-m5"
  screen_size   integer,                     -- e.g. 13, 14, 15, 16
  chip          text        NOT NULL,        -- e.g. "M5 Pro chip"
  chip_order    integer     NOT NULL DEFAULT 0,  -- order chips within a page
  cpu_cores     text,                        -- "15-core CPU"
  gpu_cores     text,                        -- "16-core GPU"
  storage       text        NOT NULL,        -- "1TB"
  ram           text        NOT NULL,        -- "24GB"
  price         integer     NOT NULL,        -- in ISK, e.g. 389990
  offer_price   integer,                     -- null if no offer
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX ON pricing (product_slug);
CREATE INDEX ON pricing (product_slug, chip_order, display_order);

-- Row Level Security
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public pricing sheet)
CREATE POLICY "Public read"
  ON pricing FOR SELECT
  USING (true);

-- Writes: this app authenticates via Clerk, not Supabase Auth, so every
-- request reaches PostgREST as the anon role — auth.role() is never
-- 'authenticated' here. Access control for writes is enforced in the app
-- (PriceList.jsx only renders edit/add/delete controls for Clerk users
-- with publicMetadata.role === "admin"), matching the "products" table.
CREATE POLICY "Public insert"
  ON pricing FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update"
  ON pricing FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete"
  ON pricing FOR DELETE
  USING (true);


-- =============================================================
-- Seed data — mirrors all current hardcoded component values
-- Prices are stored as integers in ISK (e.g. 389.990 kr = 389990)
-- =============================================================

INSERT INTO pricing (product_slug, screen_size, chip, chip_order, cpu_cores, gpu_cores, storage, ram, price, offer_price, display_order) VALUES

-- ── MacBook Neo ───────────────────────────────────────────────
('macbook-neo', 13, 'A18 Pro chip', 0, '6-core CPU', '5-core GPU', '256GB', '8GB', 119900, null, 0),
('macbook-neo', 13, 'A18 Pro chip', 0, '6-core CPU', '5-core GPU', '512GB', '8GB', 139900, null, 1),

-- ── MacBook Air 13" ──────────────────────────────────────────
('macbook-air-m5', 13, 'M5 chip', 0, '10-core CPU', '8-core GPU',  '512GB', '16GB', 219990, null, 0),
('macbook-air-m5', 13, 'M5 chip', 0, '10-core CPU', '10-core GPU', '1TB', '16GB', 259990, null, 1),
('macbook-air-m5', 13, 'M5 chip', 0, '10-core CPU', '10-core GPU', '1TB', '24GB', 299990, null, 2),

-- ── MacBook Air 15" ──────────────────────────────────────────
('macbook-air-m5', 15, 'M5 chip', 0, '10-core CPU', '10-core GPU', '256GB', '16GB', 229990, null, 0),
('macbook-air-m5', 15, 'M5 chip', 0, '10-core CPU', '10-core GPU', '512GB', '16GB', 269990, null, 1),
('macbook-air-m5', 15, 'M5 chip', 0, '10-core CPU', '10-core GPU', '512GB', '24GB', 309990, null, 2),

-- ── MacBook Pro M4 — 14" ─────────────────────────────────────
('macbook-pro-m4', 14, 'M4 Pro chip', 0, '12-core CPU', '16-core GPU', '512GB', '24GB', 389990, null, 0),
('macbook-pro-m4', 14, 'M4 Pro chip', 0, '14-core CPU', '20-core GPU', '1TB',   '24GB', 469990, null, 1),
('macbook-pro-m4', 14, 'M4 Max chip', 1, '14-core CPU', '32-core GPU', '1TB',   '36GB', 619990, null, 0),

-- ── MacBook Pro M5 — 14" ─────────────────────────────────────
('macbook-pro-m5', 14, 'M5 chip',     0, '10-core CPU', '10-core GPU', '1TB',   '16GB', 389990, null, 0),
('macbook-pro-m5', 14, 'M5 chip',     0, '10-core CPU', '10-core GPU', '1TB',   '24GB', 429990, null, 1),
('macbook-pro-m5', 14, 'M5 chip',     0, '10-core CPU', '10-core GPU', '1TB',   '32GB', 469990, null, 2),
('macbook-pro-m5', 14, 'M5 Pro chip', 1, '15-core CPU', '16-core GPU', '1TB',   '24GB', 489990, null, 0),
('macbook-pro-m5', 14, 'M5 Pro chip', 1, '18-core CPU', '20-core GPU', '2TB',   '24GB', 619990, null, 1),
('macbook-pro-m5', 14, 'M5 Pro chip', 1, '18-core CPU', '20-core GPU', '2TB',   '48GB', 739990, null, 2),
('macbook-pro-m5', 14, 'M5 Max chip', 2, '18-core CPU', '32-core GPU', '2TB',   '36GB', 769990, null, 0),

-- ── MacBook Pro M5 — 16" ─────────────────────────────────────
('macbook-pro-m5', 16, 'M5 Pro chip', 0, '18-core CPU', '20-core GPU', '1TB',   '24GB', 559990, null, 0),
('macbook-pro-m5', 16, 'M5 Pro chip', 0, '18-core CPU', '20-core GPU', '1TB',   '48GB', 669990, null, 1),
('macbook-pro-m5', 16, 'M5 Max chip', 1, '18-core CPU', '32-core GPU', '2TB',   '36GB', 829990, null, 0),
('macbook-pro-m5', 16, 'M5 Max chip', 1, '18-core CPU', '40-core GPU', '2TB',   '48GB', 969990, null, 1),

-- ── iMac M4 ──────────────────────────────────────────────────
('imac-m4', 24, 'M4 chip', 0, '8-core CPU',  '8-core GPU',  '256GB', '16GB', 289990, null, 0),
('imac-m4', 24, 'M4 chip', 0, '10-core CPU', '10-core GPU', '256GB', '16GB', 319990, null, 1),
('imac-m4', 24, 'M4 chip', 0, '10-core CPU', '10-core GPU', '512GB', '16GB', 359990, null, 2),
('imac-m4', 24, 'M4 chip', 0, '10-core CPU', '10-core GPU', '512GB', '24GB', 399990, null, 3),
('imac-m4', 24, 'M4 chip', 0, '10-core CPU', '10-core GPU', '1TB',   '24GB', 409990, null, 4),

-- ── Mac mini M4 ──────────────────────────────────────────────
('mac-mini-m4', null, 'M4 chip',     0, '10-core CPU', '10-core GPU', '512GB', '16GB', 199990, null, 0),
('mac-mini-m4', null, 'M4 chip',     0, '10-core CPU', '10-core GPU', '512GB', '24GB', 229990, null, 1),
('mac-mini-m4', null, 'M4 Pro chip', 1, '10-core CPU', '16-core GPU', '512GB', '24GB', 309990, null, 0),

-- ── Mac Studio ───────────────────────────────────────────────
('mac-studio', null, 'M4 Max chip',   0, '14-core CPU', '32-core GPU', '512GB', '36GB', 499990, null, 0),
('mac-studio', null, 'M4 Max chip',   0, '14-core CPU', '32-core GPU', '512GB', '36GB', 519990, null, 1),
('mac-studio', null, 'M3 Ultra chip', 1, '28-core CPU', '60-core GPU', '1TB',   '96GB', 999990, null, 0);
