import {
  Inter,
  Plus_Jakarta_Sans,
  Cormorant_Garamond,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/context/SocketProvider";
import { WorkspaceProvider } from "@/context/WorkspaceProvider";
import { CallProvider } from "@/context/CallProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "ConvoX | Intelligent Professional Communication",
  description:
    "Experience the next generation of team communication with ConvoX.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${jakarta.variable} ${cormorant.variable} ${ibmMono.variable}`}
      >
        <Providers>
          {" "}
          {/* Auth, other global stuff */}
          {/* Socket first, then Workspace (because Workspace uses useSocket) */}
          <SocketProvider>
            <CallProvider>
              <WorkspaceProvider>{children}</WorkspaceProvider>
            </CallProvider>
          </SocketProvider>
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#12121a",
              color: "#FAF8F5",
              border: "1px solid rgba(0,211,187,0.2)",
              borderRadius: "0.75rem",
            },
            success: {
              iconTheme: { primary: "#00d3bb", secondary: "#0D0D12" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#0D0D12" },
            },
          }}
        />
      </body>
    </html>
  );
}
