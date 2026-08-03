import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/**
 * Fonts — match control.html exactly:
 *   --disp = 'Chakra Petch' (500/600/700) — display / labels
 *   --mono = 'IBM Plex Mono' (400/500/600) — body / numbers
 *
 * The scene HTML files in /public/scenes/ load their own Google Fonts
 * (Manrope + Inter + Chakra Petch) via <link> tags inside the iframe —
 * they are self-contained. The control panel at `/` only needs the two
 * control.html fonts.
 */
const chakraPetch = Chakra_Petch({
  variable: "--font-disp",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smile Live Kit — Broadcast Console",
  description:
    "SMILE // CONTROL — live kit command centre. Pick a scene, preview it live, send the URL to OBS. The original smile.co.ke v1 broadcast suite, served verbatim.",
  keywords: [
    "Smile",
    "smile.co.ke",
    "SmileSquad",
    "OBS",
    "Broadcast",
    "Live Stream",
    "Trading",
    "Scene Kit",
    "Kenya",
    "Nairobi Desk",
  ],
  authors: [{ name: "Smile Live Kit" }],
  icons: {
    icon: "/scenes/smile-mark.svg",
  },
  openGraph: {
    title: "Smile Live Kit — Broadcast Console",
    description:
      "SMILE // CONTROL — live kit command centre. The original smile.co.ke v1 broadcast suite.",
    siteName: "Smile Live Kit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smile Live Kit — Broadcast Console",
    description:
      "SMILE // CONTROL — live kit command centre. The original smile.co.ke v1 broadcast suite.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${chakraPetch.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
