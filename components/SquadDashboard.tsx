"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, ExternalLink, ChevronDown } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import RoleDonutChart from "./RoleDonutChart";
import { getRoleColor } from "@/lib/utils";
import { getSquadBadges, getAllBadges } from "@/lib/squad-badges";
import { calculateRadarData, analyzeChemistry, generateTacticalReport, getSignatureMap, getWittyTitle } from "@/lib/squad-analysis";

interface SquadMember {
  nickname: string;
  role: string;
  kda: number;
  damage: number;
  headshotRate: number;
  winRate: number;
}

interface Props {
  members: SquadMember[];
  synergyScore: number;
  synergyComment: string;
  strengths: string[];
  weaknesses: string[];
  loading?: boolean;
  platform?: string;
}

// ── 시너지 게이지 (라이트 테마) ───────────────────────────────────────
function SynergyGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22C55E" : score >= 45 ? "#F59E0B" : "#EF4444";
  const label = score >= 70 ? "환상의 호흡" : score >= 45 ? "좋은 팀워크" : "연습 필요";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="48" fill="none" stroke="#F1F5F9" strokeWidth="9" />
          <circle cx="56" cy="56" r="48" fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black leading-none" style={{ color }}>{score}</span>
          <span className="text-[10px] font-semibold mt-0.5" style={{ color: "#94A3B8" }}>/ 100</span>
        </div>
      </div>
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
        style={{ backgroundColor: `${color}15`, color }}>{label}</span>
    </div>
  );
}

