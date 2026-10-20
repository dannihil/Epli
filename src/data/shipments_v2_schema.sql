-- =============================================================
-- Staða sendinga (/stada-sendinga) — Excel format:
-- SUB LOB | Vörunúmer | Lýsing | Magn sendingar | Epli áætlað magn |
-- Áætl. afhending | Shipping status | DN númer | LOB | Customer PO Number
--
-- The original Apple-export version (/stada-sendinga-upprunalegt, admin
-- only) keeps using the "shipments" table. Run in the Supabase SQL editor;
-- safe to run again (e.g. after columns are added).
-- =============================================================

CREATE TABLE IF NOT EXISTS shipments_v2 (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sub_lob             text,
  part_number         text,
  description         text,
  shipment_qty        integer,   -- Magn sendingar
  epli_qty            integer,   -- Epli áætlað magn
  estimated_delivery  date,      -- Áætl. afhending
  status              text,
  dn_number           text,
  lob                 text,
  po_number           text       -- Customer PO Number
);

-- Added after the first version of this file
ALTER TABLE shipments_v2 ADD COLUMN IF NOT EXISTS lob text;

CREATE TABLE IF NOT EXISTS shipments_v2_meta (
  id           integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  uploaded_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipments_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments_v2_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON shipments_v2;
DROP POLICY IF EXISTS "Public read" ON shipments_v2_meta;
CREATE POLICY "Public read" ON shipments_v2 FOR SELECT USING (true);
CREATE POLICY "Public read" ON shipments_v2_meta FOR SELECT USING (true);

-- Swaps all rows in one transaction (see replace_shipments in shipments_schema.sql).
CREATE OR REPLACE FUNCTION replace_shipments_v2(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted integer;
BEGIN
  DELETE FROM shipments_v2 WHERE true;

  INSERT INTO shipments_v2 (
    sub_lob, part_number, description, shipment_qty, epli_qty,
    estimated_delivery, status, dn_number, lob, po_number
  )
  SELECT
    sub_lob, part_number, description, shipment_qty, epli_qty,
    estimated_delivery, status, dn_number, lob, po_number
  FROM jsonb_to_recordset(p_rows) AS r(
    sub_lob text, part_number text, description text,
    shipment_qty integer, epli_qty integer, estimated_delivery date,
    status text, dn_number text, lob text, po_number text
  );
  GET DIAGNOSTICS inserted = ROW_COUNT;

  INSERT INTO shipments_v2_meta (id, uploaded_at)
  VALUES (1, now())
  ON CONFLICT (id) DO UPDATE SET uploaded_at = now();

  RETURN inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION replace_shipments_v2(jsonb) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
