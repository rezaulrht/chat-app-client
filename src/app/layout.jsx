import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";

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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#15191C",
              color: "#e2e8f0",
              border: "1px solid rgba(45,212,191,0.2)",
              borderRadius: "0.75rem",
            },
            success: {
              iconTheme: { primary: "#2dd4bf", secondary: "#0B0E11" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#0B0E11" },
            },
          }}
        />
      </body>
    </html>
  );
}
