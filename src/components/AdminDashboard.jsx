import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const initialCar = { name: '', make: '', model: '', year: new Date().getFullYear(), price_amount: '', currency: 'GHS', image: '', mileage: '', transmission: 'Automatic', status: 'available', description: '' };

export default function AdminDashboard() {
  const [token, setToken] = useState(sessionStorage.getItem('d2-admin-token') || '');
  const [draftToken, setDraftToken] = useState('');
  const [data, setData] = useState(null);
  const [car, setCar] = useState(initialCar);
  const [active, setActive] = useState('overview');
  const [message, setMessage] = useState('');

  const load = async (auth = token) => {
    try { setData(await api.dashboard(auth)); setMessage(''); }
    catch (error) { setMessage(error.message); }
  };
  useEffect(() => {
    if (!token) return;
    api.dashboard(token).then((result) => {
      setData(result);
      setMessage('');
    }).catch((error) => setMessage(error.message));
  }, [token]);

  const login = (event) => {
    event.preventDefault();
    sessionStorage.setItem('d2-admin-token', draftToken);
    setToken(draftToken);
  };
  const addVehicle = async (event) => {
    event.preventDefault();
    try {
      await api.createVehicle({ ...car, price_amount: Number(car.price_amount), year: Number(car.year), mileage: Number(car.mileage || 0) }, token);
      setCar(initialCar); setMessage('Vehicle published successfully.'); await load();
    } catch (error) { setMessage(error.message); }
  };
  const setOrderStatus = async (id, status) => {
    try { await api.updateOrder(id, status, token); await load(); }
    catch (error) { setMessage(error.message); }
  };

  if (!token || (!data && message)) {
    return <main className="admin-login"><form onSubmit={login} className="login-card"><img src="/d2deals-logo.png" alt="D2Deals" /><span className="eyebrow red">Admin access</span><h1>Welcome back.</h1><p>Enter the admin key from your server environment.</p><input type="password" value={draftToken} onChange={(e) => setDraftToken(e.target.value)} placeholder="Admin key" required /><button className="button button-primary">Open dashboard</button>{message && <div className="form-notice error">{message}</div>}<Link to="/">← Return to marketplace</Link></form></main>;
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <img src="/d2deals-logo.png" alt="D2Deals" />
        <nav>{['overview', 'inventory', 'orders', 'bids'].map((item) => <button key={item} className={active === item ? 'active' : ''} onClick={() => setActive(item)}>{item}</button>)}</nav>
        <Link to="/">View marketplace ↗</Link>
      </aside>
      <section className="admin-main">
        <header><div><span className="eyebrow red">D2 operations</span><h1>{active[0].toUpperCase() + active.slice(1)}</h1></div><button className="button button-dark" onClick={() => setActive('inventory')}>+ Post a car</button></header>
        {message && <div className="form-notice">{message}</div>}
        {active === 'overview' && <><div className="stats-grid">
          <article><span>Available cars</span><strong>{data?.stats.available || 0}</strong><small>Live inventory</small></article>
          <article><span>Open orders</span><strong>{data?.stats.open_orders || 0}</strong><small>Needs attention</small></article>
          <article><span>Active bids</span><strong>{data?.stats.active_bids || 0}</strong><small>Awaiting review</small></article>
          <article><span>Sales value</span><strong>GH₵{Number(data?.stats.sales_value || 0).toLocaleString()}</strong><small>Confirmed orders</small></article>
        </div><OrderTable orders={data?.orders?.slice(0, 6)} onStatus={setOrderStatus} /></>}
        {active === 'inventory' && <div className="admin-two-col">
          <form className="vehicle-form panel" onSubmit={addVehicle}><h2>Post a vehicle</h2><p>Complete the core details. You can edit stock status later.</p>
            <div className="form-grid">{Object.keys(initialCar).map((key) => key === 'description' ? <label className="span-2" key={key}>Description<textarea value={car[key]} onChange={(e) => setCar({ ...car, [key]: e.target.value })} /></label> : key === 'status' ? <label key={key}>Status<select value={car[key]} onChange={(e) => setCar({ ...car, [key]: e.target.value })}><option value="available">Available</option><option value="auction">Auction</option><option value="reserved">Reserved</option></select></label> : <label key={key}>{key.replace('_', ' ')}<input required={!['image', 'mileage'].includes(key)} type={['year', 'price_amount', 'mileage'].includes(key) ? 'number' : 'text'} value={car[key]} onChange={(e) => setCar({ ...car, [key]: e.target.value })} placeholder={key === 'image' ? '/your-car.jpg or https://...' : ''} /></label>)}</div>
            <button className="button button-primary">Publish vehicle</button><small className="helper">Upload images to Supabase Storage later and paste the public URL into Image.</small>
          </form>
          <div className="panel"><h2>Current inventory</h2><div className="inventory-list">{data?.vehicles?.map((v) => <div key={v.id}><img src={v.image || '/porsche-black.jpg'} alt="" /><span><strong>{v.name}</strong><small>{v.status} · {v.currency} {Number(v.price_amount).toLocaleString()}</small></span></div>)}</div></div>
        </div>}
        {active === 'orders' && <OrderTable orders={data?.orders} onStatus={setOrderStatus} />}
        {active === 'bids' && <div className="panel"><h2>Bid activity</h2><div className="table-wrap"><table><thead><tr><th>Bidder</th><th>Vehicle</th><th>Bid</th><th>Status</th></tr></thead><tbody>{data?.bids?.map((bid) => <tr key={bid.id}><td>{bid.customer_name}<small>{bid.customer_phone}</small></td><td>{bid.vehicle_name}</td><td>{bid.currency} {Number(bid.amount).toLocaleString()}</td><td><span className="status-pill">{bid.status}</span></td></tr>)}</tbody></table></div></div>}
      </section>
    </main>
  );
}

function OrderTable({ orders = [], onStatus }) {
  return <div className="panel"><div className="panel-heading"><div><h2>Orders</h2><p>Review reservations and move them through fulfilment.</p></div></div><div className="table-wrap"><table><thead><tr><th>Customer</th><th>Vehicle</th><th>Amount</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.customer_name}<small>{order.customer_phone}</small></td><td>{order.vehicle_name}</td><td>{order.currency} {Number(order.amount).toLocaleString()}</td><td><select className="status-select" value={order.status} onChange={(e) => onStatus(order.id, e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="paid">Paid</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table>{!orders.length && <p className="empty-row">No orders yet.</p>}</div></div>;
}
