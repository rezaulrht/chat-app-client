import React from "react";
import CustomerReview from "./about/review/page";
import HeroSection from "@/components/Landing/HeroSection";
import Features from "@/components/Landing/Features";
import UseCases from "@/components/Landing/UseCases";
import Integrations from "@/components/Landing/Integrations";
import CompetitiveEdge from "@/components/Landing/CompetitiveEdge";
import Faq from "@/components/home/Faq";
import Analytics from "@/components/home/Analytics";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <Features />
      <UseCases />
      <Integrations />
      <CompetitiveEdge />
      <Analytics />
      <Faq/>
      <CustomerReview />
    </div>
  );
}
