import React from "react";

import HeroSection from "@/components/Landing/HeroSection";
import Features from "@/components/Landing/Features";
import UseCases from "@/components/Landing/UseCases";
import Integrations from "@/components/Landing/Integrations";
import CompetitiveEdge from "@/components/Landing/CompetitiveEdge";
import Faq from "@/components/Landing/Faq";
import Analytics from "@/components/Landing/Analytics";
import CustomerSlider from "@/components/Landing/CustomerSlider";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <Features />
      <UseCases />
      <Integrations />
      <CompetitiveEdge />
      <Analytics />
      <Faq />
      <CustomerSlider />
    </div>
  );
}
