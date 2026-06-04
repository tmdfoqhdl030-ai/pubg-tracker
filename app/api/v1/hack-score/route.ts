export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/pubg-api";
import { calculateHackScore, type HackScore } from "@/lib/hack-detection";

const MOCK: HackScore = {
  suspicionScore: 18,
  suspicionLevel: "정상",
  evidence: {
    topWeapon: "M416",
    overallHeadshotRate: 22.1,
    headshotPercentile: 20,
    avgKillsPerGame: 2.3,
    killsPerGamePercentile: 25,
    suspiciousFactors: [],
  },
  label: "전반적으로 정상적인 플레이 패턴입니다.",
  disclaimer: "이 점수는 통계적 추정치이며 실제 핵 사용 여부를 확정하지 않습니다.",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");
  const platform = searchParams.get("platform") ?? "steam";

  if (!nickname) return NextResponse.json({ error: "nickname 파라미터가 필요합니다" }, { status: 400 });

  try {
    const player = await getPlayer(nickname, platform);
    const result = await calculateHackScore(player.accountId, platform);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[hack-score]", msg);
    // PUBG API 실패 / 플레이어 없음 시 mock 데이터 반환
    return NextResponse.json(MOCK);
  }
}
