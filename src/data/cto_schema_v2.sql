-- ============================================================
-- CTO Product Database — Simplified Schema
-- Covers: Mac Studio, MacBook Pro, MacBook Air, iMac, Mac mini
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

CREATE TABLE product (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  sku          TEXT NOT NULL UNIQUE,
  description  TEXT,
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE configuration (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  chip        TEXT NOT NULL,     -- e.g. 'm4max_14_32'
  storage     TEXT NOT NULL,     -- e.g. '512gb'
  memory      TEXT NOT NULL,     -- e.g. '36gb'
  screen_size TEXT,              -- '13', '14', '15', '16' — NULL for desktops
  display     TEXT,              -- 'standard', 'nano_texture' — NULL for desktops
  color       TEXT,              -- 'silver', 'midnight' etc. — NULL where not relevant
  price_isk   INT NOT NULL,
  UNIQUE (product_id, chip, storage, memory, screen_size, display, color)
);

CREATE INDEX ON configuration (product_id);

-- ============================================================
-- PRODUCTS
-- ============================================================

INSERT INTO product (id, name, sku) VALUES
  ('aaaaaaaa-0001-0000-0000-000000000000', 'Mac Studio',    'MACSTUDIO'),
  ('aaaaaaaa-0002-0000-0000-000000000000', 'MacBook Pro',   'MBP'),
  ('aaaaaaaa-0003-0000-0000-000000000000', 'MacBook Air',   'MBA'),
  ('aaaaaaaa-0004-0000-0000-000000000000', 'iMac',          'IMAC'),
  ('aaaaaaaa-0005-0000-0000-000000000000', 'Mac mini',      'MACMINI');

-- ============================================================
-- MAC STUDIO (2025)
-- Chips: M4 Max 14/32, M4 Max 16/40, M3 Ultra 28/60, M3 Ultra 32/80
-- Memory: M4 Max → 36GB or 128GB | M3 Ultra → 192GB or 512GB
-- Storage: 512GB, 1TB, 2TB, 4TB, 8TB
-- No screen_size or color dimension
-- ============================================================

INSERT INTO configuration (product_id, chip, storage, memory, price_isk) VALUES
  -- M4 Max 14-core CPU / 32-core GPU
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_14_32','512gb','36gb',   499990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_14_32','1tb',  '36gb',   559990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_14_32','2tb',  '36gb',   659990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_14_32','4tb',  '36gb',   859990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_14_32','8tb',  '36gb',   1259990),

  -- M4 Max 16-core CPU / 40-core GPU
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','512gb','48gb',   619990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','1tb',  '48gb',   679990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','2tb',  '48gb',   779990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','4tb',  '48gb',   979990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','8tb',  '48gb',   1379990),

  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','512gb','64gb',   699990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','1tb',  '64gb',   759990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','2tb',  '64gb',   859990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','4tb',  '64gb',   1059990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m4max_16_40','8tb',  '64gb',   1459990),

  -- M3 Ultra 28-core CPU / 60-core GPU
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_28_60','1tb',  '96gb', 999990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_28_60','2tb',  '96gb', 1079990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_28_60','4tb',  '96gb', 1279990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_28_60','8tb',  '96gb', 1679990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_28_60','16tb', '96gb', 2379990),
  -- M3 Ultra 32-core CPU / 80-core GPU
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_32_80','1tb',  '96gb', 1279990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_32_80','2tb',  '96gb', 1359990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_32_80','4tb',  '96gb', 1559990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_32_80','8tb',  '96gb', 1959990),
  ('aaaaaaaa-0001-0000-0000-000000000000','m3ultra_32_80','16tb', '96gb', 2659990);

-- ============================================================
-- MAC STUDIO (2026)
-- New product row (0007), separate from the 2025 Mac Studio (0001) —
-- mirrors mac-mini-2026 sitting next to mac-mini.
-- Chips: M5 Max 18/32, M5 Max 18/40, M5 Ultra 30/64, M5 Ultra 36/80
-- Memory: M5 Max 18/32 → 36GB | M5 Max 18/40 → 48GB, 64GB, 128GB
--         M5 Ultra (both) → 96GB or 256GB
-- Storage: 512GB–8TB on Max tiers, 1TB–16TB on Ultra tiers
-- No screen_size or color dimension
-- ============================================================

INSERT INTO product (id, name, sku) VALUES
  ('aaaaaaaa-0007-0000-0000-000000000000', 'Mac Studio (2026)', 'MACSTUDIO2026');

