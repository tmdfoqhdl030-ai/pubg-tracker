"use client";
import { useState, useEffect } from "react";

interface HotZone { name: string; pickupCount: number; pct: number; }
interface FarmData { farmingStyle: string; hotZones: HotZone[]; map: string; gamesAnalyzed: number; }
interface TopWeapon { name: string; fireCount: number; pct: number; }

const WEAPON_EMOJI: Record<string, string> = {
  M416: "🔫", AWM: "🎯", UMP45: "🔫", AKM: "🔫", SKS: "🔭",
  M24: "🎯", Kar98k: "🎯", "DP-28": "🔫", MK14: "🔭", Mini14: "🔭",
  QBZ95: "🔫", G36C: "🔫", "Beryl M762": "🔫", "SCAR-L": "🔫",
  HK416: "🔫", K2: "🔫", ACE32: "🔫", Groza: "🔫", P90: "🔫",
  Vector: "🔫", MP5K: "🔫", Tommy: "🔫", "PP-19 Bizon": "🔫",
  MG3: "🔫", M249: "🔫", "Lynx AMR": "🎯", SLR: "🔭",
  VSS: "🔭", Win94: "🎯", Mosin: "🎯", Crossbow: "🏹",
};

const MAP_COLOR: Record<string, string> = {
  Erangel: "#22C55E", Miramar: "#F59E0B", Taego: "#F97316",
  Sanhok: "#84CC16", Vikendi: "#60A5FA", Deston: "#8B5CF6", Rondo: "#EC4899",
};
const FARM_STYLE_CFG: Record<string, { emoji: string; color: string }> = {
  핫드랍형:  { emoji: "🔥", color: "#EF4444" },
  외곽파밍형: { emoji: "🌿", color: "#22C55E" },
  중간지역형: { emoji: "⚡", color: "#3B82F6" },
};

// ── 순위 색상 (1~10위) ─────────────────────────────────────────────────
const RANK_COLORS = [
  "#F59E0B", // 1
  "#94A3B8", // 2
  "#CD7F32", // 3
  "#64748B", "#64748B", "#64748B", "#64748B",
  "#64748B", "#64748B", "#64748B",
];

