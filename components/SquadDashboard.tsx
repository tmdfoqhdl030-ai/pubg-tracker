"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import RoleDonutChart from "./RoleDonutChart";
import { getRoleColor } from "@/lib/utils";

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

  return (
    <div className="space-y-4">

      {/* ══ 1. 팀 시너지 ════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        {/* 헤더 */}
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <span className="text-base">⭐</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>팀 시너지</span>
        </div>

        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* 게이지 */}
            <div className="flex-shrink-0">
              <SynergyGauge score={synergyScore} />
            </div>

            {/* 코멘트 + 태그 */}
            <div className="flex-1 space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{synergyComment}</p>
              <div className="flex flex-wrap gap-2">
                {strengths.map(s => (
                  <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                    <TrendingUp size={10} />↗ {s}
                  </span>
                ))}
                {weaknesses.map(w => (
                  <span key={w} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: "#FFF1F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                    <TrendingDown size={10} />↘ {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 2. 역할 분포 ════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <span className="text-base">👥</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>역할 분포</span>
        </div>

        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* 도넛 차트 */}
            <div className="flex-shrink-0">
              <RoleDonutChart members={members} />
            </div>

            {/* 팀원 목록 */}
            <div className="flex-1 w-full space-y-2">
              {members.map(m => (
                <div key={m.nickname} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                  {/* 역할 색 dot */}
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getRoleColor(m.role) }} />
                  {/* 닉네임 */}
                  <Link href={`/player/${encodeURIComponent(m.nickname)}?platform=${platform}`}
                    className="flex items-center gap-1 font-semibold flex-1 hover:text-[#F97316] transition-colors"
                    style={{ color: "#0F172A", fontSize: 13 }}>
                    {m.nickname}
                    <ExternalLink size={10} style={{ color: "#CBD5E1" }} />
                  </Link>
                  {/* 역할 배지 */}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${getRoleColor(m.role)}15`, color: getRoleColor(m.role), border: `1px solid ${getRoleColor(m.role)}30` }}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 3. 팀원 비교 ════════════════════════════════════════════════ */}
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
