import Link from "next/link";
import { Shield, ArrowLeft, Trophy, Zap } from "lucide-react";

interface Props {
  searchParams: Promise<{ players?: string; platform?: string }>;
}

interface SynergyResult {
  type: string;
  players: string[];
  synergyScore: number;
  togetherStats: {
    gamesPlayed: number;
    winRate: number;
    avgPlacement: number;
    avgTotalKills: number;
    avgTotalDamage: number;
    bestGame: {
      isWin: boolean;
      placement: number;
      playerAKills: number;
      playerBKills: number;
      playerADamage: number;
      playerBDamage: number;
    } | null;
  };
  synergyComment: string;
  error?: string;
}

async function fetchSynergy(players: string[], platform: string): Promise<SynergyResult | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/synergy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players, platform }),
      cache: "no-store",
    });
    return res.json();
  } catch {
    return null;
  }
}

function arcPath(cx: number, cy: number, r: number, s: number, e: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(s)), y1 = cy + r * Math.sin(rad(s));
  const x2 = cx + r * Math.cos(rad(e)), y2 = cy + r * Math.sin(rad(e));
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function synergyColor(score: number) {
  if (score >= 75) return "#22C55E";
  if (score >= 55) return "#EAB308";
  return "#F97316";
}

export default async function SynergyPage({ searchParams }: Props) {
  const { players: playersParam, platform = "steam" } = await searchParams;
  const players = (playersParam ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  const [playerA, playerB] = players;
  const result = players.length >= 2 ? await fetchSynergy(players, platform) : null;

  const color = result ? synergyColor(result.synergyScore) : "#72748A";
  const cx = 80, cy = 80, R = 56;
  const score = result?.synergyScore ?? 0;
  const track = arcPath(cx, cy, R, 145, 395);
  const value = arcPath(cx, cy, R, 145, 145 + (score / 100) * 250);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C0C10" }}>
      <header
        className="sticky top-0 z-10"
        style={{ backgroundColor: "#0C0C10CC", backdropFilter: "blur(12px)", borderBottom: "1px solid #26262E" }}
      >
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href={playerA ? `/player/${encodeURIComponent(playerA)}?platform=${platform}` : "/"} className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-colors" style={{ color: "#72748A" }}>
            <ArrowLeft size={14} />뒤로
          </Link>
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: "#F97316" }} />
            <span className="font-bold text-sm" style={{ color: "#ECEFF4" }}>PUBG Tracker</span>
          </div>
          <span className="text-xs" style={{ color: "#72748A" }}>시너지</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6 space-y-4">

        {players.length < 2 && (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#1A1A20", border: "1px solid #26262E" }}>
            <p className="text-sm font-medium mb-1" style={{ color: "#ECEFF4" }}>잘못된 요청</p>
            <p className="text-sm mb-4" style={{ color: "#72748A" }}>2명 이상의 닉네임이 필요합니다</p>
            <Link href="/" className="text-sm font-medium" style={{ color: "#F97316" }}>홈으로 →</Link>
          </div>
        )}

        {players.length >= 2 && (
          <>
            {/* 플레이어 페어 */}
            <div className="rounded-xl p-5" style={{ backgroundColor: "#1A1A20", border: "1px solid #26262E" }}>
              <div className="text-xs font-medium mb-5" style={{ color: "#72748A" }}>시너지 분석</div>
              <div className="flex items-center justify-between">
                <Link href={`/player/${encodeURIComponent(playerA)}?platform=${platform}`} className="flex flex-col items-center gap-1.5 hover:opacity-70 transition-opacity">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: "#141418", color: "#ECEFF4" }}>
                    {playerA[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#ECEFF4" }}>{playerA}</span>
                </Link>

                {/* score gauge */}
                <div className="flex flex-col items-center">
                  <svg width={160} height={128} viewBox="0 0 160 128">
                    <path d={track} fill="none" stroke="#26262E" strokeWidth="7" strokeLinecap="round" />
                    <path d={value} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" opacity="0.25" />
                    <path d={value} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
                    <text x={cx} y={cx - 8} textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="700" fill={color} fontFamily="system-ui, sans-serif">{score}</text>
                    <text x={cx} y={cx + 14} textAnchor="middle" fontSize="10" fill={color} opacity="0.7" fontFamily="system-ui, sans-serif" fontWeight="500">시너지</text>
                  </svg>
                </div>

                <Link href={`/player/${encodeURIComponent(playerB)}?platform=${platform}`} className="flex flex-col items-center gap-1.5 hover:opacity-70 transition-opacity">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: "#141418", color: "#ECEFF4" }}>
                    {playerB[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#ECEFF4" }}>{playerB}</span>
                </Link>
              </div>
            </div>

            {result?.error && (
              <div className="rounded-xl p-4" style={{ backgroundColor: "#EF444410", border: "1px solid #EF444430" }}>
                <p className="text-sm font-semibold" style={{ color: "#EF4444" }}>분석 실패</p>
                <p className="text-sm mt-0.5" style={{ color: "#72748A" }}>{result.error}</p>
              </div>
            )}

            {result && !result.error && (
              <>
                {/* together stats */}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1A1A20", border: "1px solid #26262E" }}>
                  <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #26262E" }}>
                    <Trophy size={14} style={{ color: "#EAB308" }} />
                    <span className="text-sm font-semibold" style={{ color: "#ECEFF4" }}>함께 플레이한 통계</span>
                  </div>
                  <div className="grid grid-cols-3 gap-0">
                    {[
                      { label: "함께한 게임", value: String(result.togetherStats.gamesPlayed), sub: "최근 20게임 기준" },
                      { label: "함께 승률", value: `${result.togetherStats.winRate.toFixed(1)}%`, sub: `평균 #${result.togetherStats.avgPlacement.toFixed(1)}위` },
                      { label: "팀 평균 킬", value: String(result.togetherStats.avgTotalKills), sub: `합산 딜 ${result.togetherStats.avgTotalDamage}` },
                    ].map(({ label, value, sub }, i) => (
                      <div key={label} className="p-4 text-center" style={{ borderRight: i < 2 ? "1px solid #26262E" : undefined }}>
                        <div className="text-xs mb-1.5" style={{ color: "#72748A" }}>{label}</div>
                        <div className="text-xl font-bold" style={{ color: "#ECEFF4" }}>{value}</div>
                        <div className="text-xs mt-1" style={{ color: "#72748A" }}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  {result.togetherStats.bestGame && (
                    <div className="mx-4 mb-4 mt-0 rounded-lg p-4" style={{ backgroundColor: "#EAB30810", border: "1px solid #EAB30825" }}>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Trophy size={12} style={{ color: "#EAB308" }} />
                        <span className="text-xs font-semibold" style={{ color: "#EAB308" }}>역대 최고 게임 (치킨)</span>
                      </div>
                      <div className="flex items-center justify-around">
                        {[
                          { name: playerA, kills: result.togetherStats.bestGame.playerAKills, dmg: result.togetherStats.bestGame.playerADamage },
                          { name: playerB, kills: result.togetherStats.bestGame.playerBKills, dmg: result.togetherStats.bestGame.playerBDamage },
                          { name: "합산", kills: result.togetherStats.bestGame.playerAKills + result.togetherStats.bestGame.playerBKills, dmg: result.togetherStats.bestGame.playerADamage + result.togetherStats.bestGame.playerBDamage },
                        ].map(({ name, kills, dmg }) => (
                          <div key={name} className="text-center">
                            <div className="text-xs mb-1" style={{ color: "#72748A" }}>{name}</div>
                            <div className="text-base font-bold" style={{ color: "#F97316" }}>{kills}K</div>
                            <div className="text-xs mt-0.5" style={{ color: "#72748A" }}>{dmg} DMG</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* comment */}
                <div className="rounded-xl p-5" style={{ backgroundColor: "#1A1A20", border: "1px solid #26262E" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} style={{ color }} />
                    <span className="text-sm font-semibold" style={{ color: "#ECEFF4" }}>AI 시너지 분석</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#A0A8B8" }}>{result.synergyComment}</p>
                </div>

                {/* individual links */}
                <div className="flex gap-3">
                  {[playerA, playerB].map((p) => (
                    <Link
                      key={p}
                      href={`/player/${encodeURIComponent(p)}?platform=${platform}`}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-colors"
                      style={{ backgroundColor: "#1A1A20", color: "#F97316", border: "1px solid #26262E" }}
                    >
                      {p} 전적 보기 →
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #26262E", marginTop: "2rem" }}>
        <div className="max-w-3xl mx-auto px-5 py-5 text-center text-xs" style={{ color: "#3A3A48" }}>
          PUBG Tracker — PUBG Corporation과 무관한 비공식 서비스입니다.
        </div>
      </footer>
    </div>
  );
}
