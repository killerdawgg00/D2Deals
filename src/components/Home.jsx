import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ✏️ Configure your hero slideshow images here
// Add as many images as you want - they'll cycle automatically
// Images will cross-fade smoothly with parallax scroll effect
const HERO_IMAGES = [
  '/porsche-black.jpg',
  '/bmw-m50i-rear.jpg',
  '/luxury-2022-bmw 2.jpg',
  '/2022 Honda Civic Sport hatch.jpg',
  '/amg-v8-biturbo.jpg',
];

// Simple configuration for your scroll sections.
// ✏️ Change titles, descriptions, background colors and images here.
// Put any real images you want to use in `public/` and reference them as `/your-image.jpg`.
const SCROLL_SECTIONS = [
  {
    id: 'services',
    label: 'Core Services',
    title: 'From driveway to dream ride',
    description:
      'Sourcing, inspecting and delivering performance cars with a white-glove experience from first call to final handover.',
    // Background behind the content
    backgroundColor: '#111111',
    // Background for the large image panel – you can swap this for a real photo
    imageBackground: 'url("/bmw-m50i-rear.jpg")',
  },
  {
    id: 'stock',
    label: 'Featured Stock',
    title: 'Curated machines, zero compromise',
    description:
      'Hand-picked SUVs, performance coupes and luxury daily drivers. Every car is vetted so you never have to guess.',
    backgroundColor: '#0b0b0b',
    // Uses the AMG engine photo from the public folder
    imageBackground: 'url("/luxury-2022-bmw 2.jpg")',
  },
  {
    id: 'experience',
    label: 'Experience',
    title: 'Built around how you actually buy',
    description:
      'Transparent pricing, honest advice and a process that respects your time. From remote viewings to doorstep delivery.',
    backgroundColor: '#111111',
    // Swap this for another real image you have in /public (e.g. /range-rover-svr.jpg)
    imageBackground: 'url("/2022 Honda Civic Sport hatch.jpg")',
  },
];

