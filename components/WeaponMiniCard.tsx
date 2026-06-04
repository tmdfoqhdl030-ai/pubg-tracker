"use client";
import { useState, useEffect } from "react";
import { Crosshair } from "lucide-react";

interface TopWeapon { name: string; fireCount: number; pct: number; }

const WEAPON_EMOJI: Record<string, string> = {
  M416: "🔫", AWM: "🎯", UMP45: "🔫", AKM: "🔫", SKS: "🔭",
  M24: "🎯", Kar98k: "🎯", M249: "🔫", "DP-28": "🔫", MK14: "🔭",
  Mini14: "🔭", QBZ95: "🔫", G36C: "🔫", "Beryl M762": "🔫",
  "SCAR-L": "🔫", HK416: "🔫", K2: "🔫", ACE32: "🔫",
};

export default function WeaponMiniCard({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const [weapons, setWeapons] = useState<TopWeapon[]>([]);
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
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [nickname, platform]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <Crosshair size={13} style={{ color: "#F97316" }} />
          <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>주력 무기</span>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-[#F1F5F9]" />
                <div className="h-3 w-12 rounded bg-[#F1F5F9]" />
              </div>
              <div className="h-1.5 rounded-full bg-[#F1F5F9]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (weapons.length === 0) return null;

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <Crosshair size={13} style={{ color: "#F97316" }} />
          <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>주력 무기</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FDBA74" }}>
          최근 5경기
        </span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {weapons.map((w, i) => {
          const isTop = i === 0;
          return (
            <div key={w.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{WEAPON_EMOJI[w.name] ?? "🔫"}</span>
                  <span className="text-xs font-semibold truncate max-w-[80px]"
                    style={{ color: isTop ? "#F97316" : "#0F172A" }}>
                    {w.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                    {w.fireCount.toLocaleString()}발
                  </span>
                  <span className="text-xs font-bold" style={{ color: isTop ? "#F97316" : "#64748B" }}>
                    {w.pct}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(w.pct, 3)}%`,
                    backgroundColor: isTop ? "#F97316" : "#CBD5E1",
                  }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
