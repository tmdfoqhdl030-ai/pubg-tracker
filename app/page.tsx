"use client";
import { useState, useEffect, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import { Zap, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";


function useRecentSearches() {
  const [searches, setSearches] = useState<{ name: string; platform: string }[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pubg_recent_searches");
      if (raw) setSearches(JSON.parse(raw).slice(0, 6));
    } catch { /* ignore */ }
  }, []);
  return searches;
}


const FEATURED_SLUGS = ["beginner-survival", "headshot-aim", "season-meta-weapons", "rank-up"];

export default function Home() {
  const recentSearches = useRecentSearches();
  const featuredGuides = useMemo(
    () => GUIDES.filter(g => FEATURED_SLUGS.includes(g.slug)),
    []
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      {/* nav */}
      <header className="bg-white sticky top-0 z-50" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="m249 로고" width={36} height={36} style={{ borderRadius: 8 }} />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base" style={{ color: "#0F172A" }}>m249.kr</span>
              <span className="text-[10px]" style={{ color: "#94A3B8" }}>배틀그라운드 AI 전적검색</span>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium" style={{ color: "#64748B" }}>
            <Link href="/" className="hover:text-[#0F172A] transition-colors">홈</Link>
            <Link href="/guide" className="hover:text-[#0F172A] transition-colors">공략</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* ── Hero + 검색 ── */}
        <section className="text-center pt-12 pb-2">
          {/* 히어로 로고 */}
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="m249 로고" width={80} height={80} style={{ borderRadius: 18 }} />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 mb-4"
            style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FFEDD5" }}>
            <Zap size={11} /> AI 분석 · 위험도 · 팀 시너지
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight" style={{ color: "#0F172A" }}>
            배틀그라운드 <span style={{ color: "#F97316" }}>전적 분석</span>
          </h1>
          <p className="text-sm mb-6" style={{ color: "#64748B" }}>
            AI가 플레이 약점을 진단하고, 팀 시너지까지 한눈에 파악하세요.
          </p>
          <SearchBar />
          {recentSearches.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs" style={{ color: "#94A3B8" }}>최근 검색:</span>
              {recentSearches.map((s, i) => (
                <Link key={i} href={`/player/${encodeURIComponent(s.name)}?platform=${s.platform}`}
                  className="text-xs px-3 py-1 rounded-full font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" }}>
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── 공략 가이드 미리보기 ── */}
        <section className="pt-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={15} style={{ color: "#F97316" }} />
              <span className="text-sm font-bold" style={{ color: "#0F172A" }}>배그 공략 가이드</span>
            </div>
            <Link href="/guide" className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity"
              style={{ color: "#F97316" }}>
              전체 보기 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featuredGuides.map(g => (
              <Link key={g.slug} href={`/guide/${g.slug}`}
                className="rounded-xl p-4 hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
                <div className="text-2xl mb-2">{g.emoji}</div>
                <p className="text-xs font-bold leading-snug mb-1" style={{ color: "#0F172A" }}>{g.title}</p>
                <p className="text-[10px]" style={{ color: "#94A3B8" }}>약 {g.readMinutes}분</p>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <footer className="bg-white mt-6" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 text-center text-xs" style={{ color: "#94A3B8" }}>
          <p>m249.kr — PUBG Corporation과 무관한 비공식 배틀그라운드 전적검색 서비스입니다.</p>
          <div className="flex justify-center gap-5 mt-2">
            <Link href="/about" className="hover:underline" style={{ color: "#64748B" }}>서비스 소개</Link>
            <Link href="/privacy" className="hover:underline" style={{ color: "#64748B" }}>개인정보처리방침</Link>
            <a href="mailto:tmdfoqhdl030@gmail.com" className="hover:underline" style={{ color: "#64748B" }}>문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