INSERT INTO configuration (product_id, chip, storage, memory, price_isk) VALUES
  -- M5 Max 18-core CPU / 32-core GPU
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_32','512gb','36gb',   469990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_32','1tb',  '36gb',   529990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_32','2tb',  '36gb',   619990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_32','4tb',  '36gb',   799990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_32','8tb',  '36gb',   1179990),

  -- M5 Max 18-core CPU / 40-core GPU
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','512gb','48gb',   579990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','1tb',  '48gb',   639990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','2tb',  '48gb',   729990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','4tb',  '48gb',   909990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','8tb',  '48gb',   1289990),

  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','512gb','64gb',   659990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','1tb',  '64gb',   719990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','2tb',  '64gb',   809990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','4tb',  '64gb',   989990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','8tb',  '64gb',   1369990),
  
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','512gb','128gb',   949990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','1tb',  '128gb',   1009990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','2tb',  '128gb',   1099990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','4tb',  '128gb',   1279990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5max_18_40','8tb',  '128gb',   1659990),

  -- M5 Ultra 30-core CPU / 64-core GPU
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','1tb',  '96gb', 999990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','2tb',  '96gb', 1099990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','4tb',  '96gb', 1279990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','8tb',  '96gb', 1649990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','16tb', '96gb', 2379990),

  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','1tb',  '256gb', 1739990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','2tb',  '256gb', 1839990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','4tb',  '256gb', 2019990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','8tb',  '256gb', 2389990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_30_64','16tb', '256gb', 3119990),

  -- M5 Ultra 36-core CPU / 80-core GPU
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','1tb',  '96gb', 1239990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','2tb',  '96gb', 1339990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','4tb',  '96gb', 1519990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','8tb',  '96gb', 1889990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','16tb', '96gb', 2619990),

  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','1tb',  '256gb', 1979990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','2tb',  '256gb', 2079990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','4tb',  '256gb', 2259990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','8tb',  '256gb', 2629990),
  ('aaaaaaaa-0007-0000-0000-000000000000','m5ultra_36_80','16tb', '256gb', 3359990);

