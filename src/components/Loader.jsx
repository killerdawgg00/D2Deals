import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Simple full-screen loader where the D2Deals logo
// "stomps" in and then races off to the right.
function Loader({ onComplete }) {
  const wrapperRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        // Give a tiny delay so the motion feels complete, then hide loader
        setTimeout(() => {
          onComplete?.();
        }, 150);
      },
    });

    // Start off-screen above and scaled down
    gsap.set(logoRef.current, {
      y: -200,
      scale: 0.6,
      rotation: -8,
      opacity: 0,
    });

    // "Stomp" in: drop down with squash & bounce
    tl.to(logoRef.current, {
      duration: 0.6,
      y: 0,
      opacity: 1,
      scale: 1,
      rotation: 0,
      ease: 'back.out(1.8)',
    })
      // Brief idle + subtle engine rev shake
      .to(
        logoRef.current,
        {
          duration: 0.35,
          rotation: 1.5,
          yoyo: true,
          repeat: 3,
        },
        '+=0.15'
      )
      // Race off to the right with slight blur and fade
      .to(logoRef.current, {
        duration: 0.6,
        x: 500,
        opacity: 0,
        ease: 'power4.in',
      })
      // Fade out the entire loader screen after logo drives off
      .to(
        wrapperRef.current,
        {
          duration: 0.5,
          opacity: 0,
          ease: 'power2.in',
        },
        '-=0.2' // Start fading slightly before logo fully disappears
      );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={wrapperRef} className="loader">
        <div className="loader-bg" />
      <div className="loader-track">
        <img
          ref={logoRef}
          src="/d2deals-logo.png"
          alt="D2Deals loading"
          className="loader-logo"
        />
      </div>
    </div>
  );
}

export default Loader;


