import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/pubg-api";
import { analyzeCarepackageStats, type CarepackageStats } from "@/lib/carepackage-stats";

const MOCK: CarepackageStats = {
  totalLootCount: 9,
  gamesWithLoot: 3,
  itemsLooted: [
    { displayName: "아드레날린", count: 4 },
    { displayName: "AWM", count: 1 },
    { displayName: "레벨3 헬멧", count: 1 },
  ],
  mostLootedItem: "아드레날린",
  title: "보급함 사냥꾼",
  funFact: "8게임 중 3번 보급함을 열었습니다. AWM을 1회 획득했네요!",
  gamesAnalyzed: 8,
  percentile: 42,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");
  const platform = searchParams.get("platform") ?? "steam";

  if (!nickname) return NextResponse.json({ error: "nickname 파라미터가 필요합니다" }, { status: 400 });

  try {
    const player = await getPlayer(nickname, platform);
    const result = await analyzeCarepackageStats(player.accountId, platform, player.recentMatchIds);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[carepackage]", msg);
    // PUBG API 실패 시 mock 데이터 반환
    return NextResponse.json(MOCK);
  }
}