-- ============================================================
-- MACBOOK PRO (2024)
-- Chips:
--   M5 10 10       → 10-core CPU / 10-core GPU  (14" only)
--   M5 Pro 15 16   → 15-core CPU / 16-core GPU
--   M5 Pro 18 20   → 18-core CPU / 20-core GPU
--   M5 Max 18 32   → 18-core CPU / 32-core GPU
--   M5 Max 18 40   → 18-core CPU / 40-core GPU
-- Memory:
--   M5 10 10       → 16GB, 32GB
--   M5 Pro 15 16   → 24GB, 48GB
--   M5 Pro 18 20   → 24GB, 48GB, 64GB
--   M5 Max 18 32   → 36GB, 48GB, 64GB, 128GB (starts at 36GB)
--   M5 Max 18 40   → 48GB, 64GB, 128GB (starts at 48GB)
-- Storage: 1TB, 2TB, 4TB, 8TB
-- Screen sizes: 14", 16" (M4 base is 14" only)
-- Displays: Standard display, Nano-Texture display
-- Colors: silver, space_black
-- ============================================================

INSERT INTO configuration (product_id, chip, storage, memory, screen_size, display, color, price_isk) VALUES
  -- M5 base — 14" only
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','16gb','14','standard',     'silver',      389990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','16gb','14','standard',     'space_black', 389990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','16gb','14','standard',     'silver',      489990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','16gb','14','standard',     'space_black', 489990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','16gb','14','standard',     'silver',      689990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','16gb','14','standard',     'space_black', 689990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','24gb','14','standard',     'silver',      429990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','24gb','14','standard',     'space_black', 429990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','24gb','14','standard',     'silver',      529990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','24gb','14','standard',     'space_black', 529990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','24gb','14','standard',     'silver',      729990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','24gb','14','standard',     'space_black', 729990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','32gb','14','standard',     'silver',      469990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','32gb','14','standard',     'space_black', 469990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','32gb','14','standard',     'silver',      569990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','32gb','14','standard',     'space_black', 569990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','32gb','14','standard',     'silver',      769990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','32gb','14','standard',     'space_black', 769990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','16gb','14','nano_texture', 'silver',      419990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','16gb','14','nano_texture', 'space_black', 419990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','16gb','14','nano_texture', 'silver',      519990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','16gb','14','nano_texture', 'space_black', 519990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','16gb','14','nano_texture', 'silver',      619990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','16gb','14','nano_texture', 'space_black', 619990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','24gb','14','nano_texture', 'silver',      459990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','24gb','14','nano_texture', 'space_black', 459990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','24gb','14','nano_texture', 'silver',      559990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','24gb','14','nano_texture', 'space_black', 559990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','24gb','14','nano_texture', 'silver',      759990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','24gb','14','nano_texture', 'space_black', 759990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','32gb','14','nano_texture', 'silver',      499990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','1tb','32gb','14','nano_texture', 'space_black', 499990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','32gb','14','nano_texture', 'silver',      599990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','2tb','32gb','14','nano_texture', 'space_black', 599990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','32gb','14','nano_texture', 'silver',      799990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5_10_10','4tb','32gb','14','nano_texture', 'space_black', 799990),

  -- m5 Pro 15-core CPU / 16-core GPU — 14" and 16"
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '24gb','14','standard',     'silver',      489990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '24gb','14','standard',     'space_black', 489990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '24gb','14','standard',     'silver',      589990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '24gb','14','standard',     'space_black', 589990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '24gb','14','standard',     'silver',      789990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '24gb','14','standard',     'space_black', 789990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '48gb','14','standard',     'silver',      609990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '48gb','14','standard',     'space_black', 609990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '48gb','14','standard',     'silver',      709990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '48gb','14','standard',     'space_black', 709990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '48gb','14','standard',     'silver',      909990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '48gb','14','standard',     'space_black', 909990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '24gb','14','nano_texture', 'silver',      519990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '24gb','14','nano_texture', 'space_black', 519990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '24gb','14','nano_texture', 'silver',      619990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '24gb','14','nano_texture', 'space_black', 619990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '24gb','14','nano_texture', 'silver',      819990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '24gb','14','nano_texture', 'space_black', 819990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '48gb','14','nano_texture', 'silver',      639990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','1tb',  '48gb','14','nano_texture', 'space_black', 639990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '48gb','14','nano_texture', 'silver',      739990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','2tb',  '48gb','14','nano_texture', 'space_black', 739990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '48gb','14','nano_texture', 'silver',      939990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_15_16','4tb',  '48gb','14','nano_texture', 'space_black', 939990),


  -- m5 Pro 18-core CPU / 20-core GPU — 14" and 16"
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','14','standard',     'silver',      619990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','14','standard',     'space_black', 619990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','14','standard',     'silver',      819990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','14','standard',     'space_black', 819990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','14','standard',     'silver',      739990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','14','standard',     'space_black', 739990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','14','standard',     'silver',      939990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','14','standard',     'space_black', 939990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','14','standard',     'silver',      819990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','14','standard',     'space_black', 819990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','14','standard',     'silver',      1019990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','14','standard',     'space_black', 1019990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','14','nano_texture',     'silver',      649990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','14','nano_texture',     'space_black', 649990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','14','nano_texture',     'silver',      849990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','14','nano_texture',     'space_black', 849990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','14','nano_texture',     'silver',      769990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','14','nano_texture',     'space_black', 769990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','14','nano_texture',     'silver',      969990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','14','nano_texture',     'space_black', 969990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','14','nano_texture',     'silver',      849990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','14','nano_texture',     'space_black', 849990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','14','nano_texture',     'silver',      1049990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','14','nano_texture',     'space_black', 1049990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '24gb','16','standard',     'silver',      559990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '24gb','16','standard',     'space_black', 559990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','16','standard',     'silver',      659990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','16','standard',     'space_black', 659990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','16','standard',     'silver',      859990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','16','standard',     'space_black', 859990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '48gb','16','standard',     'silver',      679990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '48gb','16','standard',     'space_black', 679990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','16','standard',     'silver',      779990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','16','standard',     'space_black', 779990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','16','standard',     'silver',      979990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','16','standard',     'space_black', 979990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '64gb','16','standard',     'silver',      759990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '64gb','16','standard',     'space_black', 759990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','16','standard',     'silver',      859990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','16','standard',     'space_black', 859990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','16','standard',     'silver',      1059990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','16','standard',     'space_black', 1059990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '24gb','16','nano_texture',     'silver',      589990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '24gb','16','nano_texture',     'space_black', 589990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','16','nano_texture',     'silver',      689990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb','16','nano_texture',     'space_black', 689990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','16','nano_texture',     'silver',      889990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb','16','nano_texture',     'space_black', 889990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '48gb','16','nano_texture',     'silver',      709990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '48gb','16','nano_texture',     'space_black', 709990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','16','nano_texture',     'silver',      809990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb','16','nano_texture',     'space_black', 809990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','16','nano_texture',     'silver',      1009990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb','16','nano_texture',     'space_black', 1009990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '64gb','16','nano_texture',     'silver',      789990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','1tb',  '64gb','16','nano_texture',     'space_black', 789990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','16','nano_texture',     'silver',      889990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb','16','nano_texture',     'space_black', 889990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','16','nano_texture',     'silver',      1089990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb','16','nano_texture',     'space_black', 1089990),

  -- m5 Max 18-core CPU / 32-core GPU — 14" and 16"
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '14','standard',     'silver',      769990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '14','standard',     'space_black', 769990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '14','standard',     'silver',      969990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '14','standard',     'space_black', 969990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '14','standard',     'silver',      1369990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '14','standard',     'space_black', 1369990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '14','nano_texture', 'silver',      799990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '14','nano_texture', 'space_black', 799990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '14','nano_texture', 'silver',      999990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '14','nano_texture', 'space_black', 999990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '14','nano_texture', 'silver',      1399990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '14','nano_texture', 'space_black', 1399990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '16','standard',     'silver',      829990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '16','standard',     'space_black', 829990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '16','standard',     'silver',      1029990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '16','standard',     'space_black', 1029990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '16','standard',     'silver',      1429990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '16','standard',     'space_black', 1429990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '16','nano_texture', 'silver',      859990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','2tb',  '36gb', '16','nano_texture', 'space_black', 859990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '16','nano_texture', 'silver',      1059990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','4tb',  '36gb', '16','nano_texture', 'space_black', 1059990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '16','nano_texture', 'silver',      1459990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_32','8tb',  '36gb', '16','nano_texture', 'space_black', 1459990),

  -- m5 Max 18-core CPU / 40-core GPU — 14" and 16"
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '14','standard',     'silver',      889990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '14','standard',     'space_black', 889990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '14','standard',     'silver',      1089990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '14','standard',     'space_black', 1089990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '14','standard',     'silver',      1489990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '14','standard',     'space_black', 1489990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '14','standard',     'silver',      969990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '14','standard',     'space_black', 969990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '14','standard',     'silver',      1169990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '14','standard',     'space_black', 1169990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '14','standard',     'silver',      1569990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '14','standard',     'space_black', 1569990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','14','standard',     'silver',      1269990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','14','standard',     'space_black', 1269990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','14','standard',     'silver',      1469990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','14','standard',     'space_black', 1469990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','14','standard',     'silver',      1869990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','14','standard',     'space_black', 1869990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '14','nano_texture', 'silver',      919990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '14','nano_texture', 'space_black', 919990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '14','nano_texture', 'silver',      1119990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '14','nano_texture', 'space_black', 1119990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '14','nano_texture', 'silver',      1519990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '14','nano_texture', 'space_black', 1519990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '14','nano_texture', 'silver',      999990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '14','nano_texture', 'space_black', 999990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '14','nano_texture', 'silver',      1199990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '14','nano_texture', 'space_black', 1199990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '14','nano_texture', 'silver',      1599990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '14','nano_texture', 'space_black', 1599990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','14','nano_texture', 'silver',      1299990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','14','nano_texture', 'space_black', 1299990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','14','nano_texture', 'silver',      1499990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','14','nano_texture', 'space_black', 1499990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','14','nano_texture', 'silver',      1899990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','14','nano_texture', 'space_black', 1899990),


  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '16','standard',     'silver',      949990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '16','standard',     'space_black', 949990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '16','standard',     'silver',      1149990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '16','standard',     'space_black', 1149990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '16','standard',     'silver',      1599990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '16','standard',     'space_black', 1599990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '16','standard',     'silver',      1029990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '16','standard',     'space_black', 1029990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '16','standard',     'silver',      1229990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '16','standard',     'space_black', 1229990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '16','standard',     'silver',      1629990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '16','standard',     'space_black', 1629990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','16','standard',     'silver',      1329990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','16','standard',     'space_black', 1329990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','16','standard',     'silver',      1529990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','16','standard',     'space_black', 1529990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','16','standard',     'silver',      1929990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','16','standard',     'space_black', 1929990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '16','nano_texture', 'silver',      979990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '48gb', '16','nano_texture', 'space_black', 979990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '16','nano_texture', 'silver',      1179990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '48gb', '16','nano_texture', 'space_black', 1179990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '16','nano_texture', 'silver',      1629990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '48gb', '16','nano_texture', 'space_black', 1629990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '16','nano_texture', 'silver',      1059990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '64gb', '16','nano_texture', 'space_black', 1059990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '16','nano_texture', 'silver',      1259990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '64gb', '16','nano_texture', 'space_black', 1259990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '16','nano_texture', 'silver',      1659990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '64gb', '16','nano_texture', 'space_black', 1659990),

  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','16','nano_texture', 'silver',      1359990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','2tb',  '128gb','16','nano_texture', 'space_black', 1359990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','16','nano_texture', 'silver',      1559990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','4tb',  '128gb','16','nano_texture', 'space_black', 1559990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','16','nano_texture', 'silver',      1959990),
  ('aaaaaaaa-0002-0000-0000-000000000000','m5max_18_40','8tb',  '128gb','16','nano_texture', 'space_black', 1959990);
  
