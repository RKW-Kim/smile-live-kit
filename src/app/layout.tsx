import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smile Live Kit — Broadcast Console",
  description:
    "Smile Live Kit — a warm, friendly OBS-focused broadcast & streaming scene kit for the smile.co.ke hub. Channels, 24/7 streaming, education — good vibes under one Smile desk.",
  keywords: [
    "Smile",
    "smile.co.ke",
    "W21",
    "OBS",
    "Broadcast",
    "Live Stream",
    "Trading",
    "Education",
    "Channels",
    "Scene Kit",
    "Kenya",
  ],
  authors: [{ name: "Smile Live Kit" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Smile Live Kit — Broadcast Console",
    description:
      "A warm, friendly OBS-focused broadcast & streaming scene kit for the smile.co.ke hub.",
    siteName: "Smile Live Kit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smile Live Kit — Broadcast Console",
    description:
      "A warm, friendly OBS-focused broadcast & streaming scene kit for the smile.co.ke hub.",
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
        className={`${manrope.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
