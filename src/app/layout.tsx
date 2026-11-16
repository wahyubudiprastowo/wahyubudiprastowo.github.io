import type { Metadata } from "next";
import { Anton, Caveat, Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  weight: ["600"],
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wahyu Budi Prastowo — Cloud Infrastructure Architect & AI Tinkerer",
  description:
    "14+ years across Azure, AWS, GCP and hybrid cloud — DevOps, security, Microsoft 365 and automation by day; agentic AI, vibe coding and game projects by night. Everything open source.",
  keywords: ["Wahyu Budi Prastowo", "Cloud Infrastructure Architect", "Azure", "DevOps", "Microsoft 365", "Cloud Security", "Agentic AI", "Automation", "Vibe Coding", "portfolio"],
  authors: [{ name: "Wahyu Budi Prastowo", url: "https://github.com/wahyubudiprastowo" }],
  openGraph: {
    title: "Wahyu Budi Prastowo — Cloud Infrastructure Architect & AI Tinkerer",
    description:
      "DevOps, security, Microsoft 365 and automation by day; agentic AI, vibe coding and game projects by night — 14+ years in enterprise infrastructure.",
    siteName: "Wahyu Budi Prastowo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anton.variable} ${inter.variable} ${caveat.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