-- ============================================================
-- MACBOOK AIR (2026) — M5
-- Chip:
--   M5 10 8        → 10-core CPU / 8-core GPU (13" only)
--   M5 10 10       → 10-core CPU / 10-core GPU
-- Memory:
--   M5 10 8       → 16GB
--   M5 10 10       → 16GB
--   M5 10 10       → 24GB
--   M5 10 10       → 32GB
-- Storage: 512GB, 1TB, 2TB
--   M5 10 8       → 512GB
--   M5 10 10       → 512GB, 1TB, 2TB, 4TB
-- Screen sizes: 13", 15"
-- Colors: sky_blue, midnight, starlight, silver
-- Note: base 13" starts with 8-core GPU; upgrading memory/storage
--       auto-upgrades GPU to 10-core on 13". 15" is always 10-core.
-- ============================================================

INSERT INTO configuration (product_id, chip, storage, memory, screen_size, color, price_isk) VALUES
  -- M5 8-core GPU — 13" base only
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_8', '512gb','16gb','13','sky_blue',  259990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_8', '512gb','16gb','13','midnight',  259990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_8', '512gb','16gb','13','starlight', 259990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_8', '512gb','16gb','13','silver',    259990),

  -- M5 10-core GPU — 13" and 15"

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','13','sky_blue',  279990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','13','midnight',  279990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','13','starlight', 279990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','13','silver',    279990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','13','sky_blue',  319990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','13','midnight',  319990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','13','starlight', 319990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','13','silver',    319990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','13','sky_blue',  419990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','13','midnight',  419990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','13','starlight', 419990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','13','silver',    419990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','13','sky_blue',  619990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','13','midnight',  619990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','13','starlight', 619990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','13','silver',    619990),


  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','13','sky_blue',  319990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','13','midnight',  319990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','13','starlight', 319990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','13','silver',    319990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','13','sky_blue',    349990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','13','midnight',    349990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','13','starlight',   349990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','13','silver',      349990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','13','sky_blue',    449990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','13','midnight',    449990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','13','starlight',   449990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','13','silver',      449990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','13','sky_blue',    649990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','13','midnight',    649990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','13','starlight',   649990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','13','silver',      649990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','13','sky_blue',  359990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','13','midnight',  359990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','13','starlight', 359990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','13','silver',    359990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','13','sky_blue',    399990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','13','midnight',    399990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','13','starlight',   399990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','13','silver',      399990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','13','sky_blue',    499990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','13','midnight',    499990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','13','starlight',   499990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','13','silver',      499990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','13','sky_blue',    699990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','13','midnight',    699990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','13','starlight',   699990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','13','silver',      699990),


  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','15','sky_blue',  299990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','15','midnight',  299990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','15','starlight', 299990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','16gb','15','silver',    299990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','15','sky_blue',    349990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','15','midnight',    349990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','15','starlight',   349990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','16gb','15','silver',      349990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','15','sky_blue',    449990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','15','midnight',    449990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','15','starlight',   449990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','16gb','15','silver',      449990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','15','sky_blue',    549990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','15','midnight',    549990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','15','starlight',   549990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','16gb','15','silver',      549990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','15','sky_blue',  339990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','15','midnight',  339990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','15','starlight', 339990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','24gb','15','silver',    339990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','15','sky_blue',    389990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','15','midnight',    389990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','15','starlight',   389990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','24gb','15','silver',      389990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','15','sky_blue',    489990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','15','midnight',    489990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','15','starlight',   489990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','24gb','15','silver',      489990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','15','sky_blue',    689990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','15','midnight',    689990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','15','starlight',   689990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','24gb','15','silver',      689990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','15','sky_blue',  379990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','15','midnight',  379990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','15','starlight', 379990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','512gb','32gb','15','silver',    379990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','15','sky_blue',    439990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','15','midnight',    439990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','15','starlight',   439990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','1tb','32gb','15','silver',      439990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','15','sky_blue',    539990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','15','midnight',    539990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','15','starlight',   539990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','2tb','32gb','15','silver',      539990),

  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','15','sky_blue',    739990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','15','midnight',    739990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','15','starlight',   739990),
  ('aaaaaaaa-0003-0000-0000-000000000000','m5_10_10','4tb','32gb','15','silver',      739990);

