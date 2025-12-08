import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vehicles } from '../data/vehicles.js';

gsap.registerPlugin(ScrollTrigger);

function Vehicles() {
  const mainRef = useRef(null);

  useGSAP(
    () => {
      // Fade in page title
      gsap.from('.vehicles-title', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
      });

      // Stagger vehicle cards
      gsap.from('.vehicle-card', {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.vehicles-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    },
    { scope: mainRef, dependencies: [vehicles.length] }
  );

  return (
    <main ref={mainRef} id="vehicles" className="vehicles-page">
      <div className="vehicles-container">
        {/* Page Header */}
        <section className="vehicles-header">
          <span className="vehicles-kicker">Our Inventory</span>
          <h1 className="vehicles-title">Premium Vehicles</h1>
          <p className="vehicles-subtitle">
            Hand-picked selection of luxury and performance vehicles, each inspected and ready for delivery.
          </p>
        </section>

        {/* Vehicles Grid */}
        <section className="vehicles-grid">
          {vehicles.length === 0 ? (
            <div className="vehicles-status">
              <p>No vehicles available yet.</p>
            </div>
          ) : (
            vehicles.map((vehicle) => {
              // Ensure image path is correct (add leading slash if missing)
              const imagePath = vehicle.image 
                ? (vehicle.image.startsWith('/') ? vehicle.image : `/${vehicle.image}`)
                : '/porsche-black.jpg'; // Default fallback image
              
              return (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-image-wrapper">
                    <img
                      src={imagePath}
                      alt={vehicle.name || 'Vehicle'}
                      className="vehicle-image"
                      loading="lazy"
                      onError={(e) => {
                        // Try fallback images
                        if (e.target.src !== '/porsche-black.jpg') {
                          e.target.src = '/porsche-black.jpg';
                        } else if (e.target.src !== '/bmw-m50i-rear.jpg') {
                          e.target.src = '/bmw-m50i-rear.jpg';
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                    <div className="vehicle-overlay">
                      <span className="vehicle-price">{vehicle.price || 'Price on Request'}</span>
                    </div>
                  </div>
                  <div className="vehicle-content">
                    <h2 className="vehicle-name">{vehicle.name || 'Vehicle'}</h2>
                    <p className="vehicle-description">{vehicle.description || 'Premium vehicle available for purchase.'}</p>
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="vehicle-features">
                        {vehicle.features.map((feature, index) => (
                          <span key={index} className="vehicle-feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                    <a
                      href="https://linktr.ee/D2deals#495651177"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vehicle-cta-button"
                    >
                      Inquire Now
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </section>
        
        {/* CTA Section */}
        <section className="vehicles-cta">
          <h2>Don't see what you're looking for?</h2>
          <p>We can source any vehicle to your specifications. Get in touch and let's find your perfect ride.</p>
          <a
            href="https://linktr.ee/D2deals#495651177"
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button"
          >
            Contact Us
          </a>
        </section>
      </div>
    </main>
  );
}

export default Vehicles;
