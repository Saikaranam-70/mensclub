import React, { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';

export default function LoadingScreen() {
  const [mounted, setMounted] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fading out after 2.1 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2100);

    // Unmount completely after fade animation completes (2.6 seconds total)
    const unmountTimer = setTimeout(() => {
      setMounted(false);
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        {/* Animated glowing background */}
        <div className="barber-pole-glow" />
        
        {/* Scissors Icon Logo container with spinning outline */}
        <div className="logo-pulse-box">
          <div className="spinning-circle-gold" />
          <Scissors className="scissors-logo-animated" size={48} />
        </div>
        
        {/* Split name anim */}
        <h1 className="loading-title">
          {"MEN'S CLUB".split("").map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 80}ms` }} className="char-fade">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        
        <div className="loading-sub">BARBER SHOP</div>
        
        {/* Loading Progress Line */}
        <div className="loading-line-wrapper">
          <div className="loading-line-progress" />
        </div>
      </div>
    </div>
  );
}