-- ============================================================
-- iMAC (2024) — M4
-- Chips: M4 8-core CPU/8-core GPU (entry, 2-port) | M4 10-core CPU/10-core GPU (4-port)
-- Memory: 8-core → 16GB or 24GB | 10-core → 16GB, 24GB, or 32GB
-- Storage: 8-core → 256GB or 1TB | 10-core → 256GB, 512GB, 1TB, or 2TB
-- Colors: blue, green, purple, pink, orange, yellow, silver
-- No screen_size dimension (always 24")
-- ============================================================

INSERT INTO configuration (product_id, chip, storage, memory, display, color, price_isk) VALUES
  -- M4 8-core CPU / 8-core GPU (2-port entry model)
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','16gb','standard','blue',    289990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','16gb','standard','green',   289990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','16gb','standard','purple',  289990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','16gb','standard','pink',    289990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','16gb','standard','orange',  289990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','16gb','standard','yellow',  289990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','16gb','standard','silver',  289990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','16gb','standard','blue',    329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','16gb','standard','green',   329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','16gb','standard','purple',  329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','16gb','standard','pink',    329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','16gb','standard','orange',  329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','16gb','standard','yellow',  329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','16gb','standard','silver',  329990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '16gb','standard','blue',    389990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '16gb','standard','green',   389990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '16gb','standard','purple',  389990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '16gb','standard','pink',    389990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '16gb','standard','orange',  389990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '16gb','standard','yellow',  389990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '16gb','standard','silver',  389990),


  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','24gb','standard','blue',    329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','24gb','standard','green',   329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','24gb','standard','purple',  329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','24gb','standard','pink',    329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','24gb','standard','orange',  329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','24gb','standard','yellow',  329990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','256gb','24gb','standard','silver',  329990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','24gb','standard','blue',    369990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','24gb','standard','green',   369990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','24gb','standard','purple',  369990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','24gb','standard','pink',    369990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','24gb','standard','orange',  369990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','24gb','standard','yellow',  369990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','512gb','24gb','standard','silver',  369990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '24gb','standard','blue',    429990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '24gb','standard','green',   429990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '24gb','standard','purple',  429990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '24gb','standard','pink',    429990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '24gb','standard','orange',  429990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '24gb','standard','yellow',  429990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_8_8','1tb',  '24gb','standard','silver',  429990),

  -- M4 10-core CPU / 10-core GPU (4-port models)
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','standard','blue',   319990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','standard','green',  319990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','standard','purple', 319990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','standard','pink',   319990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','standard','orange', 319990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','standard','yellow', 319990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','standard','silver', 319990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','standard','blue',   359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','standard','green',  359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','standard','purple', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','standard','pink',   359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','standard','orange', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','standard','yellow', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','standard','silver', 359990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','standard','blue',   419990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','standard','green',  419990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','standard','purple', 419990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','standard','pink',   419990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','standard','orange', 419990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','standard','yellow', 419990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','standard','silver', 419990),
  
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','standard','blue',   519990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','standard','green',  519990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','standard','purple', 519990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','standard','pink',   519990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','standard','orange', 519990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','standard','yellow', 519990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','standard','silver', 519990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','nano_texture','blue',   359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','nano_texture','green',  359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','nano_texture','purple', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','nano_texture','pink',   359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','nano_texture','orange', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','nano_texture','yellow', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','16gb','nano_texture','silver', 359990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','nano_texture','blue',   399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','nano_texture','green',  399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','nano_texture','purple', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','nano_texture','pink',   399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','nano_texture','orange', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','nano_texture','yellow', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb','16gb','nano_texture','silver', 399990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','nano_texture','blue',   459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','nano_texture','green',  459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','nano_texture','purple', 459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','nano_texture','pink',   459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','nano_texture','orange', 459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','nano_texture','yellow', 459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb','16gb','nano_texture','silver', 459990),
  
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','nano_texture','blue',   559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','nano_texture','green',  559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','nano_texture','purple', 559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','nano_texture','pink',   559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','nano_texture','orange', 559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','nano_texture','yellow', 559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb','16gb','nano_texture','silver', 559990),


  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','standard','blue',   359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','standard','green',  359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','standard','purple', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','standard','pink',   359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','standard','orange', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','standard','yellow', 359990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','standard','silver', 359990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','standard','blue',   399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','standard','green',  399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','standard','purple', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','standard','pink',   399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','standard','orange', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','standard','yellow', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','standard','silver', 399990),
  
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','standard','blue',   459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','standard','green',  459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','standard','purple', 459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','standard','pink',   459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','standard','orange', 459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','standard','yellow', 459990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','standard','silver', 459990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','standard','blue',   559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','standard','green',  559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','standard','purple', 559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','standard','pink',   559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','standard','orange', 559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','standard','yellow', 559990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','standard','silver', 559990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','nano_texture','blue',   399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','nano_texture','green',  399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','nano_texture','purple', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','nano_texture','pink',   399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','nano_texture','orange', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','nano_texture','yellow', 399990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','256gb','24gb','nano_texture','silver', 399990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','nano_texture','blue',   439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','nano_texture','green',  439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','nano_texture','purple', 439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','nano_texture','pink',   439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','nano_texture','orange', 439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','nano_texture','yellow', 439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '24gb','nano_texture','silver', 439990),
  
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','nano_texture','blue',   499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','nano_texture','green',  499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','nano_texture','purple', 499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','nano_texture','pink',   499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','nano_texture','orange', 499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','nano_texture','yellow', 499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '24gb','nano_texture','silver', 499990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','nano_texture','blue',   599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','nano_texture','green',  599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','nano_texture','purple', 599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','nano_texture','pink',   599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','nano_texture','orange', 599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','nano_texture','yellow', 599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '24gb','nano_texture','silver', 599990),


  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','standard','blue',   439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','standard','green',  439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','standard','purple', 439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','standard','pink',   439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','standard','orange', 439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','standard','yellow', 439990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','standard','silver', 439990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','standard','blue',   499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','standard','green',  499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','standard','purple', 499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','standard','pink',   499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','standard','orange', 499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','standard','yellow', 499990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','standard','silver', 499990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','standard','blue',   599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','standard','green',  599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','standard','purple', 599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','standard','pink',   599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','standard','orange', 599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','standard','yellow', 599990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','standard','silver', 599990),


  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','nano_texture','blue',   479990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','nano_texture','green',  479990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','nano_texture','purple', 479990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','nano_texture','pink',   479990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','nano_texture','orange', 479990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','nano_texture','yellow', 479990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','512gb',  '32gb','nano_texture','silver', 479990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','nano_texture','blue',   539990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','nano_texture','green',  539990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','nano_texture','purple', 539990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','nano_texture','pink',   539990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','nano_texture','orange', 539990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','nano_texture','yellow', 539990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','1tb',  '32gb','nano_texture','silver', 539990),

  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','nano_texture','blue',   639990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','nano_texture','green',  639990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','nano_texture','purple', 639990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','nano_texture','pink',   639990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','nano_texture','orange', 639990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','nano_texture','yellow', 639990),
  ('aaaaaaaa-0004-0000-0000-000000000000','m4_10_10','2tb',  '32gb','nano_texture','silver', 639990);

