"use client";

import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * LenisRoot
 *
 * Drop-in smooth-scroll wrapper for individual pages that need Lenis
 * (landing, about, contact). Not used globally — avoids interfering
 * with chat/workspace/feed native scroll.
 */
export default function LenisRoot({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const t = setTimeout(() => {
      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);
        ScrollTrigger.refresh();
      }
    }, 100);

    return () => {
      gsap.ticker.remove(update);
      clearTimeout(t);
      lenisRef.current?.lenis?.off("scroll", ScrollTrigger.update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.1,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
