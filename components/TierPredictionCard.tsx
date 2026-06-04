"use client";
import { useState } from "react";
import { PUBGTierEmblem, getTierFromString, TIER_KO } from "./TierBadge";
import { predictTier, nextTierTarget, gradeLabel, getNextGoal, estimateRpPerGame } from "@/lib/tier-predict";

interface SeasonData {
  kda: number; winRate: number; avgDamage: number;
  headshotRate: number; topTenRate: number; gamesPlayed: number;
}
interface RankedTierInfo {
  tier: string; subTier: string; rp: number;
  wins: number; losses: number; games: number;
  kills: number; kda: number; winRate: number; avgDamage: number;
}

interface Props {
  season?: SeasonData | null;  // null 허용 — ranked만 있어도 표시 가능
  rankedTier?: { squad: RankedTierInfo | null; duo: RankedTierInfo | null; solo: RankedTierInfo | null } | null;
}

// ── 점수 행 ────────────────────────────────────────────────────────────
function ScoreRow({
  label, value, score, maxScore,
}: { label: string; value: string; score: number; maxScore: number }) {
  const { color } = gradeLabel(score, maxScore);
  const pct = Math.round((score / maxScore) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium flex-shrink-0 w-16" style={{ color: "#64748B" }}>
        {label}
      </span>
      <span className="text-[11px] flex-shrink-0 w-12 text-right font-semibold" style={{ color: "#374151" }}>
        {value}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold flex-shrink-0 w-6 text-right" style={{ color }}>
        +{score}
      </span>
    </div>
  );
}

// ── 티어 비교 방향 계산 ────────────────────────────────────────────────
const TIER_ORDER: Record<string, number> = {
  Bronze: 0, Silver: 1, Gold: 2, Platinum: 3, Diamond: 4, Master: 5, Conqueror: 6,
};
const SUB_ORDER: Record<string, number> = {
  "III": 0, "II": 1, "I": 2, "": 3,
};

function tierRank(tier: string, sub: string) {
  return (TIER_ORDER[tier] ?? 0) * 10 + (SUB_ORDER[sub] ?? 0);
}

