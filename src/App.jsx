import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import Home from './components/Home';
import About from './components/About';
import Vehicles from './components/Vehicles';
import Financing from './components/Financing';
import Footer from './components/Contact';
import SmoothScrolling from './components/SmoothScrolling';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!showLoader && contentRef.current) {
      // Fade in the main content smoothly after loader completes
      gsap.from(contentRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, [showLoader]);

  return (
    <div className="App">
      {showLoader && (
        <Loader
          onComplete={() => {
            setShowLoader(false);
          }}
        />
      )}

      {/* Main content that fades in after loader */}
      <div
        ref={contentRef}
        style={{
          opacity: showLoader ? 0 : 1,
          pointerEvents: showLoader ? 'none' : 'auto',
        }}
      >
        {/* Navbar fixed at the top */}
        <Navbar />
        {/* Smooth, eased scrolling across the whole page */}
        <SmoothScrolling>
          <Home />
          <Vehicles />
          <Financing />
          <About />
          <Footer />
        </SmoothScrolling>
      </div>
    </div>
  );
}

export default App;