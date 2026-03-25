import { useContext } from "react";
import { FeedContext } from "@/context/FeedContext";

export default function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used inside <FeedProvider>");
  return ctx;
}
