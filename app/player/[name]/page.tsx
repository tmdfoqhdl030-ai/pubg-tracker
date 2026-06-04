import Link from "next/link";
import { Suspense } from "react";
import { Shield, ArrowLeft, AlertCircle, RefreshCw, RotateCcw } from "lucide-react";
import { getTier, getTierFromString } from "@/components/TierBadge";
import PlayerCard from "@/components/PlayerCard";
import AIDiagnosisCard from "@/components/AIDiagnosisCard";
import TierPredictionCard from "@/components/TierPredictionCard";
import DangerScoreCard from "@/components/DangerScoreCard";
import WeaponBarChart from "@/components/WeaponBarChart";
import WeaponMiniCard from "@/components/WeaponMiniCard";
import MatchHistoryList from "@/components/MatchHistoryList";
import FrequentTeammatesCard from "@/components/FrequentTeammatesCard";
import HackScoreCard from "@/components/HackScoreCard";
import HealPatternCard from "@/components/HealPatternCard";
import BulletEfficiencyCard from "@/components/BulletEfficiencyCard";
import FarmingHeatmapCard from "@/components/FarmingHeatmapCard";
import CarepackageCard from "@/components/CarepackageCard";
import TelemetrySkeleton from "@/components/TelemetrySkeleton";
import TelemetryHighlightBar from "@/components/TelemetryHighlightBar";
import LandingZonesCard from "@/components/LandingZonesCard";
import TabNav from "@/components/TabNav";
import StickyHeader from "@/components/StickyHeader";
import ShareButton from "@/components/ShareButton";
import { mockPlayer } from "@/lib/mock-data";

interface Props {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ platform?: string; tab?: string }>;
}

async function fetchPlayerData(nickname: string, platform: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/player?name=${encodeURIComponent(nickname)}&platform=${platform}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error ?? "데이터 조회에 실패했습니다" };
    }
    return await res.json();
  } catch {
    return { error: "서버에 연결할 수 없습니다" };
  }
}

// ─── 탭별 컨텐츠 스켈레톤 ────────────────────────────────────────────


// ─── 사이드바 ────────────────────────────────────────────────────────

