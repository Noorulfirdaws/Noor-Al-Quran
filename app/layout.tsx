import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";

// General Arabic font
import { Amiri } from "next/font/google";
const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"], variable: "--font-amiri" });

// Quran Hafs Uthmanic script font (Amiri Quran = KFGQPC Uthmanic Hafs, same typeface)
import { Amiri_Quran } from "next/font/google";
const amiriQuran = Amiri_Quran({ weight: ["400"], subsets: ["arabic"], variable: "--font-quran" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noor-ul-Quran — AI Quran Memorization",
  description: "Supercharge your Quran memorization with Noor-ul-Quran. AI-powered mistake detection, personalized planning, and real-time recitation feedback. Free to start.",
  keywords: ["Quran memorization", "hifz app", "AI Quran", "tajweed", "Islamic app", "Quran recitation"],
  authors: [{ name: "Noor-ul-Quran" }],
  creator: "Noor-ul-Quran",
  metadataBase: new URL("https://noor-ul-quran.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://noor-ul-quran.com",
    siteName: "Noor-ul-Quran",
    title: "Noor-ul-Quran — AI Quran Memorization",
    description: "AI-powered mistake detection, personalized hifz planning, and real-time recitation feedback. Free to start.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Noor-ul-Quran — AI Quran Memorization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noor-ul-Quran — AI Quran Memorization",
    description: "AI-powered mistake detection, personalized hifz planning, and real-time recitation feedback.",
    images: ["/og-image.png"],
    creator: "@noorulquran",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  themeColor: "#57d996",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${amiriQuran.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
