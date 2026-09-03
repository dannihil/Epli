-- =============================================================
-- Mac Studio (2026) — new CTO product + configurations.
-- Run this once in the Supabase SQL editor.
--
-- This is the corrected version of the block appended to
-- cto_schema_v2.sql. The pasted SQL had three problems:
--  1. No `product` row for 0007 — the FK on `configuration` would
--     have rejected every insert.
--  2. A stray semicolon after the m5ultra_30_64/96gb rows cut the
--     INSERT off mid-list, leaving the last five 256gb rows outside
--     any valid statement.
--  3. The two "M5 Ultra" tiers used the old M3 Ultra chip slugs
--     (m3ultra_28_60 / m3ultra_32_80) and core counts — leftover from
--     copying the 2025 Mac Studio block. Renamed to m5ultra_30_64 /
--     m5ultra_36_80 to match the 30/64 and 36/80 stated in the
--     header comment (and to avoid two unrelated chips in two
--     different products sharing an identical chip slug).
--
-- Mac Studio (2026) gets its own product_id (0007) rather than
-- reusing the 2025 Mac Studio's (0001) — a new, separate CTO page,
-- mirroring mac-mini-2026 sitting next to mac-mini.
-- =============================================================

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