function Sidebar({
  season,
  modeStats,
  rankedTier,
  nickname,
  platform,
  hasError,
  aiAnalysis,
}: {
  season: Record<string, number> | null;
  modeStats: Parameters<typeof PlayerCard>[0]["modeStats"];
  rankedTier: Parameters<typeof PlayerCard>[0]["rankedTier"];
  nickname: string;
  platform: string;
  hasError: boolean;
  aiAnalysis: { styleKey?: string; style?: string; summary?: string; improvements?: string[] };
}) {
  if (hasError) return null;
  return (
    <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-4">
      {/* 내 정보 — 최상단 */}
      {season && (
        <PlayerCard
          season={season as unknown as Parameters<typeof PlayerCard>[0]["season"]}
          modeStats={modeStats}
          rankedTier={rankedTier}
        />
      )}

      {/* AI 플레이 진단 (리디자인) */}
      <AIDiagnosisCard
        styleKey={(aiAnalysis.styleKey as Parameters<typeof AIDiagnosisCard>[0]["styleKey"]) ?? "rookie"}
        season={season as unknown as Parameters<typeof AIDiagnosisCard>[0]["season"]}
        nickname={nickname}
      />

      {/* 다음 시즌 티어 예측 — season 없어도 ranked 있으면 표시 */}
      {(season || rankedTier) && (
        <TierPredictionCard
          season={season as unknown as Parameters<typeof TierPredictionCard>[0]["season"]}
          rankedTier={rankedTier}
        />
      )}

      {/* 주력 무기 — 최근 5경기 텔레메트리 기반 */}
      <WeaponMiniCard nickname={nickname} platform={platform} />
    </aside>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────

export default async function PlayerPage({ params, searchParams }: Props) {
  const { name } = await params;
  const { platform = "steam", tab = "overview" } = await searchParams;
  const nickname = decodeURIComponent(name);
  const data = await fetchPlayerData(nickname, platform);

  const platformLabel = platform === "kakao" ? "카카오" : "스팀";
  const hasError = !!data.error;
  const season = data.season ?? null;
  // mock 폴백 제거: 데이터 없으면 null 표시 (가짜 KDA/RP 방지)
  const modeStats = data.modeStats ?? null;
  const rankedTier = data.rankedTier ?? null;
  const aiAnalysis = data.aiAnalysis ?? mockPlayer.aiAnalysis;
  const dangerScore = data.dangerScore ?? 50;
  const dangerDetails = data.dangerDetails ?? mockPlayer.dangerDetails;
  const recentMatches = data.recentMatches ?? [];

  // 랭크 티어 우선, 없으면 KDA 폴백
  const bestRanked = rankedTier?.squad ?? rankedTier?.duo ?? rankedTier?.solo ?? null;
  // 게임 수: 랭크 게임 수 우선 (일반모드만 플레이 시 0게임처럼 보이는 버그 방지)
  const gamesPlayed = bestRanked
    ? (rankedTier?.squad?.games ?? 0) + (rankedTier?.duo?.games ?? 0) + (rankedTier?.solo?.games ?? 0)
    : season?.gamesPlayed ?? 0;
  const wins = bestRanked
    ? (rankedTier?.squad?.wins ?? 0) + (rankedTier?.duo?.wins ?? 0) + (rankedTier?.solo?.wins ?? 0)
    : season ? Math.round(gamesPlayed * season.winRate / 100) : 0;
  const losses = gamesPlayed - wins;
  const tier = bestRanked
    ? getTierFromString(bestRanked.tier)
    : season ? getTier(season.kda) : null;
  const tierSubLabel = bestRanked ? `${tier?.label} ${bestRanked.subTier}` : tier?.label;
  const initial = nickname[0]?.toUpperCase() ?? "?";

  // 활성 탭 유효성 체크
  const activeTab = ["overview", "matches", "stats"].includes(tab) ? tab : "overview";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F1F5F9" }}>

      {/* ── 스티키 헤더 (스크롤시 나타남) ── */}
      <StickyHeader
        nickname={nickname}
        platform={platform}
        activeTab={activeTab}
        kda={season?.kda}
        winRate={season?.winRate}
        tierColor={tier?.color}
        tierLabel={tier?.label}
      />

      {/* ── TOP NAV ── */}
      <header style={{ backgroundColor: "#0D1117", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Shield size={16} style={{ color: "#F97316" }} />
              <span className="font-black text-sm tracking-tight" style={{ color: "#fff" }}>펍지고 (PubgGo)</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-5">
              {[["홈", "/"], ["팀 분석", "/squad"]].map(([label, href]) => (
                <Link key={href} href={href}
                  className="text-xs font-medium transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/" className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            <ArrowLeft size={12} />전적 검색
          </Link>
        </div>
      </header>

      {/* ── PROFILE BANNER ── */}
      <div
        id="profile-banner"
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0D1117 0%, #161B27 60%, #0F172A 100%)" }}
      >
        {/* 티어 컬러 글로우 */}
        {tier && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: `radial-gradient(ellipse 50% 80% at 15% 50%, ${tier.color}08 0%, transparent 70%)` }} />
        )}

        <div className="max-w-6xl mx-auto px-5 py-5 relative z-10">
          <div className="flex items-center gap-4">

            {/* 아바타 */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                style={{
                  background: tier
                    ? `linear-gradient(135deg, ${tier.color}35, ${tier.color}10)`
                    : "linear-gradient(135deg, #1E293B, #334155)",
                  border: `1.5px solid ${tier?.color ?? "rgba(255,255,255,0.12)"}`,
                  boxShadow: tier ? `0 0 20px ${tier.color}20` : "none",
                }}>
                {initial}
              </div>
              {!hasError && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                  style={{ backgroundColor: "#22C55E", borderColor: "#0D1117" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              )}
            </div>

            {/* 닉네임 + 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-black text-white">{nickname}</h1>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
                  {platformLabel}
                </span>
                {tier && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}35` }}>
                    {tierSubLabel}
                  </span>
                )}
                {bestRanked && (
                  <span className="text-[10px] font-semibold" style={{ color: `${tier?.color ?? "#94A3B8"}80` }}>
                    {bestRanked.rp.toLocaleString()} RP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                {season && <span>{gamesPlayed}게임</span>}
                {season && <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>}
                {season && (
                  <>
                    <span style={{ color: "#60A5FA" }}>{wins}승</span>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
                    <span style={{ color: "#F87171" }}>{losses}패</span>
                  </>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShareButton />
              <Link href={`/player/${encodeURIComponent(nickname)}?platform=${platform}&tab=${activeTab}`}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "#0EA5E9", color: "#fff" }}>
                <RotateCcw size={10} />전적 갱신
              </Link>
            </div>
          </div>

          {/* ── 탭 네비게이션 ── */}
          <div className="mt-4">
            <TabNav activeTab={activeTab} nickname={nickname} platform={platform} />
          </div>
        </div>
      </div>

      {/* ── 에러 배너 ── */}
      {hasError && (
        <div className="max-w-6xl mx-auto px-5 pt-5">
          <div className="bg-white rounded-xl p-4 flex items-start gap-3"
            style={{ border: "1px solid #FECACA" }}>
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: "#EF4444" }}>데이터 조회 실패</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{data.error}</div>
              <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>닉네임 또는 플랫폼을 확인해주세요.</div>
            </div>
            <Link href={`/player/${encodeURIComponent(nickname)}?platform=${platform}`}
              className="flex items-center gap-1 text-xs font-medium flex-shrink-0"
              style={{ color: "#F97316" }}>
              <RefreshCw size={11} />재시도
            </Link>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          탭 1: 개요 (Overview)
      ═══════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <main className="max-w-6xl mx-auto px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* 사이드바 */}
            <Sidebar
              season={season}
              modeStats={modeStats}
              rankedTier={rankedTier}
              nickname={nickname}
              platform={platform}
              hasError={hasError}
              aiAnalysis={aiAnalysis}
            />

            {/* 메인 */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* 매치 전 위험도 — 상단 요약 */}
              {!hasError && recentMatches.length > 0 && (
                <DangerScoreCard
                  score={dangerScore}
                  recentKDA={dangerDetails.recentKDA}
                  recentDamage={dangerDetails.recentDamage}
                  recentHeadshot={dangerDetails.recentHeadshot}
                  preferredWeapon={dangerDetails.preferredWeapon}
                  playStyle={dangerDetails.playStyle}
                />
              )}

              {/* 심층 분석 인라인 요약 */}
              {!hasError && (
                <TelemetryHighlightBar nickname={nickname} platform={platform} />
              )}

              {/* 플레이 기록 없음 */}
              {!hasError && recentMatches.length === 0 && !season && (
                <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm font-medium mb-1" style={{ color: "#0F172A" }}>이 시즌 플레이 기록 없음</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>최근 14일 내 매치 기록이 없습니다.</p>
                </div>
              )}

              {/* 최근 매치 */}
              {!hasError && recentMatches.length > 0 && (
                <div>
                  <MatchHistoryList matches={recentMatches} nickname={nickname} platform={platform} />
                  <Link
                    href={`/player/${encodeURIComponent(nickname)}?platform=${platform}&tab=matches`}
                    className="flex items-center justify-center gap-2 mt-2 py-2.5 rounded-xl text-xs font-medium transition-colors hover:bg-white"
                    style={{ color: "#64748B", border: "1px dashed #CBD5E1" }}
                  >
                    ⚔️ 매치 기록 전체 보기
                  </Link>
                </div>
              )}
            </div>

            {/* 우측 — 드롭지역 + 자주 함께한 팀원 */}
            {!hasError && (
              <aside className="w-full lg:w-[240px] flex-shrink-0 space-y-4">
                <LandingZonesCard nickname={nickname} platform={platform} />
                <FrequentTeammatesCard playerNickname={nickname} platform={platform} />
              </aside>
            )}
          </div>
        </main>
      )}

      {/* ═══════════════════════════════════════════════════
          탭 2: 매치 기록
      ═══════════════════════════════════════════════════ */}
      {activeTab === "matches" && (
        <main className="max-w-6xl mx-auto px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* 사이드바 (축소형) */}
            {!hasError && season && (
              <aside className="w-full lg:w-[280px] flex-shrink-0">
                <PlayerCard season={season as unknown as Parameters<typeof PlayerCard>[0]["season"]} />
              </aside>
            )}

            {/* 풀폭 매치 리스트 */}
            <div className="flex-1 min-w-0">
              {!hasError && recentMatches.length > 0 ? (
                <MatchHistoryList matches={recentMatches} nickname={nickname} platform={platform} />
              ) : (
                <div className="bg-white rounded-xl p-12 text-center" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-3xl mb-3">⚔️</div>
                  <p className="text-sm font-medium" style={{ color: "#0F172A" }}>
                    {hasError ? "데이터를 불러올 수 없습니다" : "매치 기록이 없습니다"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ═══════════════════════════════════════════════════
          탭 3: 심층 분석 (텔레메트리 5종)
      ═══════════════════════════════════════════════════ */}
      {activeTab === "stats" && (
        <main className="max-w-6xl mx-auto px-5 py-5 space-y-4">
          {hasError ? (
            <div className="bg-white rounded-xl p-12 text-center" style={{ border: "1px solid #E2E8F0" }}>
              <div className="text-3xl mb-3">🔬</div>
              <p className="text-sm font-medium" style={{ color: "#0F172A" }}>데이터를 불러올 수 없습니다</p>
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>{data.error}</p>
            </div>
          ) : (
            <>
              {/* 섹션 타이틀 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: "#E2E8F0" }} />
                <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#F97316", color: "#fff" }}>
                  🔬 텔레메트리 심층 분석
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E2E8F0" }} />
              </div>

              {/* 1. 핵 의심 지수 — 가장 임팩트 큰 기능, 전체폭 */}
              <Suspense fallback={<TelemetrySkeleton title="핵 의심 지수" height={180} />}>
                <HackScoreCard nickname={nickname} platform={platform} />
              </Suspense>

              {/* 2. 생존 스타일 + 탄약 효율 — 2열 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Suspense fallback={<TelemetrySkeleton title="나의 생존 스타일" height={260} />}>
                  <HealPatternCard nickname={nickname} platform={platform} />
                </Suspense>
                <Suspense fallback={<TelemetrySkeleton title="탄약 효율 BPK" height={260} />}>
                  <BulletEfficiencyCard nickname={nickname} platform={platform} />
                </Suspense>
              </div>

              {/* 3. 파밍 루트 히트맵 — 전체폭 */}
              <Suspense fallback={<TelemetrySkeleton title="파밍 루트 히트맵" height={340} />}>
                <FarmingHeatmapCard nickname={nickname} platform={platform} />
              </Suspense>

              {/* 4. 케어패키지 + 무기 바 차트 — 2열 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Suspense fallback={<TelemetrySkeleton title="보급함 기록" height={220} />}>
                  <CarepackageCard nickname={nickname} platform={platform} />
                </Suspense>
                <WeaponBarChart nickname={nickname} platform={platform} />
              </div>
            </>
          )}
        </main>
      )}

      {/* ── 푸터 ── */}
      <footer className="mt-8" style={{ borderTop: "1px solid #E2E8F0", backgroundColor: "#fff" }}>
        <div className="max-w-6xl mx-auto px-5 py-5 text-center text-xs" style={{ color: "#94A3B8" }}>
          펍지고 (PubgGo) — PUBG Corporation과 무관한 비공식 서비스입니다.
        </div>
      </footer>
    </div>
  );
}
