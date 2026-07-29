import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 80);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const close = () => setOpen(false);
  return (
    <header className={`navbar ${solid ? 'navbar-solid' : ''}`}>
      <a className="nav-logo" href="#home" aria-label="D2Deals home"><img src="/d2deals-logo.png" alt="D2Deals" /></a>
      <button className="nav-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open menu"><span /><span /></button>
      <nav className={open ? 'open' : ''}>
        <a href="#inventory" onClick={close}>Find a car</a>
        <a href="#how-it-works" onClick={close}>How it works</a>
        <a href="#contact" onClick={close}>Contact</a>
        <Link className="nav-admin" to="/admin">Admin</Link>
      </nav>
    </header>
  );
}