function Home() {
  const mainRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroSlideshowRef = useRef(null);
  const imageRefs = useRef([]);

  // Initial setup: position all slides correctly with cross-fade
  useEffect(() => {
    imageRefs.current.forEach((ref, index) => {
      if (ref) {
        if (index === 0) {
          gsap.set(ref, { opacity: 1, zIndex: 2, y: 0 });
        } else {
          gsap.set(ref, { opacity: 0, zIndex: 1, y: 0 });
        }
      }
    });
  }, []);

  // Auto-advance slideshow
  // ✏️ Configure transition timing: change 5000 to adjust how often images switch (in milliseconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Cross-fade transition when image changes
  useEffect(() => {
    if (!heroSlideshowRef.current || imageRefs.current.length === 0) return;

    const currentImage = imageRefs.current[currentImageIndex];
    const prevImageIndex = currentImageIndex === 0 ? HERO_IMAGES.length - 1 : currentImageIndex - 1;
    const prevImage = imageRefs.current[prevImageIndex];

    if (!currentImage) return;

    // Set z-index: current on top, previous below
    gsap.set(currentImage, { zIndex: 2 });
    if (prevImage) {
      gsap.set(prevImage, { zIndex: 1 });
    }

    // Cross-fade: fade out previous, fade in current
    // ✏️ Configure transition: change duration (1.5) and ease ('power2.inOut') to adjust fade speed/feel
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' }, // Smooth easing for cross-fade
    });

    if (prevImage) {
      tl.to(prevImage, {
        opacity: 0,
        duration: 1.5, // Fade out duration
      });
    }

    tl.fromTo(
      currentImage,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.5, // Fade in duration (matches fade out for smooth cross-fade)
      },
      0 // Start at the same time for true cross-fade effect
    );

    return () => {
      tl.kill();
    };
  }, [currentImageIndex]);

  // Parallax scroll effect for hero background
  // ✏️ Configure parallax: change y value (-150) to adjust movement distance (more = more movement)
  useGSAP(
    () => {
      if (!heroSlideshowRef.current) return;

      const slides = imageRefs.current.filter(Boolean);
      slides.forEach((slide) => {
        if (slide) {
          gsap.to(slide, {
            y: -150, // Parallax movement distance (negative = moves up as you scroll down)
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 1, // Smooth scrubbing (1 = smooth, higher = more responsive)
            },
          });
        }
      });
    },
    { scope: heroSlideshowRef }
  );

  useGSAP(
    () => {
      // Fade + slide in hero text on load
    gsap.from('.hero-title', {
        y: 80,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
        delay: 0.2,
    });

    gsap.from('.hero-subtitle', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.4,
      });

      // Section headings + body text animate in when scrolled into view
      gsap.utils.toArray('.scroll-section').forEach((section) => {
        const heading = section.querySelector('.section-heading');
        const body = section.querySelector('.section-body');
        const image = section.querySelector('.section-image-inner');

        if (heading) {
          gsap.from(heading, {
            y: 60,
      opacity: 0,
            duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        if (body) {
          gsap.from(body, {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: 0.1,
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        // Image fades in and moves slightly for a subtle scroll effect
        if (image) {
          gsap.from(image, {
            y: 80,
      opacity: 0,
            duration: 1,
            ease: 'power3.out',
      scrollTrigger: {
              trigger: section,
        start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          });

          gsap.to(image, {
            y: -40,
        ease: 'none',
        scrollTrigger: {
              trigger: section,
          start: 'top bottom',
          end: 'bottom top',
              scrub: true,
            },
          });
        }
      });
    },
    { scope: mainRef }
  );

  return (
    <main ref={mainRef} className="page-wrapper">
      {/* HERO */}
      <section className="hero">
        {/* Slideshow background */}
        <div ref={heroSlideshowRef} className="hero-slideshow">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={index}
              ref={(el) => (imageRefs.current[index] = el)}
              className="hero-slide"
              style={{
                backgroundImage: `linear-gradient(120deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.35)), url("${image}")`,
              }}
            />
          ))}
        </div>

        <div className="hero-inner">
          <span className="hero-kicker">This is D2Deals Driveway</span>
          <h1 className="hero-title">
            Performance cars,
            <br />
            driveway ready.
        </h1>
          <p className="hero-subtitle">
            We help you move from dream spec to parked outside – with a process that feels as premium
            as the cars we source.
          </p>
        </div>
      </section>

      {/* SCROLL SECTIONS WITH CHANGING IMAGES / BACKGROUNDS */}
      {SCROLL_SECTIONS.map((section) => {
        // Decide whether this section uses a gradient color or a real image URL.
        // If `imageBackground` starts with `url(`, we treat it as a background image.
        const usesImage = typeof section.imageBackground === 'string' && section.imageBackground.startsWith('url(');

        const imageStyle = usesImage
          ? {
              backgroundImage: section.imageBackground,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {
              background: section.imageBackground,
            };

        return (
        <section
          key={section.id}
          className="scroll-section"
          style={{ backgroundColor: section.backgroundColor }}
        >
          <div className="scroll-section-inner">
            {/* Text column */}
            <div className="section-text">
              <span className="section-label">{section.label}</span>
              <h2 className="section-heading">{section.title}</h2>
              <p className="section-body">{section.description}</p>
          </div>

            {/* Image / visual column */}
            <div className="section-image">
              <div
                className="section-image-inner"
                style={imageStyle}
              />
            </div>
          </div>
        </section>
        );
      })}

      {/* SIMPLE CTA SECTION */}
      <section className="scroll-section scroll-section--final">
  <div className="scroll-section-inner scroll-section-inner--final">
    <div className="section-text">
      <span className="section-label">Let&apos;s talk</span>
      <h2 className="section-heading">Have a car in mind?</h2>
      <p className="section-body">
        Share the spec, budget and timeline – we&apos;ll handle the hunt, the checks and the handover.
      </p>

      <a
        href="https://linktr.ee/D2deals#495651177"
        target="_blank"
        rel="noopener noreferrer"
        className="primary-button"
      >
        Reach me here 👋🏾
      </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;


