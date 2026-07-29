function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer-cta">
        <span className="eyebrow">Need help finding a specific car?</span>
        <h2>Tell us the spec.<br />We’ll find the keys.</h2>
        {/* Replace this link with your preferred WhatsApp/phone contact. */}
        <a className="button button-light" href="https://linktr.ee/D2deals#495651177" target="_blank" rel="noreferrer">Talk to our team ↗</a>
      </div>
      <div className="footer-bottom"><img src="/d2deals-logo.png" alt="D2Deals" /><p>Curated cars. Confident decisions.</p><span>© {new Date().getFullYear()} D2Deals Driveway</span></div>
    </footer>
  );
}
export default Footer;
