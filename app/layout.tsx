import AutoTracker from "@/components/AutoTracker";
import { LangProvider } from "@/components/LangProvider";
import GateKeeper from "@/components/GateKeeper";
import InviteFloat from "@/components/InviteFloat";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comic Agents — The World's Funniest AI Characters",
  description: "Chat with 21 AI comedy characters. KarenBot wants your manager. BroGPT wants to repost. GymBroBot thinks this is leg day. Welcome to the future of comedy.",
  openGraph: {
    title: "Comic Agents — The World's Funniest AI Characters",
    description: "Chat with AI comedians that actually make you laugh. 21 original characters, each more unhinged than the last.",
    url: "https://comicagents.com",
    siteName: "Comic Agents",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comic Agents",
    description: "AI characters that are actually funny. Chat with KarenBot, BroGPT, RoastMaster 9000, and 18 more.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <LangProvider>
          <GateKeeper>
            <AutoTracker />{children}<InviteFloat />
          </GateKeeper>
        </LangProvider>
      </body>
    </html>
  );
}
