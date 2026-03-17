"use client";

import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const LENIS_EXCLUDED_PATHS = ["/chat", "/app/workspace", "/app/feed", "/feed"];

/**
 * LenisProvider
 *
 * Wraps the entire app with Lenis smooth-scroll.
 * Syncs Lenis' RAF into GSAP's ticker so GSAP ScrollTrigger animations
 * and all other GSAP scroll-driven work stay perfectly in lock-step.
 *
 * Lenis is disabled on chat, workspace, and feed routes where native
 * scroll behaviour is required.
 */
export default function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  const isExcluded = LENIS_EXCLUDED_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (isExcluded) return;

    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Give lenis a tick to initialise, then wire up ScrollTrigger
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
  }, [isExcluded]);

  if (isExcluded) {
    return <>{children}</>;
  }

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