export default function TierPredictionCard({ season, rankedTier }: Props) {
  // 모드 선택 (스쿼드/듀오/솔로)
  const availableModes = [
    { key: "squad" as const, label: "스쿼드" },
    { key: "duo"   as const, label: "듀오"   },
    { key: "solo"  as const, label: "솔로"   },
  ].filter(({ key }) => rankedTier?.[key]);

  const [selectedMode, setSelectedMode] = useState<"squad" | "duo" | "solo">(
    availableModes[0]?.key ?? "squad"
  );

  // 현재 티어 (선택 모드 기준)
  const currentRanked =
    rankedTier?.[selectedMode] ?? rankedTier?.squad ?? rankedTier?.duo ?? rankedTier?.solo ?? null;

  // 시즌 데이터 신뢰도 체크 (10게임 이상이면 신뢰)
  const seasonReliable = (season?.gamesPlayed ?? 0) >= 10;

  // 예측에 사용할 스탯 (랭크 스탯 우선, season null 안전 처리)
  const statsForPrediction = currentRanked
    ? {
        kda:          currentRanked.kda,
        avgDamage:    currentRanked.avgDamage,
        winRate:      currentRanked.winRate,
        // 시즌 데이터가 충분하면 사용, 아니면 winRate 기반 추정
        headshotRate: seasonReliable ? (season!.headshotRate) : currentRanked.winRate * 2,
        topTenRate:   seasonReliable ? (season!.topTenRate)   : Math.min(60, currentRanked.winRate * 4),
      }
    : {
        kda:          season?.kda ?? 0,
        avgDamage:    season?.avgDamage ?? 0,
        winRate:      season?.winRate ?? 0,
        headshotRate: season?.headshotRate ?? 0,
        topTenRate:   season?.topTenRate ?? 0,
      };

  const pred    = predictTier(statsForPrediction);
  const next    = nextTierTarget(pred.score);
  const predCfg = getTierFromString(pred.tier);

  const currentTierStr  = currentRanked?.tier ?? "";
  // PUBG API가 "4" 같은 숫자로 반환할 수 있어서 로마자로 정규화
  const SUB_TO_ROMAN: Record<string, string> = {
    "1":"I","2":"II","3":"III","4":"IV","5":"V",
    "I":"I","II":"II","III":"III","IV":"IV","V":"V",
  };
  const currentSubStr   = SUB_TO_ROMAN[currentRanked?.subTier ?? ""] ?? currentRanked?.subTier ?? "";
  const currentCfg      = currentTierStr ? getTierFromString(currentTierStr) : null;

  // 예측 티어와 현재 티어 비교
  const predRank    = tierRank(pred.tier, pred.subTier);
  const currentRank = currentTierStr ? tierRank(currentTierStr, currentSubStr) : -1;
  const diff        = predRank - currentRank;

  let trendLabel = "현재 실력 적정 티어";
  let trendColor = "#64748B";
  let trendEmoji = "➡️";
  if (diff > 0)  { trendLabel = "상승 예상"; trendColor = "#22C55E"; trendEmoji = "📈"; }
  if (diff < 0)  { trendLabel = "하락 위험"; trendColor = "#EF4444"; trendEmoji = "📉"; }

  const nextTierKo = TIER_KO[next.nextTier] ?? next.nextTier;

  // 각 지표별 배열 (ScoreRow 반복용)
  const rows = [
    { label: "K/D",   value: statsForPrediction.kda.toFixed(2),           score: pred.kdaScore,    max: 35 },
    { label: "평균딜", value: Math.round(statsForPrediction.avgDamage).toString(), score: pred.damageScore, max: 30 },
    { label: "승률",   value: `${statsForPrediction.winRate.toFixed(1)}%`, score: pred.winScore,    max: 20 },
    { label: "헤드샷", value: `${statsForPrediction.headshotRate.toFixed(1)}%`, score: pred.hsScore,     max: 8  },
    { label: "탑10",   value: `${statsForPrediction.topTenRate.toFixed(1)}%`,  score: pred.top10Score,  max: 7  },
  ];

  // 부족 항목 조언 생성
  const tips: string[] = [];
  if (pred.kdaScore    < 14) tips.push(`K/D를 ${statsForPrediction.kda < 2 ? "2.0" : "3.0"} 이상으로 올리세요`);
  if (pred.damageScore < 13) tips.push(`평균 딜량 ${statsForPrediction.avgDamage < 300 ? "300" : "400"} 이상 목표`);
  if (pred.winScore    < 10) tips.push(`승률 ${statsForPrediction.winRate < 9 ? "9%" : "12%"} 이상 달성`);
  if (pred.hsScore     < 4)  tips.push("헤드샷율 25% 이상 — 조준 연습 권장");

  // ── 시즌 목표 계산 ──────────────────────────────────────────────────
  const currentRP    = currentRanked?.rp ?? 0;
  const goalData     = currentRanked
    ? getNextGoal(currentTierStr, currentSubStr)
    : null;
  const rpPerGame    = currentRanked
    ? estimateRpPerGame(currentRanked.winRate, currentRanked.kda, currentRanked.avgDamage)
    : 0;
  const rpNeeded     = goalData ? Math.max(0, goalData.goalRP - currentRP) : 0;
  const gamesNeeded  = rpPerGame > 0 ? Math.ceil(rpNeeded / rpPerGame) : null;
  const goalProgress = goalData
    ? Math.min(100, Math.round(((currentRP - goalData.prevRP) / Math.max(goalData.goalRP - goalData.prevRP, 1)) * 100))
    : 0;
  const goalTierKo   = goalData ? TIER_KO[goalData.goalTier] ?? goalData.goalTier : "";
  const goalCfg      = goalData ? getTierFromString(goalData.goalTier) : null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0", background: "#fff" }}>
      {/* ── 헤더 ── */}
      <div className="px-4 pt-3 pb-0"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span className="text-sm font-black text-white">다음 시즌 티어 예측</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${trendColor}22`, color: trendColor, border: `1px solid ${trendColor}44` }}>
            {trendEmoji} {trendLabel}
          </span>
        </div>
        {/* 모드 탭 */}
        {availableModes.length > 1 && (
          <div className="flex gap-1 pb-0">
            {availableModes.map(({ key, label }) => (
              <button key={key} onClick={() => setSelectedMode(key)}
                className="px-2.5 py-1 text-[10px] font-bold rounded-t-lg transition-all"
                style={{
                  backgroundColor: selectedMode === key ? "#fff" : "rgba(255,255,255,0.08)",
                  color:           selectedMode === key ? "#0F172A" : "rgba(255,255,255,0.5)",
                  borderBottom:    selectedMode === key ? "2px solid #F97316" : "2px solid transparent",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ borderBottom: "1px solid #334155" }} />

      {/* ── 티어 비교 ── */}
      <div className="flex items-center justify-around px-4 py-4"
        style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #fff 100%)" }}>
        {/* 현재 티어 */}
        <div className="text-center">
          <div className="text-[9px] font-bold mb-1.5" style={{ color: "#94A3B8" }}>현재 티어</div>
          {currentCfg ? (
            <PUBGTierEmblem tier={currentTierStr} subTier={currentSubStr} size={60} />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#F1F5F9", border: "2px dashed #CBD5E1" }}>
              <span className="text-xl">❓</span>
            </div>
          )}
          {!currentCfg && (
            <div className="text-[9px] mt-1" style={{ color: "#CBD5E1" }}>미배치</div>
          )}
        </div>

        {/* 화살표 + 점수 */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-lg">→</div>
          <div className="text-center px-2 py-1 rounded-lg"
            style={{ backgroundColor: `${predCfg.color}15`, border: `1px solid ${predCfg.color}30` }}>
            <div className="text-lg font-black leading-none" style={{ color: predCfg.color }}>
              {pred.score}
            </div>
            <div className="text-[8px] font-semibold" style={{ color: "#94A3B8" }}>/ 100점</div>
          </div>
        </div>

        {/* 예상 티어 */}
        <div className="text-center">
          <div className="text-[9px] font-bold mb-1.5" style={{ color: "#F97316" }}>예상 도달 티어</div>
          <PUBGTierEmblem tier={pred.tier} subTier={pred.subTier} size={60} />
        </div>
      </div>

      {/* ── 전체 진행도 바 ── */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px]" style={{ color: "#94A3B8" }}>예측 점수</span>
          <span className="text-[10px] font-semibold" style={{ color: predCfg.color }}>
            {pred.score} / 100점
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pred.score}%`,
              background: `linear-gradient(90deg, ${predCfg.color}88, ${predCfg.color})`,
            }}
          />
        </div>
        {next.needScore > 0 && (
          <div className="text-[10px] mt-1 text-right" style={{ color: "#CBD5E1" }}>
            {nextTierKo}{next.nextSub ? ` ${next.nextSub}` : ""}까지 +{next.needScore}점 필요
          </div>
        )}
      </div>

      {/* ── 지표별 점수 ── */}
      <div className="px-4 pb-3 space-y-2" style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
        <div className="text-[10px] font-bold mb-2" style={{ color: "#94A3B8" }}>📊 지표별 평가</div>
        {rows.map(r => (
          <ScoreRow key={r.label} label={r.label} value={r.value} score={r.score} maxScore={r.max} />
        ))}
      </div>

      {/* ── 달성 팁 ── */}
      {tips.length > 0 && (
        <div className="px-4 pt-2 pb-3" style={{ borderTop: "1px solid #F1F5F9" }}>
          <div className="text-[10px] font-bold mb-2" style={{ color: "#94A3B8" }}>
            ⚡ {nextTierKo} 달성 핵심 과제
          </div>
          {tips.slice(0, 3).map((t, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center mt-0.5"
                style={{ backgroundColor: `${predCfg.color}20`, color: predCfg.color }}>
                {i + 1}
              </span>
              <span className="text-[11px] leading-snug" style={{ color: "#64748B" }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══ 시즌 목표 진행률 ══════════════════════════════════════════════ */}
      {goalData && currentRP > 0 && goalCfg && (
        <div className="mx-3 mb-3 rounded-xl overflow-hidden"
          style={{ border: `1px solid ${goalCfg.color}30`, backgroundColor: `${goalCfg.color}08` }}>

          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: `1px solid ${goalCfg.color}20` }}>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📌</span>
              <span className="text-xs font-black" style={{ color: "#0F172A" }}>이번 시즌 목표</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${goalCfg.color}18`, color: goalCfg.color }}>
              {goalTierKo}{goalData.goalSub ? ` ${goalData.goalSub}` : ""}
            </span>
          </div>

          <div className="px-3 py-2.5 space-y-2">
            {/* RP 수치 */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9px]" style={{ color: "#94A3B8" }}>현재 RP</div>
                <div className="text-lg font-black leading-none" style={{ color: goalCfg.color }}>
                  {currentRP.toLocaleString()}
                  <span className="text-[10px] font-semibold ml-0.5" style={{ color: "#94A3B8" }}>RP</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px]" style={{ color: "#94A3B8" }}>목표 RP</div>
                <div className="text-sm font-bold" style={{ color: "#374151" }}>
                  {goalData.goalRP.toLocaleString()} RP
                </div>
              </div>
            </div>

            {/* 프로그레스 바 */}
            <div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#E2E8F0" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 relative"
                  style={{
                    width: `${goalProgress}%`,
                    background: `linear-gradient(90deg, ${goalCfg.color}70, ${goalCfg.color})`,
                  }}>
                  {/* 반짝임 효과 */}
                  <div className="absolute inset-y-0 right-0 w-4 rounded-full"
                    style={{ background: "rgba(255,255,255,0.4)" }} />
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: "#94A3B8" }}>
                  {goalProgress}% 달성
                </span>
                <span className="text-[9px] font-semibold" style={{ color: goalCfg.color }}>
                  +{rpNeeded.toLocaleString()} RP 남음
                </span>
              </div>
            </div>

            {/* 예상 달성 */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: `${goalCfg.color}12`, border: `1px solid ${goalCfg.color}20` }}>
              <span className="text-sm">⏱</span>
              <div className="flex-1">
                {gamesNeeded !== null && gamesNeeded > 0 ? (
                  <>
                    <span className="text-[11px] font-black" style={{ color: "#0F172A" }}>
                      약 {gamesNeeded}경기 후 달성 예상
                    </span>
                    <div className="text-[9px] mt-0.5" style={{ color: "#94A3B8" }}>
                      현재 페이스 +{rpPerGame} RP/경기 기준
                    </div>
                  </>
                ) : rpNeeded === 0 ? (
                  <span className="text-[11px] font-black" style={{ color: goalCfg.color }}>
                    🎉 목표 달성!
                  </span>
                ) : (
                  <span className="text-[11px]" style={{ color: "#94A3B8" }}>
                    승률을 높이면 더 빠르게 달성할 수 있어요
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
