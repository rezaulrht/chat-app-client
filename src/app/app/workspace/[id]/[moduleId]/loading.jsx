import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full bg-obsidian items-center justify-center">
      <Loader2 size={32} className="text-accent animate-spin" />
    </div>
  );
}
