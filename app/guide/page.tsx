import Link from "next/link";
import { Clock } from "lucide-react";
import type { Metadata } from "next";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "배틀그라운드 공략 & 전적 분석 가이드 — m249.kr",
  description:
    "배틀그라운드 초보 가이드, 메타 무기 분석, 맵별 드랍존, 에임 훈련, 스쿼드 전략, 전적 지표 읽는 법까지. 데이터 기반 배그 공략 모음.",
  alternates: { canonical: "https://m249.kr/guide" },
};

export default function GuideListPage() {
  const guides = [...GUIDES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B2A", color: "#E8EDF2" }}>
      {/* 헤더 */}
      <header className="border-b" style={{ borderColor: "#1E3A5F" }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="m249 로고" width={32} height={32} style={{ borderRadius: 6 }} />
            <span className="font-bold text-base" style={{ color: "#E8EDF2" }}>m249.kr</span>
          </Link>
          <span style={{ color: "#475569" }}>/</span>
          <span className="text-sm" style={{ color: "#94A3B8" }}>공략 가이드</span>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-3xl mx-auto px-5 pt-12 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "#F1F5F9" }}>
          배틀그라운드 공략 &amp; 전적 분석 가이드
        </h1>
        <p className="text-sm sm:text-base leading-7" style={{ color: "#94A3B8" }}>
          생존 기본기부터 메타 무기, 맵 공략, 에임 훈련, 스쿼드 전략, 전적 지표 해석까지.
          데이터로 실력을 키우는 배그 공략을 모았습니다.
        </p>
      </section>

      {/* 글 목록 */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/guide/${g.slug}`}
              className="rounded-xl p-5 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{g.emoji}</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#F9731620", color: "#FB923C", border: "1px solid #F9731640" }}
                >
                  {g.category}
                </span>
              </div>
              <h2 className="text-base font-bold mb-2 leading-snug" style={{ color: "#F1F5F9" }}>
                {g.title}
              </h2>
              <p className="text-xs leading-6 mb-3" style={{ color: "#94A3B8" }}>
                {g.description}
              </p>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#64748B" }}>
                <Clock size={11} />
                <span>약 {g.readMinutes}분</span>
                <span>·</span>
                <span>{g.publishedAt}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t py-8" style={{ borderColor: "#1E3A5F" }}>
        <div className="max-w-3xl mx-auto px-5 text-center text-xs" style={{ color: "#475569" }}>
          <p>© 2025 m249.kr. 본 서비스는 Krafton의 공식 서비스가 아닙니다.</p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/" className="hover:opacity-80" style={{ color: "#64748B" }}>홈</Link>
            <Link href="/guide" className="hover:opacity-80" style={{ color: "#F97316" }}>공략 가이드</Link>
            <Link href="/about" className="hover:opacity-80" style={{ color: "#64748B" }}>서비스 소개</Link>
            <Link href="/privacy" className="hover:opacity-80" style={{ color: "#64748B" }}>개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
