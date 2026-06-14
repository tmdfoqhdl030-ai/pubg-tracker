import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "배틀그라운드 AI 전적검색 m249",
  description: "배틀그라운드 AI 전적검색 m249 — AI 플레이 분석, 스쿼드 시너지 궁합 분석",
  metadataBase: new URL("https://m249.kr"),
  alternates: { canonical: "https://m249.kr" },
  openGraph: {
    title: "배틀그라운드 AI 전적검색 m249",
    description: "배틀그라운드 AI 전적검색 m249 — AI 플레이 분석, 스쿼드 시너지 궁합 분석",
    url: "https://m249.kr",
    siteName: "m249.kr",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9300919508026227"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#0D1B2A", color: "#E8EDF2" }}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
