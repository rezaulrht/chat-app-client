"use client";

import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";

/**
 * LenisProvider
 *
 * Wraps the entire app with Lenis smooth-scroll.
 * Syncs Lenis' RAF into GSAP's ticker so GSAP ScrollTrigger animations
 * and all other GSAP scroll-driven work stay perfectly in lock-step.
 */
export default function LenisProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0); // prevent frame-drop jitter

    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,   // driven by GSAP ticker instead
        lerp: 0.1,        // smoothness factor (0 = instant, 1 = never arrives)
        duration: 1.2,    // scroll animation duration in seconds
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
