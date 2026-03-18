// src/app/about/page.jsx
import LenisRoot from "@/components/LenisRoot";
import AboutSection from "@/components/AboutUs/Hero&Features";
import StoryAndCTA from "@/components/AboutUs/Story&CTA";
import TeamSection from "@/components/AboutUs/TeamSection";

export default function AboutPage() {
  return (
    <LenisRoot>
      <main>
        <AboutSection />
        <TeamSection />
        <StoryAndCTA />
      </main>
    </LenisRoot>
  );
}
