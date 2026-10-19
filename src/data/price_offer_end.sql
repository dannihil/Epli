-- =============================================================
-- Add an end date to offer prices.
-- Run this once in the Supabase SQL editor.
--
-- offer_ends_on is the last day the offer is valid (inclusive).
-- NULL = the offer has no end date and stays until removed.
-- After that day the offer is cleared: offer_price and
-- offer_ends_on are set back to NULL (by PriceList.jsx on load,
-- and by the optional nightly job below).
-- =============================================================

ALTER TABLE pricing ADD COLUMN IF NOT EXISTS offer_ends_on date;

-- -------------------------------------------------------------
-- Optional: clear expired offers nightly in the database itself.
-- PriceList.jsx already clears them whenever the page is opened;
-- this job makes it happen even if nobody opens the page.
-- Requires the pg_cron extension (Database → Extensions → pg_cron).
-- Runs 00:05 UTC (= Icelandic time) every day.
-- -------------------------------------------------------------

SELECT cron.schedule(
  'clear-expired-offers',
  '5 0 * * *',
  $$
    UPDATE pricing
    SET offer_price = NULL,
        offer_ends_on = NULL,
        updated_at = now()
    WHERE offer_ends_on < current_date;
  $$
);
