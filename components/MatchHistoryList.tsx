"use client";
import { useState, useEffect } from "react";
import { formatSurvived } from "@/lib/utils";

interface Teammate { name: string; kills: number; damage: number; }

interface Match {
  id: string;
  map: string;
  mode: string;
  rank: number;
  kills: number;
  assists?: number;
  damage: number;
  survived: number;
  isWin: boolean;
  isRanked?: boolean;
  playedAt?: string;
  teammates?: Teammate[];
  totalPlayers?: number;
  distanceKm?: number;
  weapon?: string;
}

// ── 상수 ──────────────────────────────────────────────────────────────
const MAP_COLOR: Record<string, string> = {
  Erangel:"#22C55E", Miramar:"#F59E0B", Taego:"#F97316",
  Sanhok:"#84CC16",  Vikendi:"#60A5FA", Deston:"#8B5CF6", Rondo:"#EC4899",
};
const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  "솔로":      { bg:"#EFF6FF", color:"#3B82F6" },
  "솔로FPP":   { bg:"#EFF6FF", color:"#3B82F6" },
  "듀오":      { bg:"#F0FDF4", color:"#16A34A" },
  "듀오FPP":   { bg:"#F0FDF4", color:"#16A34A" },
  "스쿼드":    { bg:"#FFF7ED", color:"#EA580C" },
  "스쿼드FPP": { bg:"#FFF7ED", color:"#EA580C" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)     return "방금 전";
  if (diff < 3600)   return `${Math.floor(diff/60)}분 전`;
  if (diff < 86400)  return `${Math.floor(diff/3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff/86400)}일 전`;
  return `${Math.floor(diff/604800)}주 전`;
}

const FILTER_TABS = [
  { id:"all",   label:"전체" },
  { id:"solo",  label:"솔로" },
  { id:"duo",   label:"듀오" },
  { id:"squad", label:"스쿼드" },
] as const;
type FilterId = typeof FILTER_TABS[number]["id"];

function matchesFilter(mode: string, filter: FilterId): boolean {
  if (filter === "all") return true;
  const m = mode.toLowerCase();
  if (filter === "solo")  return m.includes("솔로") || m.includes("solo");
  if (filter === "duo")   return m.includes("듀오") || m.includes("duo");
  if (filter === "squad") return m.includes("스쿼드") || m.includes("squad");
  return true;
}

