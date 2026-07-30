import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../lib/api';
import { vehicles as fallbackVehicles } from '../data/vehicles';

gsap.registerPlugin(ScrollTrigger);

const money = (value, currency = 'GHS') =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value));

export default function Marketplace() {
  const root = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState('');
  const [make, setMake] = useState('All makes');
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('buy');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.vehicles('?status=available,auction,rental')
      .then(({ vehicles: rows }) => setVehicles(rows))
      .catch(() => setVehicles(fallbackVehicles.map((car) => ({
        ...car,
        make: car.name.split(' ')[1],
        year: Number(car.name.split(' ')[0]),
        price_amount: Number(car.price.replace(/[^\d]/g, '')),
        currency: car.price.includes('USD') ? 'USD' : 'GHS',
        mileage: 28000,
        transmission: 'Automatic',
        status: 'available',
      }))));
  }, []);

  useGSAP(() => {
    gsap.from('.hero-copy > *', { y: 36, opacity: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out' });
    gsap.from('.search-panel', { y: 28, opacity: 0, duration: 0.7, delay: 0.35, ease: 'power3.out' });
    gsap.utils.toArray('.reveal').forEach((element) => {
      gsap.from(element, { y: 42, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
    });
  }, { scope: root });

  const makes = useMemo(() => ['All makes', ...new Set(vehicles.map((car) => car.make).filter(Boolean))], [vehicles]);
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    const list = vehicles.filter((car) =>
      (!normalized || `${car.name} ${car.make} ${car.model}`.toLowerCase().includes(normalized)) &&
      (make === 'All makes' || car.make === make));
    return [...list].sort((a, b) => sort === 'price-low' ? Number(a.price_amount) - Number(b.price_amount) :
      sort === 'price-high' ? Number(b.price_amount) - Number(a.price_amount) : Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [vehicles, query, make, sort]);

  const openAction = (car, action) => {
    setSelected(car);
    setMode(action);
    setNotice('');
  };

  const submitAction = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === 'bid') {
        await api.createBid({ ...data, vehicle_id: selected.id, amount: Number(data.amount) });
        setNotice('Bid submitted. We’ll contact you after it is reviewed.');
      } else {
        await api.createOrder({ ...data, vehicle_id: selected.id, order_type: mode, amount: selected.price_amount });
        setNotice(mode === 'buy' ? 'Order reserved. Payment will be completed when the gateway is connected.' : 'Your viewing request is booked.');
      }
      event.currentTarget.reset();
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <main ref={root}>
      <section className="market-hero" id="home">
        <div className="hero-media" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="eyebrow">Accra’s curated auto marketplace</span>
          <h1>Find it. Bid on it.<br />Drive it home.</h1>
          <p>Verified luxury, performance and everyday cars — with transparent pricing and a team beside you from search to handover.</p>
          <div className="hero-actions">
            <a href="#inventory" className="button button-primary">Explore cars <span>↗</span></a>
            <a href="#how-it-works" className="button button-ghost">How it works</a>
          </div>
        </div>
        <div className="trust-strip"><span>✓ Inspected inventory</span><span>✓ Secure bidding</span><span>✓ Nationwide delivery</span></div>
      </section>

      <section className="inventory-section" id="inventory">
        <div className="section-heading reveal">
          <div><span className="eyebrow red">Live inventory</span><h2>Your next car is here.</h2></div>
          <p>{filtered.length} vehicles matched</p>
        </div>
        <div className="search-panel reveal">
          <label className="search-field"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by make, model or year" /></label>
          <select value={make} onChange={(e) => setMake(e.target.value)} aria-label="Filter by make">{makes.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort inventory">
            <option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </div>
        <div className="vehicle-grid">
          {filtered.map((car) => (
            <article className="car-card reveal" key={car.id}>
              <div className="car-image">
                <img src={car.image || '/porsche-black.jpg'} alt={car.name} loading="lazy" />
                <span className="car-status">{car.status === 'auction' ? 'Live auction' : car.status === 'rental' ? 'Available to rent' : 'Available now'}</span>
                {car.featured && <span className="featured-badge">Featured</span>}
              </div>
              <div className="car-info">
                <p className="car-meta">{car.year || ''} · {car.transmission || 'Automatic'} · {Number(car.mileage || 0).toLocaleString()} km</p>
                <h3>{car.name}</h3>
                <p className="car-price">{money(car.price_amount, car.currency)}</p>
                <div className="car-actions">
                  <button className="button button-dark" onClick={() => openAction(car, 'buy')}>Buy now</button>
                  <button className="button button-outline" onClick={() => openAction(car, 'bid')}>Place bid</button>
                </div>
              </div>
            </article>
          ))}
          {!filtered.length && <div className="empty-state">No cars match those filters. Try a different make or search.</div>}
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="section-heading reveal"><div><span className="eyebrow red">Simple by design</span><h2>From shortlist to driveway.</h2></div></div>
        <div className="process-grid">
          {[['01', 'Search with confidence', 'Filter a curated inventory with clear specs and up-front pricing.'], ['02', 'Buy or make your bid', 'Reserve at the listed price or submit a competitive offer in minutes.'], ['03', 'We handle the handover', 'Our team confirms your order, coordinates payment and arranges delivery.']].map(([n, title, copy]) => (
            <article className="process-card reveal" key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="action-modal" role="dialog" aria-modal="true" aria-labelledby="action-title">
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <span className="eyebrow red">{mode === 'bid' ? 'Make an offer' : mode === 'buy' ? 'Reserve this car' : 'Book a viewing'}</span>
            <h2 id="action-title">{selected.name}</h2>
            <p className="modal-price">{money(selected.price_amount, selected.currency)}</p>
            {notice ? <div className="form-notice">{notice}</div> : (
              <form onSubmit={submitAction} className="action-form">
                <label>Full name<input name="customer_name" required placeholder="Your name" /></label>
                <label>Email address<input name="customer_email" type="email" required placeholder="you@example.com" /></label>
                <label>Phone number<input name="customer_phone" required placeholder="+233 ..." /></label>
                {mode === 'bid' && <label>Your bid ({selected.currency})<input name="amount" type="number" min="1" required placeholder={selected.price_amount} /></label>}
                <button className="button button-primary" type="submit">{mode === 'bid' ? 'Submit bid' : 'Reserve vehicle'}</button>
                <small>No payment is taken yet. The payment provider connects at the marked backend hook.</small>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
