# D2Deals Driveway

A car marketplace for searching inventory, submitting bids, reserving vehicles, and managing stock and orders from an admin dashboard.

## Run locally

```bash
cp .env.example .env
npm install
npm run server
```

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`. The admin dashboard is at `http://localhost:5173/admin` and uses the `ADMIN_API_KEY` value from `.env`.

The backend deliberately starts in temporary demo-memory mode when `DATABASE_URL` is blank. This makes every screen testable immediately, but demo changes disappear when the server restarts.

## Connect Supabase

1. Create a Supabase project.
2. Open **SQL Editor**, paste all of `server/schema.sql`, and run it once.
3. Open **Project Settings → Database → Connection string → URI**.
4. Copy `.env.example` to `.env`, add the URI as `DATABASE_URL`, replace its password placeholder, and set a long random `ADMIN_API_KEY`.
5. Restart `npm run server`. Check `http://localhost:4000/api/health`; it should report `"database":"postgres"`.

For vehicle images, upload files to a public Supabase Storage bucket and paste each public URL into the admin form’s **Image** field. The form contains an inline code comment marking this handoff.

## Add payments later

The order route already creates a pending reservation. Search for `PAYMENT INTEGRATION GOES HERE` in `server/index.js`; the comments there mark the exact place to create a Paystack, Flutterwave, or Stripe checkout. The database already includes `orders.payment_reference`, and `.env.example` includes placeholders for provider secrets.

Recommended payment flow:

1. Create the pending order.
2. Create checkout with the provider using the order ID as metadata.
3. Save the returned reference to `orders.payment_reference`.
4. Return the provider checkout URL to the frontend.
5. Verify the signed provider webhook before changing the order to `paid`.

Never expose payment secret keys or the Supabase database password through a `VITE_` variable; those are bundled into browser code.

## Main API routes

- `GET /api/vehicles`
- `POST /api/orders`
- `POST /api/bids`
- `GET /api/admin/dashboard`
- `POST /api/admin/vehicles`
- `PATCH /api/admin/vehicles/:id`
- `PATCH /api/admin/orders/:id`

All `/api/admin/*` routes require `Authorization: Bearer <ADMIN_API_KEY>`.
