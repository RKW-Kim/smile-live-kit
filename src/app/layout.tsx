import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smile Live Kit — W21 Broadcast Console",
  description:
    "W21 Broadcast Suite — an OBS-focused live-streaming scene & overlay kit for the World 21 ecosystem (smile.co.ke).",
  keywords: [
    "W21",
    "World 21",
    "smile.co.ke",
    "OBS",
    "Broadcast",
    "Live Stream",
    "Trading",
    "Scene Kit",
  ],
  authors: [{ name: "W21 Broadcast Suite" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Smile Live Kit — W21 Broadcast Console",
    description:
      "OBS-focused live-streaming scene & overlay kit for the World 21 ecosystem.",
    siteName: "Smile Live Kit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smile Live Kit — W21 Broadcast Console",
    description:
      "OBS-focused live-streaming scene & overlay kit for the World 21 ecosystem.",
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
        className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
