import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { FeedProvider } from "@/context/FeedProvider";

export default function SiteLayout({ children }) {
  return (
    <FeedProvider>
      <NavBar />
      {children}
      <Footer />
    </FeedProvider>
  );
}
