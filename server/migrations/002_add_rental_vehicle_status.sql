-- Run this once in Supabase SQL Editor for an existing D2Deals database.
ALTER TABLE public.vehicles
  DROP CONSTRAINT IF EXISTS vehicles_status_check;

ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_status_check
  CHECK (status IN ('available', 'auction', 'rental', 'reserved', 'sold', 'hidden'));
