import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function About() {
  const container = useRef();
  const placeholderVideoRef = useRef(null);
  const expandedVideoRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useGSAP(() => {
    // Animate when you scroll to this section
    gsap.from('.about-content', {
      x: -100,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: '.about-content',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }, { scope: container });

  const handleVideoClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Enable sound when expanded and play
      if (expandedVideoRef.current) {
        expandedVideoRef.current.muted = false;
        expandedVideoRef.current.play();
      }
    }
  };

  const handleCloseExpanded = (e) => {
    // Only close if clicking the backdrop or close button, not the video itself
    if (
      e.target.classList.contains('about-video-expanded-backdrop') ||
      e.target.closest('.about-video-close')
    ) {
      setIsExpanded(false);
      if (expandedVideoRef.current) {
        expandedVideoRef.current.pause();
        expandedVideoRef.current.muted = true;
        // Reset video to beginning
        expandedVideoRef.current.currentTime = 0;
      }
    }
  };

  const handleExpandedVideoClick = (e) => {
    // Prevent closing when clicking the video itself
    e.stopPropagation();
  };

  return (
    <div ref={container} id="about" className="about">
      <h2>About The Ceo </h2>
      <div className="about-content">
        <div className="about-video-placeholder" onClick={handleVideoClick}>
          <video
            ref={placeholderVideoRef}
            src="/D2.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="about-video"
          />
          <div className="about-video-overlay">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="https://www.w3.org/2000/svg"
              className="about-play-icon"
            >
              <circle cx="32" cy="32" r="30" fill="rgba(255, 255, 255, 0.9)" />
              <path
                d="M26 20L26 44L44 32L26 20Z"
                fill="#000"
              />
            </svg>
          </div>
        </div>
        <div className="about-text">
          
        </div>
      </div>

      {/* Expanded video modal */}
      {isExpanded && (
        <div
          className="about-video-expanded-backdrop"
          onClick={handleCloseExpanded}
        >
          <div className="about-video-expanded-container">
            <button
              className="about-video-close"
              onClick={handleCloseExpanded}
              aria-label="Close video"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <video
              ref={expandedVideoRef}
              src="/D2.mp4"
              autoPlay
              muted={false}
              loop
              playsInline
              controls
              className="about-video-expanded"
              onClick={handleExpandedVideoClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default About;