-- =============================================================
-- Staða sendinga — only the columns the page shows.
-- Run this once in the Supabase SQL editor.
--
-- Replaces reading the full Apple Excel export from storage on
-- every page load. An admin uploads the Excel file in ExcelTable.jsx,
-- the browser keeps only the needed columns (and only rows with
-- something in transit), and calls replace_shipments() below.
-- =============================================================

CREATE TABLE IF NOT EXISTS shipments (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  apple_order_number  text,
  order_number        text,      -- Customer PO Number
  part_number         text,
  description         text,
  order_qty           integer,
  delivered_qty       integer,
  in_transit          integer,
  remaining_qty       integer,
  status              text,
  product_identifier  text,
  estimated_delivery  date,
  lob                 text
);

-- Single row: when Apple refreshed the data, and when it was uploaded.
CREATE TABLE IF NOT EXISTS shipments_meta (
  id                 integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data_refreshed_at  timestamptz,
  uploaded_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments_meta ENABLE ROW LEVEL SECURITY;

-- Reads are open to the app (same as the other tables). There are no
-- write policies: the only way to change the data is replace_shipments().
CREATE POLICY "Public read" ON shipments FOR SELECT USING (true);
CREATE POLICY "Public read" ON shipments_meta FOR SELECT USING (true);

-- Swaps all rows in one transaction, so a failed upload never leaves
-- the table half-empty. SECURITY DEFINER lets it write despite RLS.
-- Like the old storage upload, who may call it is enforced in the app
-- (only Clerk admins see the upload button).
CREATE OR REPLACE FUNCTION replace_shipments(
  p_rows jsonb,
  p_refreshed_at timestamptz
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted integer;
BEGIN
  DELETE FROM shipments WHERE true;

  INSERT INTO shipments (
    apple_order_number, order_number, part_number, description,
    order_qty, delivered_qty, in_transit, remaining_qty,
    status, product_identifier, estimated_delivery, lob
  )
  SELECT
    apple_order_number, order_number, part_number, description,
    order_qty, delivered_qty, in_transit, remaining_qty,
    status, product_identifier, estimated_delivery, lob
  FROM jsonb_to_recordset(p_rows) AS r(
    apple_order_number text, order_number text, part_number text,
    description text, order_qty integer, delivered_qty integer,
    in_transit integer, remaining_qty integer, status text,
    product_identifier text, estimated_delivery date, lob text
  );
  GET DIAGNOSTICS inserted = ROW_COUNT;

  INSERT INTO shipments_meta (id, data_refreshed_at, uploaded_at)
  VALUES (1, p_refreshed_at, now())
  ON CONFLICT (id) DO UPDATE
    SET data_refreshed_at = EXCLUDED.data_refreshed_at,
        uploaded_at = now();

  RETURN inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION replace_shipments(jsonb, timestamptz) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