// ── 팀원 아바타 칩 (dak.gg 스타일) ──────────────────────────────────
function TeammateChips({ teammates }: { teammates: Teammate[] }) {
  if (!teammates || teammates.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      {teammates.map((t) => {
        const killColor = t.kills >= 5 ? "#F97316" : t.kills >= 3 ? "#EAB308" : "#64748B";
        const initial = t.name[0]?.toUpperCase() ?? "?";
        return (
          <div key={t.name}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor:"#F1F5F9", border:"1px solid #E2E8F0" }}>
            {/* 아바타 */}
            <span className="w-4 h-4 rounded-sm text-[9px] font-black flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor:"#E2E8F0", color:"#475569" }}>
              {initial}
            </span>
            {/* 이름 */}
            <span className="text-[10px] font-medium max-w-[60px] truncate" style={{ color:"#374151" }}>
              {t.name}
            </span>
            {/* 킬 */}
            <span className="text-[10px] font-bold flex-shrink-0" style={{ color: killColor }}>
              {t.kills}킬
            </span>
            {/* 딜 */}
            <span className="text-[9px] flex-shrink-0" style={{ color:"#9CA3AF" }}>
              {Math.round(t.damage).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── 매치 행 ──────────────────────────────────────────────────────────
function MatchRow({ match, weaponMap }: { match: Match; weaponMap: Record<string, string> }) {
  // 서버에서 받은 weapon 우선, 없으면 클라이언트 텔레메트리 결과 사용
  const displayWeapon = match.weapon ?? weaponMap[match.id] ?? null;
  const mc       = MAP_COLOR[match.map] ?? "#64748B";
  const modeCfg  = MODE_COLORS[match.mode] ?? { bg:"#F8FAFC", color:"#64748B" };
  const top10Thr = match.totalPlayers ? Math.ceil(match.totalPlayers * 0.1) : 10;
  const isTop10  = !match.isWin && match.rank <= top10Thr;
  const isAce    = match.kills >= 5;
  const maxTeamKills = Math.max(...(match.teammates?.map(t=>t.kills) ?? [0]));
  const isMVP    = match.isWin && match.kills > 0 && match.kills >= maxTeamKills;

  const rankColor   = match.isWin ? "#3B82F6" : isTop10 ? "#F59E0B" : "#94A3B8";
  const borderColor = match.isWin ? "#BFDBFE" : isTop10 ? "#FDE68A" : "#E2E8F0";
  const bgColor     = match.isWin ? "#F0F7FF" : isTop10 ? "#FFFBEB" : "#fff";

  return (
    <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${borderColor}` }}>
      <div className="flex items-stretch">
        {/* 컬러 사이드 바 */}
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: rankColor }} />

        <div className="flex-1 px-3 py-2.5" style={{ backgroundColor: bgColor }}>
          {/* ─ 상단 스탯 행 ─ */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* 순위 */}
            <div className="flex-shrink-0 w-9 text-center">
              <div className="text-sm font-black leading-none" style={{ color: rankColor }}>
                {match.isWin ? "WIN" : `#${match.rank}`}
              </div>
              {match.totalPlayers && (
                <div className="text-[9px]" style={{ color:"#CBD5E1" }}>/{match.totalPlayers}</div>
              )}
            </div>

            {/* 모드 + 맵 */}
            <div className="flex-shrink-0 min-w-[88px]">
              <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: modeCfg.bg, color: modeCfg.color }}>
                  {match.mode}
                </span>
                {match.isRanked && (
                  <span className="text-[9px] font-semibold px-1 py-0.5 rounded"
                    style={{ backgroundColor:"#FEF3C7", color:"#D97706" }}>경쟁</span>
                )}
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ backgroundColor:`${mc}18`, color: mc }}>
                {match.map}
              </span>
            </div>

            {/* 주무기 */}
            {displayWeapon && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                  style={{ backgroundColor:"#1E293B", border:"1px solid #334155" }}>
                  <span className="text-[9px]">🔫</span>
                  <span className="text-[10px] font-bold" style={{ color:"#E2E8F0" }}>
                    {displayWeapon}
                  </span>
                </div>
              </div>
            )}

            {/* 킬 */}
            <div className="flex-shrink-0 text-center min-w-[44px]">
              <div className="flex items-center justify-center gap-0.5">
                <span className="text-lg font-black leading-none"
                  style={{ color: match.kills>=5?"#F97316":match.kills>=3?"#EAB308":"#1E293B" }}>
                  {match.kills}
                </span>
                {isMVP && (
                  <span className="text-[8px] font-black px-1 py-0.5 rounded ml-0.5"
                    style={{ backgroundColor:"#F5F3FF", color:"#7C3AED", border:"1px solid #C4B5FD" }}>MVP</span>
                )}
                {isAce && !isMVP && (
                  <span className="text-[8px] font-black px-1 py-0.5 rounded ml-0.5"
                    style={{ backgroundColor:"#FFF7ED", color:"#F97316", border:"1px solid #FDBA74" }}>ACE</span>
                )}
              </div>
              <div className="text-[9px]" style={{ color:"#94A3B8" }}>
                킬{match.assists ? ` +${match.assists}어시` : ""}
              </div>
            </div>

            <div className="w-px h-6 flex-shrink-0" style={{ backgroundColor:"#E2E8F0" }} />

            {/* 딜량 */}
            <div className="flex-shrink-0 text-center min-w-[50px]">
              <div className="text-sm font-bold" style={{ color:"#1E293B" }}>
                {Math.round(match.damage).toLocaleString()}
              </div>
              <div className="text-[9px]" style={{ color:"#94A3B8" }}>딜량</div>
            </div>

            {/* 이동 거리 */}
            {match.distanceKm !== undefined && (
              <div className="flex-shrink-0 text-center min-w-[40px]">
                <div className="text-xs font-semibold" style={{ color:"#64748B" }}>{match.distanceKm}km</div>
                <div className="text-[9px]" style={{ color:"#94A3B8" }}>이동</div>
              </div>
            )}

            {/* 생존 */}
            <div className="flex-shrink-0 text-center min-w-[44px]">
              <div className="text-xs font-semibold" style={{ color:"#64748B" }}>{formatSurvived(match.survived)}</div>
              <div className="text-[9px]" style={{ color:"#94A3B8" }}>생존</div>
            </div>

            {/* Top10 배지 */}
            {isTop10 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ backgroundColor:"#FFFBEB", color:"#D97706", border:"1px solid #FDE68A" }}>
                탑10
              </span>
            )}

            {/* 시간 */}
            <div className="flex-1 text-right">
              {match.playedAt && (
                <span className="text-[9px]" style={{ color:"#CBD5E1" }}>{timeAgo(match.playedAt)}</span>
              )}
            </div>
          </div>

          {/* ─ 팀원 칩 (항상 표시, dak.gg 스타일) ─ */}
          {match.teammates && match.teammates.length > 0 && (
            <TeammateChips teammates={match.teammates} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── 요약 헤더 ──────────────────────────────────────────────────────────
function ModeSummary({ matches }: { matches: Match[] }) {
  if (matches.length === 0) return null;
  const wins    = matches.filter(m=>m.isWin).length;
  const losses  = matches.length - wins;
  const winPct  = Math.round((wins/matches.length)*100);
  const avgKill = (matches.reduce((s,m)=>s+m.kills,0)/matches.length).toFixed(1);
  const avgDmg  = Math.round(matches.reduce((s,m)=>s+m.damage,0)/matches.length);
  return (
    <div className="flex items-center gap-px">
      {[
        { label:"승",      value:String(wins),  color:"#3B82F6" },
        { label:"패",      value:String(losses), color:"#EF4444" },
        { label:"승률",    value:`${winPct}%`,   color:"#64748B" },
        { label:"평균 킬", value:avgKill,         color:"#F97316" },
        { label:"평균 딜", value:avgDmg.toLocaleString(), color:"#0F172A" },
      ].map(({label,value,color},i)=>(
        <div key={i} className="flex-1 text-center py-2 first:rounded-l-lg last:rounded-r-lg"
          style={{ backgroundColor:"#F8FAFC", border:"1px solid #F1F5F9" }}>
          <div className="text-[9px]" style={{ color:"#94A3B8" }}>{label}</div>
          <div className="text-xs font-bold mt-0.5" style={{ color }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────
export default function MatchHistoryList({
  matches,
  nickname,
  platform,
}: {
  matches: Match[];
  nickname?: string;
  platform?: string;
}) {
  const [filter, setFilter] = useState<FilterId>("all");
  // matchId → 주무기 이름 (텔레메트리 기반)
  const [weaponMap, setWeaponMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!nickname || !platform) return;
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    fetch(
      `${base}/api/v1/match-weapons?nickname=${encodeURIComponent(nickname)}&platform=${platform}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const { matchId, weapon } of d?.matchWeapons ?? []) {
          if (weapon) map[matchId] = weapon;
        }
        setWeaponMap(map);
      });
    return () => { cancelled = true; };
  }, [nickname, platform]);

  const filtered = matches.filter(m=>matchesFilter(m.mode, filter));

  const counts = {
    all:   matches.length,
    solo:  matches.filter(m=>matchesFilter(m.mode,"solo")).length,
    duo:   matches.filter(m=>matchesFilter(m.mode,"duo")).length,
    squad: matches.filter(m=>matchesFilter(m.mode,"squad")).length,
  };

  const winPct = filtered.length > 0
    ? Math.round((filtered.filter(m=>m.isWin).length / filtered.length)*100)
    : 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border:"1px solid #E2E8F0" }}>

      {/* 헤더 */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom:"1px solid #F1F5F9" }}>
        <span className="text-sm font-bold" style={{ color:"#0F172A" }}>매치 히스토리</span>
        <span className="text-xs" style={{ color:"#94A3B8" }}>최근 {matches.length}게임</span>
      </div>

      {/* 모드 필터 탭 */}
      <div className="flex" style={{ borderBottom:"1px solid #F1F5F9" }}>
        {FILTER_TABS.map(({id,label})=>(
          <button key={id} onClick={()=>setFilter(id)}
            className="flex-1 py-2 text-xs font-bold transition-colors relative"
            style={{
              color: filter===id ? "#F97316" : "#94A3B8",
              backgroundColor: filter===id ? "#FFF7ED" : "transparent",
            }}>
            {label}
            <span className="ml-0.5 text-[9px]" style={{ color:"#CBD5E1" }}>({counts[id]})</span>
            {filter===id && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor:"#F97316" }} />}
          </button>
        ))}
      </div>

      {/* 요약 + 승률 바 */}
      <div className="px-3 pt-2.5">
        <ModeSummary matches={filtered} />
        {filtered.length>0 && (
          <div className="flex h-[3px] mt-2 rounded-full overflow-hidden">
            <div style={{ width:`${winPct}%`, backgroundColor:"#3B82F6" }} />
            <div style={{ flex:1, backgroundColor:"#FECACA" }} />
          </div>
        )}
      </div>

      {/* 매치 목록 */}
      <div className="p-3 space-y-2">
        {filtered.length===0 ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">⚔️</div>
            <p className="text-xs" style={{ color:"#94A3B8" }}>해당 모드 기록 없음</p>
          </div>
        ) : (
          filtered.map(m=><MatchRow key={m.id} match={m} weaponMap={weaponMap} />)
        )}
      </div>
    </div>
  );
}
