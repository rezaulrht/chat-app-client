import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full bg-obsidian items-center justify-center" role="status" aria-live="polite" aria-busy="true">
      <Loader2 size={32} className="text-accent animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
