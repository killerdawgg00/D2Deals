import pg from 'pg';
import { vehicles as seedVehicles } from '../src/data/vehicles.js';

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
export const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  // Supabase hosted Postgres requires TLS. Set PGSSLMODE=disable only for local Postgres.
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
}) : null;

const memory = {
  vehicles: seedVehicles.map((vehicle) => ({ ...vehicle, id: String(vehicle.id), created_at: new Date().toISOString() })),
  orders: [],
  bids: [],
};

export const usingDemoDatabase = !pool;

export async function listVehicles({ status, search }) {
  if (!pool) {
    return memory.vehicles.filter((vehicle) =>
      (!status || vehicle.status === status) &&
      (!search || `${vehicle.name} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(search.toLowerCase())));
  }
  const values = [];
  const conditions = [];
  if (status) { values.push(status); conditions.push(`status = $${values.length}`); }
  if (search) { values.push(`%${search}%`); conditions.push(`(name ILIKE $${values.length} OR make ILIKE $${values.length} OR model ILIKE $${values.length})`); }
  const { rows } = await pool.query(`SELECT * FROM vehicles ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY featured DESC, created_at DESC`, values);
  return rows;
}

export async function createVehicle(data) {
  if (!pool) {
    const vehicle = { id: crypto.randomUUID(), ...data, featured: Boolean(data.featured), created_at: new Date().toISOString() };
    memory.vehicles.unshift(vehicle);
    return vehicle;
  }
  const { rows } = await pool.query(
    `INSERT INTO vehicles (name,make,model,year,price_amount,currency,image,mileage,transmission,description,status,featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [data.name, data.make, data.model, data.year, data.price_amount, data.currency, data.image || '', data.mileage || 0, data.transmission || 'Automatic', data.description || '', data.status || 'available', Boolean(data.featured)],
  );
  return rows[0];
}

export async function updateVehicle(id, data) {
  const allowed = ['name','make','model','year','price_amount','currency','image','mileage','transmission','description','status','featured'];
  const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
  if (!entries.length) return null;
  if (!pool) {
    const index = memory.vehicles.findIndex((vehicle) => vehicle.id === id);
    if (index < 0) return null;
    memory.vehicles[index] = { ...memory.vehicles[index], ...Object.fromEntries(entries) };
    return memory.vehicles[index];
  }
  const values = entries.map(([, value]) => value);
  values.push(id);
  const sets = entries.map(([key], index) => `${key} = $${index + 1}`);
  const { rows } = await pool.query(`UPDATE vehicles SET ${sets.join(', ')}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`, values);
  return rows[0] || null;
}

export async function createOrder(data) {
  const vehicle = (await listVehicles({})).find((item) => String(item.id) === String(data.vehicle_id));
  if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
  if (!pool) {
    const order = { id: crypto.randomUUID(), ...data, amount: Number(vehicle.price_amount), currency: vehicle.currency, status: 'pending', vehicle_name: vehicle.name, created_at: new Date().toISOString() };
    memory.orders.unshift(order); return order;
  }
  const { rows } = await pool.query(
    `INSERT INTO orders (vehicle_id,customer_name,customer_email,customer_phone,order_type,amount,currency)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.vehicle_id, data.customer_name, data.customer_email, data.customer_phone, data.order_type || 'buy', vehicle.price_amount, vehicle.currency],
  );
  return rows[0];
}

export async function createBid(data) {
  const vehicle = (await listVehicles({})).find((item) => String(item.id) === String(data.vehicle_id));
  if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
  if (!pool) {
    const bid = { id: crypto.randomUUID(), ...data, currency: vehicle.currency, vehicle_name: vehicle.name, status: 'pending', created_at: new Date().toISOString() };
    memory.bids.unshift(bid); return bid;
  }
  const { rows } = await pool.query(
    `INSERT INTO bids (vehicle_id,customer_name,customer_email,customer_phone,amount) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [data.vehicle_id, data.customer_name, data.customer_email, data.customer_phone, data.amount],
  );
  return rows[0];
}

export async function getDashboard() {
  if (!pool) {
    return {
      stats: { available: memory.vehicles.filter((v) => v.status === 'available').length, open_orders: memory.orders.filter((o) => !['delivered','cancelled'].includes(o.status)).length, active_bids: memory.bids.filter((b) => b.status === 'pending').length, sales_value: memory.orders.filter((o) => ['confirmed','paid','delivered'].includes(o.status)).reduce((sum, o) => sum + Number(o.amount), 0) },
      vehicles: memory.vehicles, orders: memory.orders, bids: memory.bids,
    };
  }
  const [statsResult, vehiclesResult, ordersResult, bidsResult] = await Promise.all([
    pool.query(`SELECT COUNT(*) FILTER (WHERE status='available')::int AS available,
      (SELECT COUNT(*)::int FROM orders WHERE status NOT IN ('delivered','cancelled')) AS open_orders,
      (SELECT COUNT(*)::int FROM bids WHERE status='pending') AS active_bids,
      (SELECT COALESCE(SUM(amount),0) FROM orders WHERE status IN ('confirmed','paid','delivered')) AS sales_value FROM vehicles`),
    pool.query('SELECT * FROM vehicles ORDER BY created_at DESC'),
    pool.query('SELECT o.*,v.name AS vehicle_name FROM orders o JOIN vehicles v ON v.id=o.vehicle_id ORDER BY o.created_at DESC'),
    pool.query('SELECT b.*,v.name AS vehicle_name,v.currency FROM bids b JOIN vehicles v ON v.id=b.vehicle_id ORDER BY b.created_at DESC'),
  ]);
  return { stats: statsResult.rows[0], vehicles: vehiclesResult.rows, orders: ordersResult.rows, bids: bidsResult.rows };
}

export async function updateOrderStatus(id, status) {
  if (!pool) {
    const order = memory.orders.find((item) => item.id === id);
    if (!order) return null; order.status = status; return order;
  }
  const { rows } = await pool.query('UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *', [status, id]);
  return rows[0] || null;
}
