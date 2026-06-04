"use client";
import { useState } from "react";
import { getTierFromString, getTier, PUBGTierEmblem } from "./TierBadge";

interface ModeStats {
  kda: number; winRate: number; avgDamage: number;
  headshotRate: number; topTenRate: number;
  gamesPlayed: number; wins: number; top10s: number; losses: number;
  avgRank: number; kills: number;
}

interface RankedTierInfo {
  tier: string; subTier: string; rp: number;
  wins: number; losses: number; games: number;
  kills: number; kda: number; winRate: number; avgDamage: number;
}

interface SeasonData {
  kda: number; winRate: number; avgDamage: number;
  headshotRate: number; topTenRate: number; gamesPlayed: number;
}

interface Props {
  season: SeasonData;
  modeStats?: { squad: ModeStats | null; duo: ModeStats | null; solo: ModeStats | null } | null;
  rankedTier?: { squad: RankedTierInfo | null; duo: RankedTierInfo | null; solo: RankedTierInfo | null } | null;
}

// ── PUBG 실제 스타일 티어 엠블럼 (PUBGTierEmblem 위임) ─────────────────
function TierBadgeIcon({ tier, subTier, size = 68 }: { tier: string; subTier: string; size?: number }) {
  return <PUBGTierEmblem tier={tier} subTier={subTier} size={size} />;
}

