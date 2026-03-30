import {
  Inter,
  Plus_Jakarta_Sans,
  Cormorant_Garamond,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeAwareToaster from "@/components/shared/ThemeAwareToaster";
import { SocketProvider } from "@/context/SocketProvider";
import { WorkspaceProvider } from "@/context/WorkspaceProvider";
import { CallProvider } from "@/context/CallProvider";
import { FeedProvider } from "@/context/FeedProvider";
import { NotificationProvider } from "@/context/NotificationProvider";
import CallOverlays from "@/components/calls/CallOverlays";

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
      {/* Sets data-theme before first paint to prevent flash of wrong theme */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('convox-theme')||'midnight-luxe-mint';document.documentElement.setAttribute('data-theme',t);}catch(e){}` }} />
      </head>
      <body
        className={`${inter.className} ${jakarta.variable} ${cormorant.variable} ${ibmMono.variable}`}
      >
        <Providers>
          {/* Socket first, then Workspace (because Workspace uses useSocket) */}
          <SocketProvider>
            <CallProvider>
              <CallOverlays />
              <NotificationProvider>
                {/* WorkspaceProvider wraps everything workspace-related */}
                <WorkspaceProvider>
                  {/* FeedProvider wraps everything so Profile modals etc work */}
                  <FeedProvider>{children}</FeedProvider>
                </WorkspaceProvider>
              </NotificationProvider>
            </CallProvider>
          </SocketProvider>
          <ThemeAwareToaster />
        </Providers>
      </body>
    </html>
  );
}