-- ============================================================
-- MAC MINI (2024)
-- Chips: M4 10-core CPU/10-core GPU | M4 Pro 12-core/16-core | M4 Pro 14-core/20-core
-- Memory: M4 → 16GB, 24GB | M4 Pro → 24GB, 48GB
-- Storage: 256GB, 512GB, 1TB, 2TB, 8TB
-- No screen_size or color dimension
-- ============================================================

INSERT INTO configuration (product_id, chip, storage, memory, price_isk) VALUES
  -- M4 10-core CPU / 10-core GPU
  ('aaaaaaaa-0005-0000-0000-000000000000','m4_10_10','512gb','16gb',199990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4_10_10','512gb','16gb',199990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4_10_10','1tb','16gb',  259990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4_10_10','2tb','16gb',  359990),

  ('aaaaaaaa-0005-0000-0000-000000000000','m4_10_10','512gb','24gb', 239990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4_10_10','1tb',  '24gb', 299990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4_10_10','2tb',  '24gb', 399990),

  -- M4 Pro 12-core CPU / 16-core GPU
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','512gb','24gb', 309990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','1tb',  '24gb', 369990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','2tb',  '24gb', 469990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','4tb',  '24gb', 669990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','8tb',  '24gb', 1069990),

  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','512gb','48gb', 429990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','1tb',  '48gb', 489990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','2tb',  '48gb', 589990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','4tb',  '48gb', 789990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_12_16','8tb',  '48gb', 1189990),

  -- M4 Pro 14-core CPU / 20-core GPU
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','512gb','24gb', 349990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','1tb',  '24gb', 409990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','2tb',  '24gb', 509990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','4tb',  '24gb', 709990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','8tb',  '24gb', 1109990),

  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','512gb','48gb', 469990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','1tb',  '48gb', 529990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','2tb',  '48gb', 629990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','4tb',  '48gb', 829990),
  ('aaaaaaaa-0005-0000-0000-000000000000','m4pro_14_20','8tb',  '48gb', 1229990);

