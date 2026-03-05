import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import {  Toaster } from "sonner"; 

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "ConvoX | Intelligent Professional Communication",
  description:
    "Experience the next generation of team communication with ConvoX.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        {/* Sonner Toaster (required for toasts to appear) */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
          duration={6000}
          toastOptions={{
            className: "border border-teal-normal/30 rounded-xl",
            // Style the action button globally
            actionButtonStyle: {
              backgroundColor: "#0ea5e9", 
              color: "white",
              borderRadius: "0.75rem", 
              padding: "0.5rem 1rem",
              fontWeight: "500",
              border: "none",
              transition: "all 0.2s ease",
            },
            // Optional: hover effect
            actionButtonClassName: "hover:bg-sky-600 active:scale-95",
          }}
        />
      </body>
    </html>
  );
}
