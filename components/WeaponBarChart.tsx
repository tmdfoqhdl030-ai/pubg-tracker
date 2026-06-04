"use client";
import { useState, useEffect } from "react";
import { Target } from "lucide-react";

interface TopWeapon { name: string; fireCount: number; pct: number; }

export default function WeaponBarChart({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const [weapons, setWeapons] = useState<TopWeapon[]>([]);
  const [gamesAnalyzed, setGamesAnalyzed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    fetch(
      `${base}/api/v1/match-weapons?nickname=${encodeURIComponent(nickname)}&platform=${platform}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => {
        if (cancelled) return;
        setWeapons(d?.topWeapons ?? []);
        setGamesAnalyzed(d?.gamesAnalyzed ?? 0);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [nickname, platform]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <Target size={14} style={{ color: "#F97316" }} />
          <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>무기 분석</span>
        </div>
        <div className="p-5 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-14 h-3 rounded bg-[#F1F5F9]" />
              <div className="flex-1 h-7 rounded-xl bg-[#F1F5F9]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (weapons.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 flex items-center justify-center"
        style={{ border: "1px solid #E2E8F0" }}>
        <div className="text-center">
          <div className="text-2xl mb-2">🔫</div>
          <p className="text-xs" style={{ color: "#94A3B8" }}>무기 데이터 없음</p>
          <p className="text-[10px] mt-1" style={{ color: "#CBD5E1" }}>최근 매치 텔레메트리 수집 중</p>
        </div>
      </div>
    );
  }

  const maxFire = Math.max(...weapons.map((w) => w.fireCount), 1);

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: "#F97316" }} />
          <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>무기 분석</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FDBA74" }}>
          최근 {gamesAnalyzed}경기 기준
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* 발사 횟수 바 */}
        <div className="space-y-2.5">
          {weapons.map((w) => {
            const pct = Math.round((w.fireCount / maxFire) * 100);
            const isTop = w.fireCount === maxFire;
            return (
              <div key={w.name} className="flex items-center gap-3">
                <div className="w-14 text-xs font-medium flex-shrink-0 truncate"
                  style={{ color: isTop ? "#F97316" : "#64748B" }}>
                  {w.name}
                </div>
                <div className="flex-1 h-7 rounded-xl overflow-hidden relative"
                  style={{ backgroundColor: "#F1F5F9" }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-xl flex items-center pl-2.5 transition-all duration-700"
                    style={{
                      width: `${Math.max(pct, 4)}%`,
                      backgroundColor: isTop ? "#F97316" : "#CBD5E1",
                    }}
                  />
                  {pct > 22 ? (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-white z-10">
                      {w.fireCount.toLocaleString()}발
                    </span>
                  ) : (
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-xs whitespace-nowrap"
                      style={{ color: "#64748B" }}>
                      {w.fireCount.toLocaleString()}발
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 사용 비율 바 */}
        <div className="pt-4" style={{ borderTop: "1px solid #E2E8F0" }}>
          <div className="text-xs font-medium mb-3" style={{ color: "#64748B" }}>발사 비율</div>
          <div className="space-y-2.5">
            {weapons.map((w) => (
              <div key={w.name} className="flex items-center gap-3">
                <div className="w-14 text-xs flex-shrink-0 truncate" style={{ color: "#64748B" }}>
                  {w.name}
                </div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#F1F5F9" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${w.pct}%`,
                      backgroundColor: w.pct >= 40 ? "#F97316" : "#CBD5E1",
                    }}
                  />
                </div>
                <div className="text-xs font-medium w-8 text-right flex-shrink-0"
                  style={{ color: "#64748B" }}>
                  {w.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