export default function LandingZonesCard({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const [farmData, setFarmData]       = useState<FarmData | null>(null);
  const [farmLoading, setFarmLoading] = useState(true);
  const [farmError, setFarmError]     = useState<string | null>(null);

  const [weapons, setWeapons]           = useState<TopWeapon[]>([]);
  const [weapLoading, setWeapLoading]   = useState(true);
  const [weapError, setWeapError]       = useState<string | null>(null);

  // ── 드롭존 (farming-heatmap) — 독립 fetch ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    setFarmLoading(true);
    setFarmError(null);
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    fetch(`${base}/api/v1/farming-heatmap?nickname=${encodeURIComponent(nickname)}&platform=${platform}`)
      .then(async (r) => {
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({}));
          throw new Error(errBody.error ?? `HTTP_${r.status}`);
        }
        return r.json();
      })
      .then(d => {
        if (!cancelled) {
          if (d?.error) {
            setFarmError(d.error);
          } else {
            setFarmData(d);
          }
          setFarmLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFarmError(err.message === "RATE_LIMIT" ? "RATE_LIMIT" : "ERROR");
          setFarmLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [nickname, platform]);

  // ── 주무기 (match-weapons) — 독립 fetch ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    setWeapLoading(true);
    setWeapError(null);
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    fetch(`${base}/api/v1/match-weapons?nickname=${encodeURIComponent(nickname)}&platform=${platform}`)
      .then(async (r) => {
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({}));
          throw new Error(errBody.error ?? `HTTP_${r.status}`);
        }
        return r.json();
      })
      .then(d => {
        if (!cancelled) {
          if (d?.error) {
            setWeapError(d.error);
          } else {
            setWeapons(d?.topWeapons ?? []);
          }
          setWeapLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setWeapError(err.message === "RATE_LIMIT" ? "RATE_LIMIT" : "ERROR");
          setWeapLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [nickname, platform]);

  const mapColor  = MAP_COLOR[farmData?.map ?? ""] ?? "#64748B";
  const styleCfg  = FARM_STYLE_CFG[farmData?.farmingStyle ?? ""] ?? { emoji: "⚡", color: "#3B82F6" };
  const topZones  = farmData?.hotZones?.slice(0, 10) ?? [];
  const maxPct    = topZones[0]?.pct ?? 1;

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>

      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <span className="text-sm">📍</span>
          <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>주요 드롭 지역 TOP 10</span>
        </div>
        {farmData && topZones.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${mapColor}15`, color: mapColor }}>
              {farmData.map}
            </span>
            <span className="text-[11px] font-bold" style={{ color: styleCfg.color }}>
              {styleCfg.emoji} {farmData.farmingStyle}
            </span>
          </div>
        )}
      </div>

      {/* ── 드롭 지역 섹션 ── */}
      {farmLoading ? (
        /* 로딩 스켈레톤 */
        <div className="px-4 py-3 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-4 h-3 rounded bg-[#F1F5F9]" />
              <div className="flex-1 space-y-1">
                <div className="h-3 rounded bg-[#F1F5F9]" style={{ width: `${70 - i * 8}%` }} />
                <div className="h-1.5 rounded-full bg-[#F1F5F9]" />
              </div>
              <div className="w-8 h-2 rounded bg-[#F8FAFC]" />
            </div>
          ))}
        </div>
      ) : topZones.length === 0 ? (
        /* 데이터 없음 */
        <div className="px-4 py-5 text-center">
          <div className="text-2xl mb-1.5">🗺️</div>
          <p className="text-xs font-medium" style={{ color: "#64748B" }}>드롭 데이터 없음</p>
          <p className="text-[10px] mt-0.5" style={{ color: "#CBD5E1" }}>
            픽업 좌표 수집에 실패했습니다
          </p>
        </div>
      ) : (
        /* 실제 데이터 */
        <>
          <div className="px-4 pt-3 pb-1 space-y-2">
            {topZones.map((z, i) => {
              const barW = Math.round((z.pct / maxPct) * 100);
              const rc   = RANK_COLORS[i] ?? "#64748B";
              return (
                <div key={z.name} className="flex items-center gap-2">
                  <span className="text-[10px] font-black w-4 text-center flex-shrink-0"
                    style={{ color: rc }}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium" style={{ color: "#0F172A" }}>{z.name}</span>
                      <span className="text-[10px]" style={{ color: "#94A3B8" }}>{z.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barW}%`, backgroundColor: mapColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-2">
            <p className="text-[10px]" style={{ color: "#CBD5E1" }}>
              최근 {farmData!.gamesAnalyzed}게임 픽업 좌표 분석
            </p>
          </div>
        </>
      )}

      {/* ══ 구분선 ══════════════════════════════════════════════════════ */}
      <div className="mx-4" style={{ borderTop: "1px solid #F1F5F9" }} />

      {/* ── 주무기 섹션 (드롭존과 독립적으로 항상 표시) ── */}
      <div className="px-4 pt-3 pb-3">
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔫</span>
            <span className="text-xs font-semibold" style={{ color: "#0F172A" }}>자주 쓰는 무기</span>
          </div>
          {!weapLoading && weapons.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FDBA74" }}>
              최근 5경기
            </span>
          )}
        </div>

        {weapLoading ? (
          /* 무기 로딩 스켈레톤 */
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-5 h-3 rounded bg-[#F1F5F9]" />
                <div className="w-14 h-3 rounded bg-[#F1F5F9]" />
                <div className="flex-1 h-2 rounded-full bg-[#F1F5F9]" />
                <div className="w-8 h-3 rounded bg-[#F8FAFC]" />
              </div>
            ))}
          </div>
        ) : weapons.length === 0 ? (
          <p className="text-[10px] text-center py-1" style={{ color: "#CBD5E1" }}>
            무기 데이터를 수집하지 못했습니다
          </p>
        ) : (
          <div className="space-y-2">
            {weapons.map((w, i) => {
              const isTop    = i === 0;
              const barColor = isTop ? "#F97316" : i === 1 ? "#94A3B8" : "#CBD5E1";
              return (
                <div key={w.name} className="flex items-center gap-2">
                  {/* 이모지 */}
                  <span className="text-[13px] flex-shrink-0 w-5 text-center">
                    {WEAPON_EMOJI[w.name] ?? "🔫"}
                  </span>
                  {/* 무기명 */}
                  <span className="text-[11px] font-semibold flex-shrink-0 w-[68px] truncate"
                    style={{ color: isTop ? "#F97316" : "#374151" }}>
                    {w.name}
                  </span>
                  {/* 바 */}
                  <div className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#F1F5F9" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(w.pct, 3)}%`, backgroundColor: barColor }} />
                  </div>
                  {/* 비율 + 발사 수 */}
                  <div className="flex-shrink-0 text-right" style={{ minWidth: "52px" }}>
                    <span className="text-[11px] font-bold"
                      style={{ color: isTop ? "#F97316" : "#64748B" }}>
                      {w.pct}%
                    </span>
                    <span className="text-[9px] ml-1" style={{ color: "#CBD5E1" }}>
                      {w.fireCount >= 1000
                        ? `${(w.fireCount / 1000).toFixed(1)}k발`
                        : `${w.fireCount}발`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
