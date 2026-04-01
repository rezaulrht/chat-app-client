import React from "react";
import LenisRoot from "@/components/LenisRoot";

import HeroSection      from "@/components/Landing/HeroSection";
import DemoSection      from "@/components/Landing/DemoSection";
import Features         from "@/components/Landing/Features";
import StickyStory      from "@/components/Landing/StickyStory";
import UseCases         from "@/components/Landing/UseCases";
import CompetitiveEdge  from "@/components/Landing/CompetitiveEdge";
import Analytics        from "@/components/Landing/Analytics";
import Faq              from "@/components/Landing/Faq";
import CustomerSlider   from "@/components/Landing/CustomerSlider";

export default function HomePage() {
  return (
    <LenisRoot>
      <div>
        <HeroSection />
        <DemoSection />
        <Features />
        <StickyStory />
        <UseCases />
        <CompetitiveEdge />
        <Analytics />
        <Faq />
        <CustomerSlider />
      </div>
    </LenisRoot>
  );
}
