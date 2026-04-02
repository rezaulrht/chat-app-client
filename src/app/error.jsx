"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", error);
    }
  }, [error]);

  return (
    <div className="flex h-full w-full bg-obsidian items-center justify-center flex-col gap-4 p-4">
      <h2 className="text-xl font-bold text-ivory">Something went wrong</h2>
      <p className="text-ivory/50 text-sm">An unexpected error occurred</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-accent text-black rounded-lg font-bold"
      >
        Try again
      </button>
    </div>
  );
}