// ── 랭크 모드 카드 (스쿼드/듀오) ──────────────────────────────────────
function RankedModeCard({ modeName, info }: { modeName: string; info: RankedTierInfo }) {
  const cfg = getTierFromString(info.tier);
  const top10Count = Math.round(info.games * 0.3); // 추정
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cfg.color}30` }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: `${cfg.color}12`, borderBottom: `1px solid ${cfg.color}20` }}>
        <span className="text-xs font-black" style={{ color: cfg.color }}>{modeName}</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span style={{ color: "#3B82F6" }} className="font-bold">{info.wins}승</span>
          <span style={{ color: "#94A3B8" }}>{top10Count}탑</span>
          <span style={{ color: "#EF4444" }} className="font-bold">{info.losses}패</span>
        </div>
      </div>

      {/* 티어 + RP */}
      <div className="flex items-center gap-3 px-3 py-3"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <TierBadgeIcon tier={info.tier} subTier={info.subTier} size={52} />
        <div>
          <div className="text-base font-black leading-tight" style={{ color: cfg.color }}>
            {info.rp.toLocaleString()} <span className="text-xs font-semibold">RP</span>
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: "#94A3B8" }}>
            시즌 {info.games}게임
          </div>
        </div>
      </div>

      {/* 스탯 그리드 */}
      <div className="grid grid-cols-3 divide-x divide-[#F1F5F9]" style={{ borderBottom: "1px solid #F1F5F9" }}>
        {[
          { label: "K/D",   value: info.kda.toFixed(2),                      color: cfg.color },
          { label: "승률",  value: `${info.winRate.toFixed(1)}%`,             color: "#3B82F6" },
          { label: "Top10", value: `${Math.round(info.games * 0.3 / info.games * 100)}%`, color: "#22C55E" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center py-2">
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>{label}</div>
            <div className="text-sm font-bold mt-0.5" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#F1F5F9]">
        {[
          { label: "평균 딜량", value: Math.round(info.avgDamage).toLocaleString() },
          { label: "게임 수",   value: String(info.games) },
          { label: "평균 킬",   value: (info.kills / Math.max(info.games, 1)).toFixed(1) },
        ].map(({ label, value }) => (
          <div key={label} className="text-center py-2">
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>{label}</div>
            <div className="text-xs font-bold mt-0.5" style={{ color: "#0F172A" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 일반 모드 스탯 행 ──────────────────────────────────────────────────
function NormalStatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px]" style={{ color: "#94A3B8" }}>{label}</div>
      <div className="text-xs font-bold mt-0.5" style={{ color: color ?? "#0F172A" }}>{value}</div>
    </div>
  );
}

function NormalModeColumn({ modeName, stats }: { modeName: string; stats: ModeStats | null }) {
  const empty = !stats || stats.gamesPlayed === 0;
  const overall = stats ? getTier(stats.kda) : null;
  return (
    <div className="flex-1 min-w-0 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-black" style={{ color: "#0F172A" }}>{modeName}</span>
        {stats && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
            style={{ backgroundColor: `${overall?.color}15`, color: overall?.color }}>
            {stats.wins}승 {stats.losses}패
          </span>
        )}
      </div>
      {empty ? (
        <p className="text-[10px]" style={{ color: "#CBD5E1" }}>기록 없음</p>
      ) : (
        <div className="grid grid-cols-3 gap-y-2">
          <NormalStatCell label="K/D"    value={stats!.kda.toFixed(2)}                    color={overall?.color} />
          <NormalStatCell label="승률"   value={`${stats!.winRate.toFixed(1)}%`}           color="#3B82F6" />
          <NormalStatCell label="Top10"  value={`${stats!.topTenRate.toFixed(1)}%`}        color="#22C55E" />
          <NormalStatCell label="평균딜" value={Math.round(stats!.avgDamage).toLocaleString()} />
          <NormalStatCell label="게임수" value={String(stats!.gamesPlayed)} />
          <NormalStatCell label="평균등수" value={`#${stats!.avgRank > 0 ? stats!.avgRank.toFixed(1) : "-"}`} />
          <NormalStatCell label="헤드샷" value={`${stats!.headshotRate.toFixed(1)}%`}      color="#8B5CF6" />
          <NormalStatCell label="탑10수" value={String(stats!.top10s)} />
          <NormalStatCell label="총킬"   value={String(stats!.kills)} />
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────
export default function PlayerCard({ season, modeStats, rankedTier }: Props) {
  const [tab, setTab] = useState<"ranked" | "normal">("ranked");

  // 랭크 데이터가 있는 모드만 추려서 표시
  const rankedModes = [
    { key: "squad" as const, label: "스쿼드" },
    { key: "duo"   as const, label: "듀오" },
    { key: "solo"  as const, label: "솔로" },
  ].filter(({ key }) => rankedTier?.[key]);

  const hasRanked = rankedModes.length > 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>

      {/* 탭 헤더 */}
      <div className="flex" style={{ borderBottom: "1px solid #E2E8F0" }}>
        {[
          { id: "ranked" as const, label: "⚔️ 경쟁전" },
          { id: "normal" as const, label: "🎮 일반" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 py-2.5 text-xs font-bold transition-colors"
            style={{
              color: tab === id ? "#F97316" : "#94A3B8",
              borderBottom: tab === id ? "2px solid #F97316" : "2px solid transparent",
              marginBottom: "-1px",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── 경쟁전 탭 ── */}
      {tab === "ranked" && (
        <div className="p-3 space-y-3">
          {!hasRanked ? (
            <div className="text-center py-6">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-xs" style={{ color: "#94A3B8" }}>이번 시즌 랭크 플레이 기록 없음</p>
            </div>
          ) : (
            rankedModes.map(({ key, label }) => (
              <RankedModeCard key={key} modeName={label} info={rankedTier![key]!} />
            ))
          )}
        </div>
      )}

      {/* ── 일반전 탭 ── */}
      {tab === "normal" && (
        <div>
          <div className="px-3 py-2" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <span className="text-[11px] font-bold" style={{ color: "#0F172A" }}>일반 게임 전적</span>
          </div>
          <div className="flex divide-x divide-[#F1F5F9]">
            <NormalModeColumn modeName="솔로"  stats={modeStats?.solo  ?? null} />
            <NormalModeColumn modeName="듀오"  stats={modeStats?.duo   ?? null} />
            <NormalModeColumn modeName="스쿼드" stats={modeStats?.squad ?? null} />
          </div>
          {/* 전체 합산 */}
          <div className="px-3 py-2.5 grid grid-cols-3 gap-2"
            style={{ borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFAFA" }}>
            {[
              { label: "시즌 KDA",   value: season.kda.toFixed(2),                        color: getTier(season.kda).color },
              { label: "시즌 승률",  value: `${season.winRate.toFixed(1)}%`,              color: "#3B82F6" },
              { label: "총 게임 수", value: String(season.gamesPlayed) },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="text-[9px]" style={{ color: "#CBD5E1" }}>{label}</div>
                <div className="text-xs font-black mt-0.5" style={{ color: color ?? "#0F172A" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
