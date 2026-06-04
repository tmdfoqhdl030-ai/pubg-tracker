function scoreColor(s: number) { return s >= 70 ? "#EF4444" : s >= 40 ? "#EAB308" : "#22C55E"; }
function scoreLabel(s: number) { return s >= 70 ? "위험" : s >= 40 ? "주의" : "안전"; }

interface Props {
  score: number;
  recentKDA: number;
  recentDamage: number;
  recentHeadshot: number;
  preferredWeapon?: string | null;
  playStyle: string;
}

export default function DangerScoreCard({
  score,
  recentKDA,
  recentDamage,
  recentHeadshot,
  preferredWeapon,
  playStyle,
}: Props) {
  const color = scoreColor(score);
  const s = Math.max(0, Math.min(100, score));

  const stats = [
    { label: "KDA", value: recentKDA.toFixed(1) },
    { label: "헤드샷", value: `${recentHeadshot}%` },
    { label: "딜량", value: String(recentDamage) },
    { label: "스타일", value: playStyle },
    ...(preferredWeapon && preferredWeapon !== "Unknown"
      ? [{ label: "무기", value: preferredWeapon }]
      : []),
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      <div className="px-4 py-3 flex flex-wrap items-center gap-3">
        {/* 점수 + 라벨 */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${color}12`,
              border: `2px solid ${color}35`,
            }}
          >
            <span className="text-sm font-black" style={{ color }}>{s}</span>
          </div>
          <div>
            <div className="text-xs font-bold leading-tight" style={{ color }}>
              {scoreLabel(s)}
            </div>
            <div className="text-[10px] leading-tight mt-0.5" style={{ color: "#94A3B8" }}>
              매치 전 위험도
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
                background: `linear-gradient(90deg, ${color}60, ${color})`,
              }}
            />
          </div>
          <div className="text-[9px] mt-1" style={{ color: "#CBD5E1" }}>
            최근 5게임 기준
          </div>
        </div>

        {/* 스탯 칩 */}
        <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="text-center px-2 py-1.5 rounded-lg"
              style={{ backgroundColor: "#F8FAFC" }}
            >
              <div className="text-[9px]" style={{ color: "#94A3B8" }}>{label}</div>
              <div className="text-[11px] font-semibold whitespace-nowrap" style={{ color: "#0F172A" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
