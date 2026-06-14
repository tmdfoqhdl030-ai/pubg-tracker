"use client";

import { useState } from "react";
import { Share2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { type PlayStyleKey, PLAY_STYLES } from "@/lib/play-style";
import DiagnosisShareModal from "./DiagnosisShareModal";

interface SeasonData {
  kda: number; winRate: number; avgDamage: number;
  headshotRate: number; topTenRate: number; gamesPlayed: number;
}

interface RecentMatch {
  kills: number; assists: number; damage: number;
  rank: number; isWin: boolean; totalPlayers: number;
}

interface Props {
  styleKey: PlayStyleKey;
  season?: SeasonData | null;
  nickname?: string;
  recentMatches?: RecentMatch[];
}

// ── 등급 시스템 ────────────────────────────────────────────────────────
type Grade = "S" | "A" | "B" | "C" | "D";

const GRADE_STYLE: Record<Grade, { color: string; bg: string; border: string }> = {
  S: { color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD" },
  A: { color: "#0369A1", bg: "#EFF6FF", border: "#93C5FD" },
  B: { color: "#15803D", bg: "#F0FDF4", border: "#86EFAC" },
  C: { color: "#B45309", bg: "#FFFBEB", border: "#FCD34D" },
  D: { color: "#B91C1C", bg: "#FFF1F2", border: "#FCA5A5" },
};

function gradeKDA(v: number): Grade {
  if (v >= 4.0) return "S"; if (v >= 2.5) return "A";
  if (v >= 1.5) return "B"; if (v >= 1.0) return "C"; return "D";
}
function gradeDamage(v: number): Grade {
  if (v >= 500) return "S"; if (v >= 350) return "A";
  if (v >= 220) return "B"; if (v >= 130) return "C"; return "D";
}
function gradeHeadshot(v: number): Grade {
  if (v >= 35) return "S"; if (v >= 22) return "A";
  if (v >= 14) return "B"; if (v >= 7)  return "C"; return "D";
}
function gradeWinRate(v: number): Grade {
  if (v >= 15) return "S"; if (v >= 8)  return "A";
  if (v >= 4)  return "B"; if (v >= 2)  return "C"; return "D";
}
function gradeTopTen(v: number): Grade {
  if (v >= 50) return "S"; if (v >= 35) return "A";
  if (v >= 20) return "B"; if (v >= 10) return "C"; return "D";
}

function gradeToPercentile(g: Grade): string {
  return { S: "상위 5%", A: "상위 20%", B: "상위 45%", C: "하위 30%", D: "하위 10%" }[g];
}

interface StatDef { key: string; label: string; value: string; raw: number; grade: Grade; sub: string }

function buildStats(s: SeasonData): StatDef[] {
  return [
    { key: "kda",      label: "KDA",     value: s.kda.toFixed(2),                    raw: s.kda,         grade: gradeKDA(s.kda),         sub: gradeToPercentile(gradeKDA(s.kda)) },
    { key: "damage",   label: "평균 딜량", value: Math.round(s.avgDamage).toLocaleString(), raw: s.avgDamage,   grade: gradeDamage(s.avgDamage),   sub: gradeToPercentile(gradeDamage(s.avgDamage)) },
    { key: "headshot", label: "헤드샷율",  value: `${s.headshotRate.toFixed(1)}%`,     raw: s.headshotRate, grade: gradeHeadshot(s.headshotRate), sub: gradeToPercentile(gradeHeadshot(s.headshotRate)) },
    { key: "winrate",  label: "승률",      value: `${s.winRate.toFixed(1)}%`,          raw: s.winRate,      grade: gradeWinRate(s.winRate),     sub: gradeToPercentile(gradeWinRate(s.winRate)) },
    { key: "topten",   label: "탑10율",    value: `${s.topTenRate.toFixed(1)}%`,       raw: s.topTenRate,   grade: gradeTopTen(s.topTenRate),   sub: gradeToPercentile(gradeTopTen(s.topTenRate)) },
  ];
}

// ── ① AI 분석 리포트 항목 생성 ──────────────────────────────────────────
interface ReportItem { emoji: string; label: string; text: string; grade: Grade }

function buildReport(s: SeasonData): ReportItem[] {
  const items: ReportItem[] = [];

  // 교전 효율 (KDA + 딜)
  const kdaG = gradeKDA(s.kda);
  const dmgG = gradeDamage(s.avgDamage);
  const combatGrade: Grade = kdaG === "S" || dmgG === "S" ? "S"
    : kdaG === "A" || dmgG === "A" ? "A"
    : kdaG === "B" || dmgG === "B" ? "B"
    : kdaG === "C" || dmgG === "C" ? "C" : "D";

  const combatText =
    (kdaG === "S" || kdaG === "A") && (dmgG === "S" || dmgG === "A")
      ? `KDA ${s.kda.toFixed(2)} · 딜 ${Math.round(s.avgDamage)} — 교전 능력이 수치로 증명됩니다. 이 강점을 유지하세요.`
    : (kdaG === "S" || kdaG === "A") && (dmgG === "C" || dmgG === "D")
      ? `KDA ${s.kda.toFixed(2)}은 높지만 딜 ${Math.round(s.avgDamage)}이 낮습니다. 막타 의존도가 높을 가능성이 있습니다.`
    : (kdaG === "C" || kdaG === "D") && (dmgG === "A" || dmgG === "S")
      ? `딜 ${Math.round(s.avgDamage)}은 충분한데 KDA ${s.kda.toFixed(2)}이 낮습니다. 딜을 넣고 나서 엄폐하는 습관이 필요합니다.`
    : (kdaG === "D" || kdaG === "C") && (dmgG === "D" || dmgG === "C")
      ? `KDA ${s.kda.toFixed(2)} · 딜 ${Math.round(s.avgDamage)} — 불리한 교전을 줄이고 유리한 상황만 골라 싸우는 것이 우선입니다.`
      : `KDA ${s.kda.toFixed(2)} · 딜 ${Math.round(s.avgDamage)} — 현재 교전 패턴을 유지하면서 생존율을 높이는 데 집중하세요.`;

  items.push({ emoji: "⚔️", label: "교전 효율", text: combatText, grade: combatGrade });

  // 헤드샷율
  const hsG = gradeHeadshot(s.headshotRate);
  const hsText =
    hsG === "S" || hsG === "A"
      ? `${s.headshotRate.toFixed(1)}% — 동일 티어 대비 조준 정확도가 뛰어납니다. 탄 한 발의 가치가 높습니다.`
    : hsG === "B"
      ? `${s.headshotRate.toFixed(1)}% — 평균 수준입니다. 교전 전 조준점을 미리 머리 높이에 두는 습관으로 올릴 수 있습니다.`
    : hsG === "C"
      ? `${s.headshotRate.toFixed(1)}% — 다소 낮습니다. 조준점을 허리 이하로 내리는 습관이 원인일 수 있습니다.`
      : `${s.headshotRate.toFixed(1)}% — 개선 여지가 큽니다. 사격 연습장에서 조준점 높이 교정부터 시작하세요.`;
  items.push({ emoji: "🎯", label: "헤드샷율", text: hsText, grade: hsG });

  // 생존 / 우승
  const wrG  = gradeWinRate(s.winRate);
  const topG = gradeTopTen(s.topTenRate);
  const survGrade: Grade = wrG === "S" || topG === "S" ? "S"
    : wrG === "A" || topG === "A" ? "A"
    : wrG === "B" || topG === "B" ? "B"
    : wrG === "C" || topG === "C" ? "C" : "D";

  const survText =
    (wrG === "S" || wrG === "A") && (topG === "S" || topG === "A")
      ? `승률 ${s.winRate.toFixed(1)}% · 탑10율 ${s.topTenRate.toFixed(1)}% — 생존 전략이 훌륭합니다. 자기장 판단력이 핵심 강점입니다.`
    : (wrG === "S" || wrG === "A") && (topG === "C" || topG === "D")
      ? `탑10율 ${s.topTenRate.toFixed(1)}%가 낮은데 승률 ${s.winRate.toFixed(1)}%가 높습니다. 파이널 서클 집중력이 특출합니다.`
    : (wrG === "D" || wrG === "C") && (topG === "A" || topG === "S")
      ? `탑10율 ${s.topTenRate.toFixed(1)}%로 살아남는데 승률 ${s.winRate.toFixed(1)}%가 낮습니다. 파이널 서클 교전 능력을 키우세요.`
    : (wrG === "D" && topG === "D")
      ? `승률 ${s.winRate.toFixed(1)}% · 탑10율 ${s.topTenRate.toFixed(1)}% — 자기장 이동을 최우선으로 두는 것부터 시작하세요.`
      : `승률 ${s.winRate.toFixed(1)}% · 탑10율 ${s.topTenRate.toFixed(1)}% — 생존 포지셔닝을 꾸준히 다듬고 있습니다.`;

  items.push({ emoji: "🛡️", label: "생존 / 우승", text: survText, grade: survGrade });

  return items;
}

// ── ② 동적 강점 생성 ────────────────────────────────────────────────────
function buildStrengths(stats: StatDef[], fallback: string[]): string[] {
  const result: string[] = [];

  for (const s of stats) {
    if (s.grade !== "S" && s.grade !== "A") continue;
    if (s.key === "kda")
      result.push(`KDA ${s.value} — 교전에서 손해보지 않는 능력이 수치로 증명됩니다 (${s.sub})`);
    else if (s.key === "damage")
      result.push(`평균 딜 ${s.value} — 팀 기여도 상위권, 교전마다 확실하게 존재감을 남깁니다 (${s.sub})`);
    else if (s.key === "headshot")
      result.push(`헤드샷율 ${s.value} — 탄 한 발의 가치가 높습니다. 조준 정확도가 핵심 강점 (${s.sub})`);
    else if (s.key === "winrate")
      result.push(`승률 ${s.value} — 파이널 서클 처리 능력 탁월, 끝까지 살아남는 법을 알고 있습니다 (${s.sub})`);
    else if (s.key === "topten")
      result.push(`탑10율 ${s.value} — 자기장 판단과 포지셔닝이 상위권, 쓸데없이 죽지 않습니다 (${s.sub})`);
  }

  // A/S 등급이 없으면 B 등급도 강점으로 표시
  if (result.length === 0) {
    for (const s of stats) {
      if (s.grade !== "B") continue;
      if (s.key === "kda")      result.push(`KDA ${s.value} — 평균 이상의 교전 능력을 보유하고 있습니다`);
      else if (s.key === "damage") result.push(`평균 딜 ${s.value} — 팀에 꾸준히 기여하는 딜량`);
      else if (s.key === "topten") result.push(`탑10율 ${s.value} — 기본적인 생존 감각은 갖추고 있습니다`);
      if (result.length >= 2) break;
    }
  }

  // 그래도 없으면 유형 기반 폴백
  return result.length > 0 ? result.slice(0, 3) : fallback.slice(0, 3);
}

// ── ③ 동적 개선 포인트 생성 ──────────────────────────────────────────────
function buildImprovements(stats: StatDef[], fallback: string[]): string[] {
  const result: string[] = [];

  // D 등급 먼저 (가장 심각)
  for (const s of stats) {
    if (s.grade !== "D") continue;
    if (s.key === "kda")
      result.push(`KDA ${s.value} → 매 교전 전 체력·탄약을 먼저 확인하고 불리하면 과감히 회피하세요. 교전 수를 줄이는 것만으로 KDA는 즉시 올라갑니다`);
    else if (s.key === "damage")
      result.push(`딜 ${s.value} → 교전 참여율 자체를 높이세요. 팀원이 붙었을 때 같이 딜을 넣는 습관만으로도 빠르게 개선됩니다`);
    else if (s.key === "headshot")
      result.push(`헤드샷율 ${s.value} → 교전 전 조준점을 항상 머리 높이에 미리 두세요. 총구를 올리는 0.1초를 아끼는 것이 핵심입니다`);
    else if (s.key === "winrate")
      result.push(`승률 ${s.value} → 탑10 진입 후 교전부터 줄이세요. 살아 있는 것 자체가 팀에 기여입니다`);
    else if (s.key === "topten")
      result.push(`탑10율 ${s.value} → 게임 시작과 동시에 자기장 위치를 확인하는 루틴을 만드세요. 이동 타이밍이 생존율을 결정합니다`);
  }

  // C 등급
  for (const s of stats) {
    if (s.grade !== "C") continue;
    if (s.key === "kda")
      result.push(`KDA ${s.value} → 유리한 교전만 골라 싸우는 선별력을 키우세요. 이기는 싸움만 해도 KDA는 크게 올라갑니다`);
    else if (s.key === "damage")
      result.push(`딜 ${s.value} → 엄폐 후 사격 비율을 높이고 근거리 교전 참여를 늘려 딜량을 끌어올리세요`);
    else if (s.key === "headshot")
      result.push(`헤드샷율 ${s.value} → 허리 이하 조준 습관을 교정하세요. 조준점 높이만 바꿔도 딜 효율이 눈에 띄게 올라갑니다`);
    else if (s.key === "winrate")
      result.push(`승률 ${s.value} → 파이널 서클에서 포지션을 먼저 잡고 적이 오게 만드는 수동적 교전을 연습하세요`);
    else if (s.key === "topten")
      result.push(`탑10율 ${s.value} → 초반 교전 참여를 자제하고 자기장 중앙으로 먼저 이동하는 습관을 기르세요`);
    if (result.length >= 3) break;
  }

  // 개선점이 없을 만큼 잘하는 경우 → 상위권 도전 팁
  if (result.length === 0) {
    result.push("현재 지표가 전반적으로 양호합니다. 다음 목표는 일관성(컨시스턴시) — 좋은 게임과 나쁜 게임의 편차를 줄이세요");
    result.push("팀 기여도를 높이려면 어시스트 수에 집중하세요. 킬보다 어시스트가 팀 승률에 더 직결됩니다");
  }

  return result.slice(0, 3).length > 0 ? result.slice(0, 3) : fallback.slice(0, 3);
}

// ── 트렌드 계산 ─────────────────────────────────────────────────────────
interface TrendData {
  recentKDA: number; recentDamage: number; recentWinRate: number;
  kdaDelta: number; damageDelta: number; winRateDelta: number;
  gamesAnalyzed: number;
}

function computeTrend(matches: RecentMatch[], season: SeasonData): TrendData | null {
  if (!matches || matches.length < 3) return null;
  const ms = matches.slice(0, 10);
  const kills   = ms.reduce((s, m) => s + m.kills, 0);
  const assists = ms.reduce((s, m) => s + m.assists, 0);
  const deaths  = ms.filter(m => !m.isWin && m.rank > 1).length;
  const damage  = ms.reduce((s, m) => s + m.damage, 0);
  const wins    = ms.filter(m => m.isWin).length;
  const rKDA    = deaths > 0 ? (kills + assists * 0.5) / deaths : kills + assists * 0.5;
  const rDmg    = damage / ms.length;
  const rWin    = (wins / ms.length) * 100;
  return {
    recentKDA:    Math.round(rKDA * 100) / 100,
    recentDamage: Math.round(rDmg),
    recentWinRate: Math.round(rWin * 10) / 10,
    kdaDelta:     Math.round((rKDA - season.kda) * 100) / 100,
    damageDelta:  Math.round(rDmg - season.avgDamage),
    winRateDelta: Math.round((rWin - season.winRate) * 10) / 10,
    gamesAnalyzed: ms.length,
  };
}

function TrendBadge({ delta, unit = "" }: { delta: number; unit?: string }) {
  const isNeutral = Math.abs(delta) < 0.05 && unit === "";
  if (isNeutral) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#94A3B8" }}>
      <Minus size={9} />보합
    </span>
  );
  const up = delta > 0;
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: up ? "#16A34A" : "#DC2626" }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {up ? "+" : ""}{delta}{unit}
    </span>
  );
}

