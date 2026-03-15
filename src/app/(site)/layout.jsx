import { FeedProvider } from "@/context/FeedProvider";

export default function SiteLayout({ children }) {
  return <FeedProvider>{children}</FeedProvider>;
}
