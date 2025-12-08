import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGES = [
  '/porsche-black.jpg',
  '/bmw-m50i-rear.jpg',
  '/luxury-2022-bmw 2.jpg',
  '/2022 Honda Civic Sport hatch.jpg',
  '/amg-v8-biturbo.jpg',
];

function Hero() {
  const containerRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const currentIndexRef = useRef(0);
  const activeLayerRef = useRef(0); // 0 = layer1, 1 = layer2
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const preloadedImagesRef = useRef(new Set());

  // Preload images
  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      preloadedImagesRef.current.add(src);
    });
  }, []);

  // Initialize layers
  useEffect(() => {
    if (!layer1Ref.current || !layer2Ref.current) return;

    // Set initial state: layer1 visible, layer2 hidden
    gsap.set(layer1Ref.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      zIndex: 2,
    });

    gsap.set(layer2Ref.current, {
      opacity: 0,
      scale: 1.03,
      y: 20,
      zIndex: 1,
    });

    // Set initial image on layer1
    if (layer1Ref.current) {
      layer1Ref.current.style.backgroundImage = `linear-gradient(120deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.35)), url("${HERO_IMAGES[0]}")`;
    }
  }, []);

  // Transition function - matches shed.design exactly
  const transitionToNext = () => {
    if (!layer1Ref.current || !layer2Ref.current) return;

    const currentIndex = currentIndexRef.current;
    const activeLayer = activeLayerRef.current;
    const nextIndex = (currentIndex + 1) % HERO_IMAGES.length;
    const outgoingLayer = activeLayer === 0 ? layer1Ref.current : layer2Ref.current;
    const incomingLayer = activeLayer === 0 ? layer2Ref.current : layer1Ref.current;

    // Preload next image
    const nextImg = new Image();
    nextImg.src = HERO_IMAGES[nextIndex];

    // Set incoming image
    incomingLayer.style.backgroundImage = `linear-gradient(120deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.35)), url("${HERO_IMAGES[nextIndex]}")`;

    // Set z-index: incoming on top
    gsap.set(incomingLayer, { zIndex: 2 });
    gsap.set(outgoingLayer, { zIndex: 1 });

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline for smooth transition
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        currentIndexRef.current = nextIndex;
        activeLayerRef.current = activeLayer === 0 ? 1 : 0;
      },
    });

    // Outgoing: fade out + scale down (1.00 → 0.97) + move down 20px
    tl.to(
      outgoingLayer,
      {
        opacity: 0,
        scale: 0.97,
        y: 20,
        duration: 1.6,
        ease: 'power2.inOut',
      },
      0
    );

    // Incoming: fade in + scale down (1.03 → 1.00) + move up 20px
    tl.fromTo(
      incomingLayer,
      {
        opacity: 0,
        scale: 1.03,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.6,
        ease: 'power2.inOut',
      },
      0
    );

    timelineRef.current = tl;
  };

  // Auto-advance every 6-8 seconds
  useEffect(() => {
    // Random interval between 6000-8000ms for organic feel
    const getRandomInterval = () => Math.random() * 2000 + 6000;

    const scheduleNext = () => {
      intervalRef.current = setTimeout(() => {
        transitionToNext();
        scheduleNext();
      }, getRandomInterval());
    };

    // Start after initial delay
    const initialDelay = setTimeout(() => {
      scheduleNext();
    }, 6000);

    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  // Parallax scroll effect
  useGSAP(
    () => {
      if (!containerRef.current || !layer1Ref.current || !layer2Ref.current) return;

      const layers = [layer1Ref.current, layer2Ref.current];

      layers.forEach((layer) => {
        gsap.to(layer, {
          y: -150,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    },
    { scope: containerRef }
  );

  // Hero text animations - text is visible by default, just animates in
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

      gsap.from('.hero-kicker', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="hero">
      {/* Two absolutely positioned image layers */}
      <div className="hero-slideshow">
        <div
          ref={layer1Ref}
          className="hero-slide hero-slide--layer"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          ref={layer2Ref}
          className="hero-slide hero-slide--layer"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      {/* Hero content overlay */}
      <div className="hero-inner">
        <span className="hero-kicker">This is D2Deals Driveway</span>
        <h1 className="hero-title">
          Performance cars, driveway ready.
          <br />
          <br />
        </h1>
        <p className="hero-subtitle">
          We help you move from dream spec to parked outside – with a process that feels as premium
          as the cars we source.
        </p>
      </div>
    </section>
  );
}

export default Hero;

