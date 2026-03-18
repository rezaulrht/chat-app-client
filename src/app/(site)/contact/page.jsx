import LenisRoot from "@/components/LenisRoot";
import Contact from "@/components/Contact/Contact";
import FAQSection from "@/components/Contact/FAQSection";

export default function Page() {
  return (
    <LenisRoot>
      <main>
        <Contact />
        <FAQSection />
      </main>
    </LenisRoot>
  );
}