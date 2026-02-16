import React from "react";
import CustomerReview from "./about/review/page";
import HeroSection from "@/components/Landing/HeroSection";
import Features from "@/components/Landing/Features";
import UseCases from "@/components/Landing/UseCases";
import Integrations from "@/components/Landing/Integrations";
import CompetitiveEdge from "@/components/Landing/CompetitiveEdge";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <Features />
      <UseCases />
      <Integrations />
      <CompetitiveEdge />
      <CustomerReview />
    </div>
  );
}
