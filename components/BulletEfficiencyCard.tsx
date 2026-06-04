// 🎯 무기별 탄약 효율 (BPK) 카드 — 비동기 서버 컴포넌트

import type { BulletEfficiency } from "@/lib/bullet-efficiency";

async function fetchBulletEfficiency(nickname: string, platform: string): Promise<BulletEfficiency | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";
    const res = await fetch(
      `${base}/api/v1/bullet-efficiency?nickname=${encodeURIComponent(nickname)}&platform=${platform}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const GRADE_CONFIG: Record<string, { color: string; bg: string }> = {
  S: { color: "#F59E0B", bg: "#FFF7ED" },
  A: { color: "#22C55E", bg: "#F0FDF4" },
  B: { color: "#3B82F6", bg: "#EFF6FF" },
  C: { color: "#F97316", bg: "#FFF7ED" },
  D: { color: "#EF4444", bg: "#FEF2F2" },
};

export default async function BulletEfficiencyCard({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const data = await fetchBulletEfficiency(nickname, platform);
  if (!data || data.weapons.length === 0) return null;

  const maxBpk = Math.max(...data.weapons.map((w) => w.bulletsPerKill), 1);

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>무기 탄약 효율 (BPK)</span>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold" style={{ color: "#0F172A" }}>
            효율 점수 <span style={{ color: data.efficiencyScore >= 60 ? "#22C55E" : data.efficiencyScore >= 40 ? "#F97316" : "#EF4444" }}>
              {data.efficiencyScore}
            </span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="px-5 pt-3 pb-0">
        <p className="text-[11px] leading-relaxed" style={{ color: "#94A3B8" }}>
          <strong style={{ color: "#64748B" }}>BPK</strong>(Bullets Per Kill)는 킬 1개당 소모한 평균 탄약 수입니다.
          숫자가 <span style={{ color: "#22C55E" }}>낮을수록</span> 적은 탄으로 킬을 따내는 정밀한 플레이어입니다.
          등급은 S(최상)~D(개선 필요) 순으로 매겨집니다.
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* summary row */}
        {data.overallBpk > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "평균 BPK", value: data.overallBpk.toFixed(1), sub: "발/킬" },
              { label: "최고 효율", value: data.bestWeapon, sub: "정확도 1위" },
              { label: "개선 필요", value: data.worstWeapon, sub: "탄약 절약 필요" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="p-2.5 rounded-lg" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="text-[10px] mb-1" style={{ color: "#94A3B8" }}>{label}</div>
                <div className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>{value}</div>
                <div className="text-[9px]" style={{ color: "#CBD5E1" }}>{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* weapon rows */}
        <div className="space-y-3">
          {data.weapons.map((w) => {
            const gcfg = GRADE_CONFIG[w.efficiency] ?? GRADE_CONFIG.B;
            const barPct = Math.max(5, Math.round((w.bulletsPerKill / Math.max(maxBpk, 50)) * 100));
            return (
              <div key={w.weaponName}>
                <div className="flex items-center gap-2 mb-1.5">
                  {/* grade badge */}
                  <span
                    className="text-[11px] font-black w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: gcfg.bg, color: gcfg.color }}>
                    {w.efficiency}
                  </span>
                  <span className="text-xs font-semibold flex-1 truncate" style={{ color: "#0F172A" }}>
                    {w.weaponName}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                      {w.totalKills}킬
                    </span>
                    <span className="text-xs font-bold" style={{ color: gcfg.color }}>
                      {w.bulletsPerKill.toFixed(1)}발/킬
                    </span>
                    <span className="text-[10px]" style={{ color: "#CBD5E1" }}>
                      상위 {w.percentile}%
                    </span>
                  </div>
                </div>
                {/* bar — 짧을수록 효율 좋음 */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barPct}%`, backgroundColor: gcfg.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* advice */}
        {data.weapons.length > 0 && (
          <div className="text-xs leading-relaxed px-3 py-2.5 rounded-lg"
            style={{ backgroundColor: "#F8FAFC", color: "#374151", border: "1px solid #E2E8F0" }}>
            💬 {data.weapons[0].funLabel}
          </div>
        )}
      </div>
    </div>
  );
}