-- ============================================================
-- MAC MINI (2026)
-- Kept as a separate product row from the 2024 Mac mini (0005) rather
-- than new chip rows on the same product — this is a new CTO page
-- (mirrors how macbook-pro-test sits next to macbook-pro), so it needs
-- its own product_id for the FK on configuration to resolve.
-- Chips: M6 12-core CPU/12-core GPU | M5 Pro 15-core/16-core | M5 Pro 18-core/20-core
-- Memory: M6 → 16GB, 24GB, 32GB | M5 Pro → 24GB, 48GB, 64GB
-- Storage: 256GB, 512GB, 1TB, 2TB, 4TB, 8TB
-- No screen_size or color dimension
-- ============================================================

INSERT INTO product (id, name, sku) VALUES
  ('aaaaaaaa-0006-0000-0000-000000000000', 'Mac mini (2026)', 'MACMINI2026');

INSERT INTO configuration (product_id, chip, storage, memory, price_isk) VALUES
  -- M6 12-core CPU / 12-core GPU
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','256gb','16gb', 169990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','512gb','16gb', 209990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','1tb',  '16gb', 269990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','2tb',  '16gb', 369990),

  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','256gb','24gb', 209990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','512gb','24gb', 249990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','1tb',  '24gb', 309990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','2tb',  '24gb', 409990),

  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','256gb','32gb', 249990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','512gb','32gb', 289990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','1tb',  '32gb', 349990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m6_12_12','2tb',  '32gb', 449990),

  -- M5 Pro 15-core CPU / 16-core GPU
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','512gb','24gb', 329990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','1tb',  '24gb', 389990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','2tb',  '24gb', 479990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','4tb',  '24gb', 689990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','8tb',  '24gb', 1049990),

  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','512gb','48gb', 449990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','1tb',  '48gb', 509990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','2tb',  '48gb', 599990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','4tb',  '48gb', 789990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','8tb',  '48gb', 1169990),
  
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','512gb','64gb', 529990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','1tb',  '64gb', 589990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','2tb',  '64gb', 679990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','4tb',  '64gb', 869990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_15_16','8tb',  '64gb', 1249990),

  -- M5 Pro 18-core CPU / 20-core GPU
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','512gb','24gb', 369990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','1tb',  '24gb', 429990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','2tb',  '24gb', 519990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','4tb',  '24gb', 709990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','8tb',  '24gb', 1089990),

  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','512gb','48gb', 489990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','1tb',  '48gb', 549990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','2tb',  '48gb', 639990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','4tb',  '48gb', 829990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','8tb',  '48gb', 1209990),

  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','512gb','64gb', 569990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','1tb',  '64gb', 629990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','2tb',  '64gb', 719990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','4tb',  '64gb', 909990),
  ('aaaaaaaa-0006-0000-0000-000000000000','m5pro_18_20','8tb',  '64gb', 1289990);

