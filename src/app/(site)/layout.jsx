import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
