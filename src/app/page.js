import HeroSection from "@/components/Landing/HeroSection";
import Features from "@/components/Landing/Features";
import UseCases from "@/components/Landing/UseCases";
import Integrations from "@/components/Landing/Integrations";
import CompetitiveEdge from "@/components/Landing/CompetitiveEdge";

export default function Home() {
  return (
    <main className="bg-[#05050A]">
      <HeroSection />
      <Features />
      <UseCases />
      <Integrations />
      <CompetitiveEdge />
    </main>
  );
}
