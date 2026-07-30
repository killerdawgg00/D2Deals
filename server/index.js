import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Lightweight .env loading keeps setup dependency-free. Production hosts should set real environment variables.
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}
// Load database code after .env so its connection pool sees DATABASE_URL.
if (process.env.NODE_ENV === 'production') {
  const missing = ['DATABASE_URL', 'ADMIN_API_KEY'].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
}

const { archiveVehicle, checkDatabaseConnection, createBid, createOrder, createVehicle, getDashboard, listVehicles, pool, updateOrderStatus, updateVehicle, usingDemoDatabase } = await import('./db.js');
const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrderStatuses = ['pending', 'confirmed', 'paid', 'delivered', 'cancelled'];

const allowedOrigins = process.env.FRONTEND_URL?.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(express.json({ limit: '1mb' }));

const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!process.env.ADMIN_API_KEY) return res.status(503).json({ error: 'Set ADMIN_API_KEY in .env before using the admin dashboard.' });
  if (token !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Invalid admin key.' });
  next();
};
const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === '');
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  next();
};
const handler = (fn) => async (req, res, next) => { try { await fn(req, res); } catch (error) { next(error); } };

app.get('/api/health', handler(async (req, res) => {
  const database = await checkDatabaseConnection();
  res.status(database.connected || process.env.NODE_ENV !== 'production' ? 200 : 503).json({ ok: database.connected, database });
}));
app.get('/api/vehicles', handler(async (req, res) => res.json({ vehicles: await listVehicles({ status: req.query.status, search: req.query.search }) })));
app.post('/api/orders', requireFields(['vehicle_id','customer_name','customer_email','customer_phone']), handler(async (req, res) => {
  const order = await createOrder(req.body);
  // PAYMENT INTEGRATION GOES HERE:
  // 1. Create checkout with Paystack/Flutterwave/Stripe using `order`.
  // 2. Save its reference in orders.payment_reference.
  // 3. Return checkout_url and redirect the frontend after reservation.
  res.status(201).json({ order, payment_pending: true });
}));
app.post('/api/bids', requireFields(['vehicle_id','customer_name','customer_email','customer_phone','amount']), handler(async (req, res) => {
  if (Number(req.body.amount) <= 0) return res.status(400).json({ error: 'Bid must be greater than zero.' });
  res.status(201).json({ bid: await createBid({ ...req.body, amount: Number(req.body.amount) }) });
}));

app.get('/api/admin/dashboard', adminOnly, handler(async (req, res) => res.json(await getDashboard())));
app.post('/api/admin/vehicles', adminOnly, requireFields(['name','make','model','year','price_amount','currency']), handler(async (req, res) => {
  const currency = String(req.body.currency).trim().toUpperCase();
  if (!['GHS', 'USD'].includes(currency)) return res.status(400).json({ error: 'Currency must be GHS or USD.' });
  res.status(201).json({ vehicle: await createVehicle({ ...req.body, currency }) });
}));
app.patch('/api/admin/vehicles/:id', adminOnly, handler(async (req, res) => {
  const vehicle = await updateVehicle(req.params.id, req.body);
  res.status(vehicle ? 200 : 404).json(vehicle ? { vehicle } : { error: 'Vehicle not found.' });
}));
app.delete('/api/admin/vehicles/:id', adminOnly, handler(async (req, res) => {
  const vehicle = await archiveVehicle(req.params.id);
  res.status(vehicle ? 200 : 404).json(vehicle ? { vehicle, archived: true } : { error: 'Vehicle not found.' });
}));
app.patch('/api/admin/orders/:id', adminOnly, requireFields(['status']), handler(async (req, res) => {
  if (!allowedOrderStatuses.includes(req.body.status)) return res.status(400).json({ error: 'Invalid order status.' });
  const order = await updateOrderStatus(req.params.id, req.body.status);
  res.status(order ? 200 : 404).json(order ? { order } : { error: 'Order not found.' });
}));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
}
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(error);
  res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'production' ? 'Server error.' : error.message });
});
const server = app.listen(port, '0.0.0.0', () => console.log(`D2Deals API listening on port ${port} (${usingDemoDatabase ? 'demo memory' : 'Postgres'})`));

const shutdown = async (signal) => {
  console.log(`${signal} received; closing server.`);
  server.close(async () => {
    if (pool) await pool.end();
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
