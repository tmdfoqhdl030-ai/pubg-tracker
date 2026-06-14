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
  title: "배틀그라운드 전적 조회 & AI 분석 — m249.kr",
  description:
    "배틀그라운드 전적 조회, KDA·헤드샷율·딜량 AI 분석, 플레이 스타일 진단까지 무료로. 닉네임 검색 하나로 내 실력을 데이터로 확인하세요.",
  metadataBase: new URL("https://m249.kr"),
  alternates: { canonical: "https://m249.kr" },
  keywords: [
    "배틀그라운드 전적", "배그 전적 조회", "PUBG 전적 검색", "배그 KDA",
    "배틀그라운드 AI 분석", "배그 실력 분석", "PUBG stats", "배그 헤드샷율",
    "배틀그라운드 랭크", "배그 전적 사이트"
  ],
  openGraph: {
    title: "배틀그라운드 전적 조회 & AI 분석 — m249.kr",
    description: "배그 전적을 AI가 분석해 약점과 개선 방향을 제시합니다. 무료 배틀그라운드 전적검색 서비스.",
    url: "https://m249.kr",
    siteName: "m249.kr",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "https://m249.kr/og-default.png", width: 1200, height: 630, alt: "m249.kr 배틀그라운드 전적검색" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "배틀그라운드 전적 조회 & AI 분석 — m249.kr",
    description: "배그 전적을 AI가 분석해 약점과 개선 방향을 제시합니다.",
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
