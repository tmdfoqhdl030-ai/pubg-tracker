"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ChevronRight, Trophy, Target, Swords } from "lucide-react";
import type { TeammateEntry } from "@/lib/teammates";

interface Props { playerNickname: string; platform: string; }
interface TeammatesResponse { basePlayer: string; frequentTeammates: TeammateEntry[]; }

// ── 시너지 점수 → 색상/레이블 ────────────────────────────────────────
function synergyConfig(score: number) {
  if (score >= 70) return { color: "#22C55E", bg: "#F0FDF4", label: "환상의 호흡" };
  if (score >= 50) return { color: "#F59E0B", bg: "#FFFBEB", label: "좋은 팀워크" };
  if (score >= 30) return { color: "#F97316", bg: "#FFF7ED", label: "연습 필요" };
  return { color: "#94A3B8", bg: "#F8FAFC", label: "초기 단계" };
}

// ── 순위 색상 ──────────────────────────────────────────────────────
function placementColor(avg: number) {
  if (avg <= 5)  return "#F59E0B";
  if (avg <= 15) return "#64748B";
  return "#EF4444";
}

// ── 아바타 ───────────────────────────────────────────────────────────
function Avatar({ name, score }: { name: string; score: number }) {
  const syn = synergyConfig(score);
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${syn.color}25, ${syn.color}10)`,
        border: `1.5px solid ${syn.color}40`,
        color: syn.color,
      }}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

// ── 개별 팀원 행 ──────────────────────────────────────────────────────
function TeammateRow({
  t, rank, platform,
}: { t: TeammateEntry; rank: number; platform: string }) {
  const syn = synergyConfig(t.synergyScore);
  const pColor = placementColor(t.avgPlacementTogether);
  const rankLabel = rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

  return (
    <div className="px-4 py-3 hover:bg-[#F8FAFC] transition-colors"
      style={{ borderTop: rank > 1 ? "1px solid #F1F5F9" : undefined }}>
      <div className="flex items-center gap-3">

        {/* 순위 + 아바타 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-black w-5 text-center" style={{ color: "#CBD5E1" }}>
            {rankLabel}
          </span>
          <Avatar name={t.nickname} score={t.synergyScore} />
        </div>

        {/* 메인 정보 */}
        <div className="flex-1 min-w-0">
          {/* 닉네임 줄 */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/player/${encodeURIComponent(t.nickname)}?platform=${platform}`}
              className="font-bold truncate hover:text-[#F97316] transition-colors"
              style={{ color: "#0F172A", fontSize: 13 }}
            >
              {t.nickname}
            </Link>
            {/* 시너지 점수 배지 */}
            <div className="flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: syn.bg, border: `1px solid ${syn.color}30` }}>
              <span className="text-[9px] font-bold" style={{ color: syn.color }}>시너지</span>
              <span className="text-xs font-black" style={{ color: syn.color }}>{t.synergyScore}</span>
            </div>
          </div>

          {/* 스탯 줄 */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* 게임 수 */}
            <div className="flex items-center gap-1">
              <Swords size={10} style={{ color: "#94A3B8" }} />
              <span className="text-[11px] font-semibold" style={{ color: "#374151" }}>
                {t.gamesTogether}게임
              </span>
            </div>
            {/* 승률 */}
            <div className="flex items-center gap-1">
              <Trophy size={10} style={{ color: t.winRateTogether >= 10 ? "#F59E0B" : "#94A3B8" }} />
              <span className="text-[11px] font-semibold"
                style={{ color: t.winRateTogether >= 10 ? "#F59E0B" : "#64748B" }}>
                승률 {t.winRateTogether.toFixed(0)}%
              </span>
            </div>
            {/* 평균 등위 */}
            <div className="flex items-center gap-1">
              <Target size={10} style={{ color: pColor }} />
              <span className="text-[11px] font-semibold" style={{ color: pColor }}>
                평균 {t.avgPlacementTogether.toFixed(1)}위
              </span>
            </div>
            {/* 평균 킬 */}
            {t.avgKillsTogether > 0 && (
              <span className="text-[11px]" style={{ color: "#94A3B8" }}>
                킬 {t.avgKillsTogether.toFixed(1)}
              </span>
            )}
          </div>

          {/* 시너지 바 */}
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${t.synergyScore}%`,
                background: `linear-gradient(90deg, ${syn.color}60, ${syn.color})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px]" style={{ color: "#CBD5E1" }}>{syn.label}</span>
            <span className="text-[9px]" style={{ color: "#CBD5E1" }}>{t.synergyScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 스켈레톤 ─────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-3 rounded bg-[#F1F5F9] flex-shrink-0" />
        <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-24 rounded bg-[#F1F5F9]" />
            <div className="h-5 w-16 rounded-full bg-[#F1F5F9]" />
          </div>
          <div className="flex gap-3">
            <div className="h-2.5 w-12 rounded bg-[#F8FAFC]" />
            <div className="h-2.5 w-16 rounded bg-[#F8FAFC]" />
            <div className="h-2.5 w-14 rounded bg-[#F8FAFC]" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9]" />
        </div>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────
export default function FrequentTeammatesCard({ playerNickname, platform }: Props) {
  const [data, setData] = useState<TeammatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
        const res = await fetch(`${base}/api/teammates?name=${encodeURIComponent(playerNickname)}&platform=${platform}&limit=6`);
        if (!cancelled) {
          if (res.ok) setData(await res.json());
          else setError("불러오기 실패");
        }
      } catch {
        if (!cancelled) setError("서버 연결 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [playerNickname, platform]);

  const teammates = data?.frequentTeammates ?? [];
  const squadUrl = `/squad?${[playerNickname, ...teammates.slice(0, 3).map(t => t.nickname)]
    .map(p => `members=${encodeURIComponent(p)}`)
    .join("&")}&platform=${platform}`;

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>

      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: "#F97316" }} />
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>자주 함께한 팀원</span>
          {!loading && teammates.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FDBA74" }}>
              {teammates.length}명
            </span>
          )}
        </div>
        <span className="text-[10px]" style={{ color: "#94A3B8" }}>최근 20게임</span>
      </div>

      {/* ── 로딩 ── */}
      {loading && (
        <div className="divide-y divide-[#F1F5F9]">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* ── 에러 / 빈 상태 ── */}
      {!loading && (error || teammates.length === 0) && (
        <div className="px-5 py-8 text-center">
          <div className="text-2xl mb-2">👥</div>
          <p className="text-sm font-medium mb-1" style={{ color: "#0F172A" }}>
            {error ? "오류 발생" : "팀원 데이터 없음"}
          </p>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            {error ?? "최근 20게임에서 함께 플레이한 팀원이 없습니다"}
          </p>
        </div>
      )}

      {/* ── 팀원 목록 ── */}
      {!loading && teammates.length > 0 && (
        <>
          <div>
            {teammates.map((t, i) => (
              <TeammateRow key={t.accountId} t={t} rank={i + 1} platform={platform} />
            ))}
          </div>

          {/* ── 스쿼드 분석 버튼 ── */}
          {teammates.length >= 3 && (
            <div className="p-3" style={{ borderTop: "1px solid #F1F5F9" }}>
              <Link
                href={squadUrl}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #F97316, #EA580C)",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(249,115,22,0.25)",
                }}
              >
                <Users size={13} />
                상위 4명으로 스쿼드 분석
                <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