-- ============================================================
-- EXAMPLE QUERIES
-- ============================================================

-- 1. Look up price for a specific Mac Studio config:
-- SELECT price_isk FROM configuration
-- WHERE product_id = 'aaaaaaaa-0001-0000-0000-000000000000'
--   AND chip = 'm4max_14_32' AND storage = '512gb' AND memory = '36gb';

-- 2. All MacBook Pro 16" configs under 700.000 kr:
-- SELECT chip, storage, memory, color, price_isk
-- FROM configuration
-- WHERE product_id = 'aaaaaaaa-0002-0000-0000-000000000000'
--   AND screen_size = '16' AND price_isk < 700000
-- ORDER BY price_isk;

-- 3. All iMac configs in pink:
-- SELECT chip, storage, memory, price_isk
-- FROM configuration
-- WHERE product_id = 'aaaaaaaa-0004-0000-0000-000000000000'
--   AND color = 'pink'
-- ORDER BY price_isk;



ALTER TABLE configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON configuration
  FOR SELECT USING (true);

CREATE POLICY "Allow public read" ON product
  FOR SELECT USING (true);

-- ============================================================
-- CATEGORY-PAGE HELPER
-- Used by Cto.jsx to render "Verð frá ..." and the chip summary
-- line per category without pulling every configuration row to
-- the client. Collapses ~560 rows down to one row per
-- (product_id, chip) — the client derives both the overall
-- minimum price and the chip-family list (e.g. "M5 · M5 Pro ·
-- M5 Max") from this small result set.
-- ============================================================

CREATE OR REPLACE FUNCTION configuration_chip_min_prices()
RETURNS TABLE (product_id uuid, chip text, min_price integer)
LANGUAGE sql
STABLE
AS $$
  SELECT product_id, chip, MIN(price_isk) AS min_price
  FROM configuration
  GROUP BY product_id, chip;
$$;

GRANT EXECUTE ON FUNCTION configuration_chip_min_prices() TO anon, authenticated;