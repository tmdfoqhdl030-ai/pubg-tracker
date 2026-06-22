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
            <Link href="/synergy" className="hover:text-[#0F172A] transition-colors hidden sm:block">시너지</Link>
            <Link href="/about" className="hover:text-[#0F172A] transition-colors hidden sm:block">소개</Link>
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

        {/* ── 서비스 설명 (고유 콘텐츠) ── */}
        <section className="pt-12 pb-4">
          <h2 className="text-lg font-bold mb-5" style={{ color: "#0F172A" }}>
            m249.kr는 이렇게 다릅니다
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
              <p className="text-sm font-bold mb-1.5" style={{ color: "#0F172A" }}>① 숫자가 아니라 맥락을 봅니다</p>
              <p className="text-xs leading-6" style={{ color: "#64748B" }}>
                단순히 KDA와 승률만 나열하지 않습니다. 최근 매치의 교전 거리, 생존 패턴, 힐링 타이밍을 함께 묶어
                &ldquo;왜&rdquo; 그 결과가 나왔는지 AI가 해석해서 보여줍니다.
              </p>
            </div>
            <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
              <p className="text-sm font-bold mb-1.5" style={{ color: "#0F172A" }}>② 약점에 맞는 공략을 연결합니다</p>
              <p className="text-xs leading-6" style={{ color: "#64748B" }}>
                헤드샷률이 낮으면 에임 공략을, 생존 시간이 짧으면 초반 동선 공략을 자동으로 추천합니다.
                전적 조회와 학습이 한 화면에서 끝나도록 설계했습니다.
              </p>
            </div>
            <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
              <p className="text-sm font-bold mb-1.5" style={{ color: "#0F172A" }}>③ 듀오·스쿼드 케미를 점수화합니다</p>
              <p className="text-xs leading-6" style={{ color: "#64748B" }}>
                같이 플레이한 동료와의 합을 점수로 환산해, 어떤 조합일 때 승률이 오르는지 데이터로 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
            전적 조회는 어떻게 진행되나요?
          </h2>
          <ol className="space-y-2 mb-8 text-sm leading-7" style={{ color: "#475569" }}>
            <li><span style={{ color: "#F97316", fontWeight: 700 }}>1.</span> 검색창에 배틀그라운드 닉네임을 입력하고 플랫폼(스팀/카카오/PS·Xbox)을 선택합니다.</li>
            <li><span style={{ color: "#F97316", fontWeight: 700 }}>2.</span> Krafton 공식 PUBG API에서 최근 매치 기록을 불러와 KDA, 헤드샷률, 평균 딜량을 계산합니다.</li>
            <li><span style={{ color: "#F97316", fontWeight: 700 }}>3.</span> AI가 약점·강점을 진단하고, 비슷한 상황의 다른 유저 데이터와 비교해 등급을 추정합니다.</li>
            <li><span style={{ color: "#F97316", fontWeight: 700 }}>4.</span> 진단 결과에 맞는 공략 가이드와 팀 시너지 분석 링크를 함께 제공합니다.</li>
          </ol>

          <h2 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
            자주 묻는 질문
          </h2>
          <div className="space-y-2.5">
            <details className="rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
              <summary className="text-sm font-semibold cursor-pointer" style={{ color: "#0F172A" }}>
                전적 조회에 비용이 드나요?
              </summary>
              <p className="text-xs mt-2 leading-6" style={{ color: "#64748B" }}>
                아니요, m249.kr의 전적 조회·AI 분석·공략 추천 기능은 모두 무료로 제공됩니다.
              </p>
            </details>
            <details className="rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
              <summary className="text-sm font-semibold cursor-pointer" style={{ color: "#0F172A" }}>
                검색 결과가 안 나와요. 왜 그런가요?
              </summary>
              <p className="text-xs mt-2 leading-6" style={{ color: "#64748B" }}>
                닉네임 표기가 정확하지 않거나, 선택한 플랫폼이 실제 계정 플랫폼과 다른 경우가 가장 흔한 원인입니다.
                스팀/카카오/콘솔 여부를 다시 확인해 주세요.
              </p>
            </details>
            <details className="rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
              <summary className="text-sm font-semibold cursor-pointer" style={{ color: "#0F172A" }}>
                다른 전적검색 사이트와 무슨 차이가 있나요?
              </summary>
              <p className="text-xs mt-2 leading-6" style={{ color: "#64748B" }}>
                숫자 나열에서 끝나지 않고, AI가 플레이 스타일을 진단해 부족한 부분을 짚어주고 그에 맞는 공략까지
                바로 이어준다는 점이 가장 큰 차이입니다.
              </p>
            </details>
          </div>
        </section>

      </main>

      <footer className="bg-white mt-6" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 text-center text-xs" style={{ color: "#94A3B8" }}>
          <p>m249.kr — PUBG Corporation과 무관한 비공식 배틀그라운드 전적검색 서비스입니다.</p>
          <div className="flex justify-center gap-5 mt-2">
            <Link href="/about" className="hover:underline" style={{ color: "#64748B" }}>서비스 소개</Link>
            <Link href="/privacy" className="hover:underline" style={{ color: "#64748B" }}>개인정보처리방침</Link>
            <Link href="/terms" className="hover:underline" style={{ color: "#64748B" }}>이용약관</Link>
            <Link href="/contact" className="hover:underline" style={{ color: "#64748B" }}>문의</Link>
            <a href="mailto:tmdfoqhdl030@gmail.com" className="hover:underline" style={{ color: "#64748B" }}>문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
