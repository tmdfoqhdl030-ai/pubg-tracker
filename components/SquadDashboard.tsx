"use client";

import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { getSquadBadges, getAllBadges } from "@/lib/squad-badges";
import { calculateRadarData, generateTacticalReport } from "@/lib/squad-analysis";

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

  const badges = getSquadBadges(members);
  const allBadges = getAllBadges();

  const radarData = calculateRadarData(members, synergyScore);
  const tacticalReport = generateTacticalReport(members);

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
              <span className="text-[10px] font-bold text-orange-600 block mb-2.5">🤖 AI 사령관 작전 브리핑</span>
              <div className="space-y-2.5">
                {tacticalReport.map((item, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className="text-base leading-none">{item.icon}</span>
                      <span className="text-[8px] font-black text-orange-500 mt-1">{item.phase}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5 border-l border-slate-200 pl-2.5">
                      <p className="text-[11px] font-bold text-slate-800 leading-snug">{item.title}</p>
                      <p className="text-[10.5px] text-slate-500 leading-snug mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
