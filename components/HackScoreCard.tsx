// 🔍 핵 의심 지수 카드 — 컴팩트 수평 레이아웃

import type { HackScore } from "@/lib/hack-detection";
import { getBaseUrl } from "@/lib/base-url";

async function fetchHackScore(nickname: string, platform: string): Promise<HackScore | null> {
  try {
    const base = getBaseUrl();
    const res = await fetch(
      `${base}/api/v1/hack-score?nickname=${encodeURIComponent(nickname)}&platform=${platform}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const LEVEL_CONFIG = {
  정상:    { color: "#22C55E", bg: "#F0FDF4", border: "#BBF7D0" },
  의심:    { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  강한의심: { color: "#F97316", bg: "#FFF7ED", border: "#FDBA74" },
  핵의심:  { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
};

export default async function HackScoreCard({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const data = await fetchHackScore(nickname, platform);
  if (!data) return null;

  const cfg = LEVEL_CONFIG[data.suspicionLevel] ?? LEVEL_CONFIG["정상"];
  const s = data.suspicionScore;

  const stats = [
    { label: "헤드샷율",  value: `${data.evidence.overallHeadshotRate.toFixed(1)}%` },
    { label: "킬/게임",   value: data.evidence.avgKillsPerGame.toFixed(1) },
    { label: "헤드샷 상위", value: `${data.evidence.headshotPercentile.toFixed(0)}%` },
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${cfg.border}` }}>
      <div className="px-4 py-3 flex flex-wrap items-center gap-3">

        {/* 점수 + 라벨 */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.color}35` }}
          >
            <span className="text-sm font-black" style={{ color: cfg.color }}>{s}</span>
          </div>
          <div>
            <div className="text-xs font-bold leading-tight" style={{ color: cfg.color }}>
              {data.suspicionLevel}
            </div>
            <div className="text-[10px] leading-tight mt-0.5" style={{ color: "#94A3B8" }}>
              핵 의심 지수
            </div>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="flex-1 min-w-[80px]">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${s}%`,
                background: `linear-gradient(90deg, ${cfg.color}60, ${cfg.color})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px]" style={{ color: "#CBD5E1" }}>0 정상</span>
            <span className="text-[9px]" style={{ color: "#CBD5E1" }}>100 핵의심</span>
          </div>
        </div>

        {/* 스탯 칩 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center px-2 py-1.5 rounded-lg" style={{ backgroundColor: "#F8FAFC" }}>
              <div className="text-[9px]" style={{ color: "#94A3B8" }}>{label}</div>
              <div className="text-[11px] font-semibold whitespace-nowrap" style={{ color: "#0F172A" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 의심 요인 */}
      {data.evidence.suspiciousFactors.length > 0 && (
        <div className="px-4 pb-3">
          <div
            className="text-[10px] px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${cfg.color}08`, color: cfg.color, border: `1px solid ${cfg.color}20` }}
          >
            ⚠️ {data.evidence.suspiciousFactors[0]}
          </div>
        </div>
      )}

      {/* 정상일 때 안내 */}
      {data.evidence.suspiciousFactors.length === 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#F8FAFC", color: "#94A3B8" }}>
            ✓ {data.label}
          </p>
        </div>
      )}
    </div>
  );
}
