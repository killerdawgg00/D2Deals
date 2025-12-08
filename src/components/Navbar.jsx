import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hasBackground, setHasBackground] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    closeMenu();
  };

  /* -----------------------------
     CLOSE MENU WHEN CLICKING OUTSIDE
  ------------------------------ */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".navbar-inner")) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  /* -----------------------------
     HIDE NAVBAR ON SCROLL & ADD BACKGROUND
  ------------------------------ */
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const heroHeight = document.querySelector('.hero')?.offsetHeight || 0;

      // Add background when scrolled past hero section
      setHasBackground(currentY > heroHeight * 0.5);

      if (!isMenuOpen) {
        if (currentY > lastY && currentY > 50) {
          setHidden(true); // scrolling down
        } else {
          setHidden(false); // scrolling up
        }
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  /* -----------------------------
     NAVBAR UI
  ------------------------------ */
  return (
    <header className={`navbar ${hidden ? "navbar--hidden" : ""} ${hasBackground ? "navbar--with-background" : ""}`}>
      <nav className="navbar-inner">

        {/* LOGO */}
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
          <img src="/d2deals-logo.png" alt="D2Deals Driveway" />
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          className="nav-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={isMenuOpen ? "open" : ""}></span>
          <span className={isMenuOpen ? "open" : ""}></span>
          <span className={isMenuOpen ? "open" : ""}></span>
        </button>

        {/* BACKDROP */}
        {isMenuOpen && <div className="nav-backdrop" onClick={closeMenu}></div>}

        {/* MENU LINKS */}
        <div className={`nav-links ${isMenuOpen ? "nav-links--open" : ""}`}>
          <button type="button" className="nav-link" onClick={() => scrollToSection('vehicles')}>
            Vehicles
          </button>
          <button type="button" className="nav-link" onClick={() => scrollToSection('financing')}>
            Financing
          </button>
          <button type="button" className="nav-link" onClick={() => scrollToSection('contact')}>
            Contact
          </button>
        </div>
      </nav>
    </header>
  );
}