// ── 통계 바 (팀원 비교용) ─────────────────────────────────────────────
function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full overflow-hidden w-full mt-1" style={{ backgroundColor: "#F1F5F9" }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────
export default function SquadDashboard({
  members, synergyScore, synergyComment, strengths, weaknesses, loading, platform = "steam",
}: Props) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }} />
        ))}
      </div>
    );
  }

  const maxKDA    = Math.max(...members.map(m => m.kda));
  const maxDamage = Math.max(...members.map(m => m.damage));
  const maxHS     = Math.max(...members.map(m => m.headshotRate));
  const maxWR     = Math.max(...members.map(m => m.winRate));

  const badges = getSquadBadges(members);
  const allBadges = getAllBadges();

  // 신규 프리미엄 데이터 연산
  const radarData = calculateRadarData(members, synergyScore);
  const chemistry = analyzeChemistry(members);
  const tacticalReport = generateTacticalReport(members);
  const signatureMap = getSignatureMap(members);

  return (
    <div className="space-y-4">

      {/* ══ 0. 팀 유형 배지 ══════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <span className="text-base">🎖️</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>우리 팀의 상징 배지</span>
        </div>

        <div className="p-5">
          {/* 현재 매칭된 대표 배지 (1개만 표시) */}
          <div className="flex justify-center">
            {badges.map((b) => (
              <div
                key={b.name}
                className="w-full max-w-md rounded-2xl p-5 flex flex-col justify-between text-white relative overflow-hidden transition-all hover:scale-[1.02] duration-300"
                style={{
                  background: b.gradient,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                  border: `1.5px solid ${b.borderClass}`,
                }}
              >
                {/* 상단 장식 글로우 */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-20"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)"
                  }} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-3xl flex-shrink-0">{b.emoji}</span>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-75">대표 팀 상징</span>
                      <h3 className="text-base font-black tracking-tight" style={{ color: b.textColor }}>
                        {b.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95 font-medium">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 모든 팀 배지 리스트 도감 */}
          <div className="mt-6 pt-4" style={{ borderTop: "1px dashed #F1F5F9" }}>
            <details className="group">
              <summary className="flex items-center justify-center gap-1.5 cursor-pointer list-none select-none text-xs font-semibold text-[#64748B] hover:text-[#F97316] transition-colors py-2">
                <span>📚 모든 팀 배지 종류 보기 (총 {allBadges.length}종)</span>
                <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
              </summary>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-4 pt-2">
                {allBadges.map((b) => {
                  const isCurrent = badges[0]?.name === b.name;
                  return (
                    <div
                      key={b.name}
                      className="rounded-xl p-3 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-300"
                      style={{
                        background: b.gradient,
                        border: `1.5px solid ${b.borderClass}`,
                        opacity: isCurrent ? 1 : 0.45,
                        transform: isCurrent ? "scale(1.02)" : "scale(1)",
                        boxShadow: isCurrent ? "0 4px 10px rgba(0,0,0,0.15)" : "none",
                      }}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-lg flex-shrink-0">{b.emoji}</span>
                          <h4 className="text-[11px] font-extrabold truncate" style={{ color: b.textColor }}>
                            {b.name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[8px] bg-white text-black font-black px-1 py-0.2 rounded-md ml-auto">
                              현재
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] leading-snug opacity-80 font-medium">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* 2열 레이아웃: 팀 시너지 및 보고서 / 종합 전력 지표(레이더 차트) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ══ 1. 팀 시너지 ════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl overflow-hidden flex flex-col justify-between" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <span className="text-base">⭐</span>
            <span className="text-sm font-bold" style={{ color: "#0F172A" }}>팀 시너지 및 작전 보고서</span>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-5">
              {/* 게이지 */}
              <div className="flex-shrink-0">
                <SynergyGauge score={synergyScore} />
              </div>

              {/* 코멘트 */}
              <div className="flex-1">
                <p className="text-xs leading-relaxed font-semibold text-slate-700">{synergyComment}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {strengths.map(s => (
                    <span key={s} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                      <TrendingUp size={8} />↗ {s}
                    </span>
                  ))}
                  {weaknesses.map(w => (
                    <span key={w} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: "#FFF1F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      <TrendingDown size={8} />↘ {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI 사령관 작전 브리핑 */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold text-orange-600 block mb-1">🤖 AI 사령관 작전 브리핑</span>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                {tacticalReport}
              </p>
            </div>
          </div>
        </div>

        {/* ══ 1.5. 팀 전력 레이더 차트 ════════════════════════════════════ */}
        <div className="bg-white rounded-xl overflow-hidden flex flex-col" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <span className="text-base">📊</span>
            <span className="text-sm font-bold" style={{ color: "#0F172A" }}>종합 전력 지표</span>
          </div>
          <div className="p-5 flex-1 flex items-center justify-center min-h-[260px] relative">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 9, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 8 }} />
                <Radar name="Squad" dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2열 레이아웃: 케미 분석 / 선호 전장 분석 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ══ 2. 팀원 간 케미 분석 (Duo Chemistry Matrix) ══════════════════ */}
        <div className="bg-white rounded-xl overflow-hidden flex flex-col" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <span className="text-base">🤝</span>
            <span className="text-sm font-bold" style={{ color: "#0F172A" }}>멤버 간 꿀케미 & 에피소드</span>
          </div>
          <div className="p-5 space-y-3 flex-1 flex flex-col justify-center">
            {chemistry.best && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{chemistry.best.emoji}</span>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 block mb-0.5">최강의 파트너 👑 ({chemistry.best.player1} × {chemistry.best.player2})</span>
                  <h4 className="text-xs font-bold text-slate-800 mb-0.5">{chemistry.best.title}</h4>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">{chemistry.best.description}</p>
                </div>
              </div>
            )}
            {chemistry.comedy && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{chemistry.comedy.emoji}</span>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 block mb-0.5">주의/예능 콤비 ⚠️ ({chemistry.comedy.player1} × {chemistry.comedy.player2})</span>
                  <h4 className="text-xs font-bold text-slate-800 mb-0.5">{chemistry.comedy.title}</h4>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">{chemistry.comedy.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ 2.5. 팀 시그니처 전장 및 드롭존 ═════════════════════════════ */}
        <div className="bg-white rounded-xl overflow-hidden flex flex-col justify-between" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <span className="text-base">🗺️</span>
            <span className="text-sm font-bold" style={{ color: "#0F172A" }}>선호 전장 & 전략 추천</span>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-sky-600 block mb-1">시그니처 전장</span>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base">{signatureMap.bestMapEmoji}</span>
                    <span className="text-xs font-bold text-slate-800">{signatureMap.bestMap}</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 leading-relaxed font-semibold">{signatureMap.bestMapDesc}</p>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-rose-600 block mb-1">피해야 할 무덤</span>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base">{signatureMap.worstMapEmoji}</span>
                    <span className="text-xs font-bold text-slate-800">{signatureMap.worstMap}</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 leading-relaxed font-semibold">{signatureMap.worstMapDesc}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">팀 추천 낙하 지역</span>
                <span className="text-xs font-black text-slate-800">{signatureMap.recommendedZone}</span>
              </div>
              <span className="text-sm px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-extrabold text-[9px]">📍 추천 안전 구역</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 3. 역할 분포 ════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <span className="text-base">👥</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>역할 분포 및 칭호</span>
        </div>

        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* 도넛 차트 */}
            <div className="flex-shrink-0">
              <RoleDonutChart members={members} />
            </div>

            {/* 팀원 목록 */}
            <div className="flex-1 w-full space-y-2">
              {members.map(m => {
                const isMaxKda = m.kda === maxKDA;
                const isMaxDamage = m.damage === maxDamage;
                const isMaxHs = m.headshotRate === maxHS;
                const wittyTitle = getWittyTitle(m, isMaxKda, isMaxDamage, isMaxHs);
                
                return (
                  <div key={m.nickname} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getRoleColor(m.role) }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/player/${encodeURIComponent(m.nickname)}?platform=${platform}`}
                          className="flex items-center gap-1 font-bold hover:text-[#F97316] transition-colors text-xs text-slate-800">
                          {m.nickname}
                          <ExternalLink size={10} style={{ color: "#CBD5E1" }} />
                        </Link>
                        <span className="text-[10px] font-bold text-slate-400 truncate">
                          {wittyTitle}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${getRoleColor(m.role)}15`, color: getRoleColor(m.role), border: `1px solid ${getRoleColor(m.role)}30` }}>
                      {m.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 4. 팀원 비교 ════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <span className="text-base">📊</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>팀원 비교</span>
        </div>

        <div className="p-4 space-y-1">
          {/* 헤더 행 */}
          <div className="grid grid-cols-5 gap-2 px-3 pb-2"
            style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="text-xs font-semibold" style={{ color: "#94A3B8" }}>닉네임</div>
            {["KDA", "딜량", "헤드샷", "승률"].map(h => (
              <div key={h} className="text-xs font-semibold text-center" style={{ color: "#94A3B8" }}>{h}</div>
            ))}
          </div>

          {/* 데이터 행 */}
          {members.map((m, idx) => {
            const roleColor = getRoleColor(m.role);
            return (
              <div key={m.nickname}
                className="grid grid-cols-5 gap-2 items-center px-3 py-2.5 rounded-xl transition-colors hover:bg-[#F8FAFC]"
                style={{ borderTop: idx > 0 ? "1px solid #F8FAFC" : undefined }}>

                {/* 닉네임 */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-7 rounded-full flex-shrink-0"
                    style={{ backgroundColor: roleColor }} />
                  <Link href={`/player/${encodeURIComponent(m.nickname)}?platform=${platform}`}
                    className="text-xs font-bold truncate hover:text-[#F97316] transition-colors"
                    style={{ color: "#0F172A" }}>
                    {m.nickname}
                  </Link>
                </div>

                {/* KDA */}
                <div className="text-center">
                  <div className="text-sm font-black"
                    style={{ color: m.kda === maxKDA ? "#F97316" : "#374151" }}>
                    {m.kda.toFixed(1)}
                    {m.kda === maxKDA && <span className="ml-0.5 text-xs">👑</span>}
                  </div>
                  <StatBar value={m.kda} max={maxKDA} color={m.kda === maxKDA ? "#F97316" : "#94A3B8"} />
                </div>

                {/* 딜량 */}
                <div className="text-center">
                  <div className="text-sm font-black"
                    style={{ color: m.damage === maxDamage ? "#F97316" : "#374151" }}>
                    {m.damage}
                    {m.damage === maxDamage && <span className="ml-0.5 text-xs">👑</span>}
                  </div>
                  <StatBar value={m.damage} max={maxDamage} color={m.damage === maxDamage ? "#F97316" : "#94A3B8"} />
                </div>

                {/* 헤드샷 */}
                <div className="text-center">
                  <div className="text-sm font-black"
                    style={{ color: m.headshotRate === maxHS ? "#8B5CF6" : "#374151" }}>
                    {m.headshotRate}%
                    {m.headshotRate === maxHS && <span className="ml-0.5 text-xs">👑</span>}
                  </div>
                  <StatBar value={m.headshotRate} max={maxHS} color={m.headshotRate === maxHS ? "#8B5CF6" : "#94A3B8"} />
                </div>

                {/* 승률 */}
                <div className="text-center">
                  <div className="text-sm font-black"
                    style={{ color: m.winRate === maxWR ? "#22C55E" : "#374151" }}>
                    {m.winRate}%
                    {m.winRate === maxWR && <span className="ml-0.5 text-xs">👑</span>}
                  </div>
                  <StatBar value={m.winRate} max={maxWR} color={m.winRate === maxWR ? "#22C55E" : "#94A3B8"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
