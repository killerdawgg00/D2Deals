-- Run this entire file in Supabase > SQL Editor.
-- The API uses the server-side DATABASE_URL, so Row Level Security can stay enabled
-- when you later add direct browser Supabase access.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1950 AND 2100),
  price_amount NUMERIC(14,2) NOT NULL CHECK (price_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'GHS' CHECK (currency IN ('GHS', 'USD')),
  image TEXT,
  mileage INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  transmission TEXT NOT NULL DEFAULT 'Automatic',
  description TEXT DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'auction', 'reserved', 'sold', 'hidden')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'buy' CHECK (order_type IN ('buy', 'viewing')),
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'delivered', 'cancelled')),
  -- PAYMENT INTEGRATION: store the provider's checkout/payment reference here.
  payment_reference TEXT UNIQUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vehicles_status_idx ON vehicles(status);
CREATE INDEX IF NOT EXISTS vehicles_make_idx ON vehicles(make);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS bids_vehicle_idx ON bids(vehicle_id);

