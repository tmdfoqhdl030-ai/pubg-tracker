// 💊 나의 생존 스타일 카드 — 비동기 서버 컴포넌트

import type { HealPattern } from "@/lib/heal-pattern";
import { getBaseUrl } from "@/lib/base-url";

async function fetchHealPattern(nickname: string, platform: string): Promise<HealPattern | null> {
  try {
    const base = getBaseUrl();
    const res = await fetch(
      `${base}/api/v1/heal-pattern?nickname=${encodeURIComponent(nickname)}&platform=${platform}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const HEAL_META: Record<string, { label: string; color: string; emoji: string }> = {
  adrenaline:  { label: "아드레날린",  color: "#EF4444", emoji: "💉" },
  painkiller:  { label: "진통제",      color: "#F97316", emoji: "💊" },
  medKit:      { label: "의료용 키트", color: "#22C55E", emoji: "🩺" },
  firstAid:    { label: "구급상자",    color: "#3B82F6", emoji: "🩹" },
  energyDrink: { label: "에너지 음료", color: "#8B5CF6", emoji: "🥤" },
  bandage:     { label: "붕대",        color: "#94A3B8", emoji: "🩸" },
};

const STYLE_CONFIG: Record<string, { emoji: string; color: string }> = {
  공격형:   { emoji: "⚔️", color: "#EF4444" },
  존버형:   { emoji: "🛡", color: "#3B82F6" },
  균형형:   { emoji: "⚖️", color: "#22C55E" },
  극생존형: { emoji: "🏥", color: "#22C55E" },
  무모형:   { emoji: "💀", color: "#F97316" },
};

export default async function HealPatternCard({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const data = await fetchHealPattern(nickname, platform);
  if (!data || data.gamesAnalyzed === 0) return null;

  const styleCfg = STYLE_CONFIG[data.style] ?? { emoji: "⚖️", color: "#64748B" };

  // ratio 내림차순 정렬
  const sortedKeys = (Object.keys(data.ratios) as (keyof typeof data.ratios)[])
    .sort((a, b) => (data.ratios[b] ?? 0) - (data.ratios[a] ?? 0));

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">💊</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>나의 생존 스타일</span>
        </div>
        <span className="text-xs" style={{ color: "#94A3B8" }}>최근 {data.gamesAnalyzed}게임</span>
      </div>

      {/* 설명 */}
      <div className="px-5 pt-3 pb-0">
        <p className="text-[11px] leading-relaxed" style={{ color: "#94A3B8" }}>
          회복 아이템 사용 패턴을 분석해 플레이 성향을 분류합니다.
          아드레날린·진통제를 자주 쓰면 <span style={{ color: "#EF4444" }}>공격형</span>,
          구급상자·키트 위주면 <span style={{ color: "#3B82F6" }}>존버형</span>,
          붕대를 남발하면 <span style={{ color: "#F97316" }}>무모형</span>으로 판단합니다.
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* style badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${styleCfg.color}10, ${styleCfg.color}05)`, border: `1px solid ${styleCfg.color}25` }}>
          <span className="text-2xl">{styleCfg.emoji}</span>
          <div>
            <div className="text-lg font-black" style={{ color: styleCfg.color }}>{data.style}</div>
            <div className="text-[11px] leading-snug mt-0.5" style={{ color: "#64748B" }}>
              총 힐 {data.totalHeals}회 사용
            </div>
          </div>
        </div>

        {/* breakdown bars */}
        <div className="space-y-2.5">
          {sortedKeys.map((key) => {
            const meta = HEAL_META[key];
            if (!meta) return null;
            const ratio = data.ratios[key] ?? 0;
            const count = data.breakdown[key] ?? 0;
            if (count === 0) return null;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{meta.emoji}</span>
                    <span className="text-xs font-medium" style={{ color: "#374151" }}>{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>{count}회</span>
                    <span className="text-xs font-bold" style={{ color: meta.color }}>{ratio}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(ratio, 2)}%`, backgroundColor: meta.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* description + fun fact */}
        <div className="space-y-2">
          <div className="text-xs leading-relaxed p-3 rounded-lg"
            style={{ backgroundColor: "#F8FAFC", color: "#374151", border: "1px solid #E2E8F0" }}>
            💬 {data.styleDescription}
          </div>
          {data.funFact && (
            <p className="text-[11px]" style={{ color: "#94A3B8" }}>{data.funFact}</p>
          )}
        </div>
      </div>
    </div>
  );
}