const ALL_KEYS: PlayStyleKey[] = [
  "eagle","reaper","destroyer","commander","spy","chicken","sniper","breaker",
  "shadow","charger","maniac","faker","ghost","minefield","joker","driver",
  "turtle","assault","allrounder","survivor","rookie",
];

// ── 메인 ─────────────────────────────────────────────────────────────────
export default function AIDiagnosisCard({ styleKey, season, nickname = "", recentMatches = [] }: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState<PlayStyleKey | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showStyles, setShowStyles] = useState(false);

  const activeKey = previewKey ?? styleKey;
  const cfg       = PLAY_STYLES[activeKey] ?? PLAY_STYLES["rookie"];
  const isPreview = previewKey !== null;

  const stats       = season ? buildStats(season) : null;
  const report      = season ? buildReport(season) : null;
  const trend       = season ? computeTrend(recentMatches, season) : null;
  const strengths   = stats  ? buildStrengths(stats, cfg.strengths) : cfg.strengths;
  const improvements = stats ? buildImprovements(stats, cfg.improvements) : cfg.improvements;
  const weakPoint   = stats  ? [...stats].sort((a, b) => {
    const o: Grade[] = ["D","C","B","A","S"];
    return o.indexOf(a.grade) - o.indexOf(b.grade);
  })[0] : null;

  return (
    <>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0", backgroundColor: "#fff" }}>

        {/* ══ 배너 ══════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden px-5 py-5" style={{ background: cfg.gradient }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <span className="text-5xl leading-none">{cfg.emoji}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <span className="text-[10px]">✨</span>
                    <span className="text-[10px] font-black text-white tracking-wide">AI 플레이 진단</span>
                  </div>
                  {isPreview && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}>미리보기</span>
                  )}
                </div>
                <div className="text-2xl font-black text-white leading-none">{cfg.name}</div>
                <div className="text-xs font-medium mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>{cfg.subtitle}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button onClick={() => setShareOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold hover:bg-white/20 transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}>
                <Share2 size={9} />공유
              </button>
              {season && (
                <div className="flex gap-1.5">
                  <span className="text-[11px] font-black text-white px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>KDA {season.kda.toFixed(2)}</span>
                  <span className="text-[11px] font-black text-white px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>딜 {Math.round(season.avgDamage).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ 스탯 등급 카드 ════════════════════════════════════════════ */}
        {stats && (
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-1 h-3.5 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs font-bold" style={{ color: "#0F172A" }}>스탯 등급</span>
              <span className="text-[10px] ml-1" style={{ color: "#94A3B8" }}>시즌 전체 기준</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {stats.map((s) => {
                const gs = GRADE_STYLE[s.grade];
                return (
                  <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1"
                    style={{ backgroundColor: gs.bg, border: `1px solid ${gs.border}` }}>
                    <span className="text-[9px] font-semibold" style={{ color: "#64748B" }}>{s.label}</span>
                    <span className="text-sm font-black" style={{ color: "#0F172A" }}>{s.value}</span>
                    <span className="text-base font-black leading-none" style={{ color: gs.color }}>{s.grade}</span>
                    <span className="text-[8px] font-medium text-center leading-tight" style={{ color: gs.color }}>{s.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ ① AI 분석 리포트 (항목별 분리, 접기) ════════════════════ */}
        {report && (
          <>
            <button
              onClick={() => setShowReport(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-[#F8FAFC]"
              style={{ borderBottom: showReport ? "1px solid #F1F5F9" : "1px solid #F1F5F9" }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-3.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs font-bold" style={{ color: "#0F172A" }}>AI 분석 리포트</span>
                {!showReport && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold ml-1"
                    style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                    교전 · 헤드샷 · 생존 분석
                  </span>
                )}
              </div>
              <span className="text-[10px]" style={{
                color: cfg.color, display: "inline-block",
                transform: showReport ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s"
              }}>▼</span>
            </button>
            {showReport && (
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <div className="space-y-2.5">
                  {report.map((item) => {
                    const gs = GRADE_STYLE[item.grade];
                    return (
                      <div key={item.label} className="flex gap-3 rounded-xl px-3.5 py-3"
                        style={{ backgroundColor: gs.bg, border: `1px solid ${gs.border}` }}>
                        <div className="flex items-center gap-1.5 flex-shrink-0 min-w-[72px]">
                          <span className="text-sm">{item.emoji}</span>
                          <span className="text-[10px] font-black" style={{ color: gs.color }}>{item.label}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ 상세 분석 펼쳐보기 토글 버튼 ══════════════════════════════ */}
        <button
          onClick={() => setShowDetail(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-[#FFF7ED]"
          style={{ borderBottom: showDetail ? "1px solid #F1F5F9" : "none", backgroundColor: showDetail ? "#fff" : "#FAFAFA" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{showDetail ? "📂" : "📁"}</span>
            <span className="text-xs font-bold" style={{ color: "#F97316" }}>
              {showDetail ? "상세 분석 접기" : "상세 분석 펼쳐보기"}
            </span>
            {!showDetail && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FFEDD5" }}>
                트렌드 · 강점 · 개선점 · 유형탐색
              </span>
            )}
          </div>
          <span className="text-[10px]" style={{
            color: "#F97316", display: "inline-block",
            transform: showDetail ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s"
          }}>▼</span>
        </button>

        {showDetail && (
          <>
            {/* ══ 최근 트렌드 ══════════════════════════════════════════ */}
            {trend && (
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1 h-3.5 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
                  <span className="text-xs font-bold" style={{ color: "#0F172A" }}>최근 {trend.gamesAnalyzed}게임 트렌드</span>
                  <span className="text-[10px] ml-1" style={{ color: "#94A3B8" }}>vs 시즌 전체</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "KDA",    recent: trend.recentKDA.toFixed(2),            season: season!.kda.toFixed(2),                       delta: trend.kdaDelta,     unit: "" },
                    { label: "평균 딜", recent: trend.recentDamage.toLocaleString(),   season: Math.round(season!.avgDamage).toLocaleString(), delta: trend.damageDelta,  unit: "" },
                    { label: "승률",   recent: `${trend.recentWinRate}%`,             season: `${season!.winRate.toFixed(1)}%`,               delta: trend.winRateDelta, unit: "%" },
                  ].map((t) => (
                    <div key={t.label} className="rounded-xl p-3"
                      style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                      <div className="text-[9px] font-semibold mb-1.5" style={{ color: "#94A3B8" }}>{t.label}</div>
                      <div className="text-base font-black mb-0.5" style={{ color: "#0F172A" }}>{t.recent}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px]" style={{ color: "#CBD5E1" }}>시즌 {t.season}</span>
                        <TrendBadge delta={t.delta} unit={t.unit} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 text-[11px] leading-relaxed px-1" style={{ color: "#64748B" }}>
                  {trend.kdaDelta >= 0.3 && trend.damageDelta >= 30
                    ? "🔥 최근 퍼포먼스가 시즌 평균을 크게 웃돌고 있습니다. 지금이 랭크 올릴 최적의 타이밍입니다."
                    : trend.kdaDelta <= -0.3 && trend.damageDelta <= -30
                      ? "📉 최근 결과가 시즌 평균보다 저조합니다. 잠깐 쉬거나 플레이 방식을 점검해보세요."
                      : trend.kdaDelta >= 0.15 || trend.damageDelta >= 20
                        ? "📈 최근 소폭 상승세. 현재 플레이 방향을 유지하세요."
                        : trend.kdaDelta <= -0.15 || trend.damageDelta <= -20
                          ? "⚠️ 최근 소폭 하락세. 교전 타이밍과 포지션을 재점검해보세요."
                          : "➡️ 시즌 평균과 비슷한 페이스를 유지 중입니다."}
                </div>
              </div>
            )}

            {/* ══ 강점 + 개선 포인트 ═══════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9]"
              style={{ borderBottom: "1px solid #F1F5F9" }}>
              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1 h-3.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
                  <span className="text-xs font-bold" style={{ color: "#0F172A" }}>잘하는 점</span>
                </div>
                <div className="space-y-2">
                  {strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: "#DCFCE7", border: "1px solid #BBF7D0" }}>
                        <span style={{ fontSize: "9px", color: "#16A34A" }}>✓</span>
                      </div>
                      <span className="text-xs leading-snug" style={{ color: "#374151" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1 h-3.5 rounded-full" style={{ backgroundColor: "#F97316" }} />
                  <span className="text-xs font-bold" style={{ color: "#0F172A" }}>개선 포인트</span>
                </div>
                {weakPoint && (weakPoint.grade === "D" || weakPoint.grade === "C") && (
                  <div className="mb-2.5 px-3 py-2 rounded-lg flex items-center gap-2"
                    style={{ backgroundColor: "#FFF7ED", border: "1px solid #FFEDD5" }}>
                    <span className="text-sm">📌</span>
                    <div>
                      <span className="text-[10px] font-black" style={{ color: "#EA580C" }}>최우선 개선 — </span>
                      <span className="text-[10px]" style={{ color: "#9A3412" }}>
                        {weakPoint.label} {weakPoint.value} ({weakPoint.grade}등급)
                      </span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {improvements.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 text-[9px] font-black"
                        style={{ backgroundColor: `${cfg.color}18`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                        {i + 1}
                      </div>
                      <span className="text-xs leading-snug" style={{ color: "#64748B" }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ 다른 유형 탐색 ════════════════════════════════════════ */}
            <button onClick={() => setShowStyles(v => !v)}
              className="w-full flex items-center justify-between px-5 py-2.5"
              style={{ color: "#64748B" }}>
              <span className="text-[11px] font-semibold">🔍 다른 유형 둘러보기 (21종)</span>
              <span className="text-[10px]" style={{
                color: "#94A3B8", display: "inline-block",
                transform: showStyles ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s"
              }}>▼</span>
            </button>
            {showStyles && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {ALL_KEYS.map((k) => {
                    const s = PLAY_STYLES[k];
                    const active = activeKey === k;
                    return (
                      <button key={k} onClick={() => setPreviewKey(active ? null : k)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all"
                        style={{
                          backgroundColor: active ? s.color : "#F1F5F9",
                          color: active ? "#fff" : "#374151",
                          border: active ? `1px solid ${s.color}` : "1px solid transparent",
                        }}>
                        <span>{s.emoji}</span><span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
                {isPreview && (
                  <button onClick={() => setPreviewKey(null)}
                    className="mt-2 text-[10px] font-semibold px-2 py-1 rounded-full w-full"
                    style={{ backgroundColor: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" }}>
                    ← 내 실제 유형으로 돌아가기
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <DiagnosisShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        styleDef={PLAY_STYLES[styleKey]}
        season={season}
        nickname={nickname}
      />
    </>
  );
}
