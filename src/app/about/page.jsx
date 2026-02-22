// src/app/about/page.jsx
import AboutSection from "@/components/AboutUs/Hero&Features";
import StoryAndCTA from "@/components/AboutUs/Story&CTA";
import TeamSection from "@/components/AboutUs/TeamSection";

export default function AboutPage() {
  return (
    <main>
      <AboutSection />
      <TeamSection />
      <StoryAndCTA />
    </main>
  );
}
