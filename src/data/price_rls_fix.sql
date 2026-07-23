-- =============================================================
-- Fix: pricing table writes were silently no-ops.
-- Run this once in the Supabase SQL editor against the existing table.
--
-- Root cause: the original policies gated INSERT/UPDATE/DELETE on
-- auth.role() = 'authenticated', but this app authenticates via Clerk,
-- not Supabase Auth — every request reaches PostgREST as the anon role,
-- so auth.role() is never 'authenticated' and writes were filtered out
-- (PostgREST returns 200 with an empty result, no error).
--
-- Access control for who can write is enforced in the app instead
-- (PriceList.jsx only shows edit/add/delete controls to Clerk users
-- with publicMetadata.role === "admin"), matching how the "products"
-- table (used by Sölutorg) is already configured.
-- =============================================================

DROP POLICY IF EXISTS "Auth insert" ON pricing;
DROP POLICY IF EXISTS "Auth update" ON pricing;
DROP POLICY IF EXISTS "Auth delete" ON pricing;

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
