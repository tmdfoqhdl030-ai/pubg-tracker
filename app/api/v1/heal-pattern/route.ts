import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/pubg-api";
import { analyzeHealPattern, type HealPattern } from "@/lib/heal-pattern";

const MOCK: HealPattern = {
  totalHeals: 47,
  breakdown: {
    bandage: 12,
    firstAid: 15,
    medKit: 5,
    energyDrink: 8,
    painkiller: 6,
    adrenaline: 1,
  },
  ratios: {
    bandage: 26,
    firstAid: 32,
    medKit: 11,
    energyDrink: 17,
    painkiller: 13,
    adrenaline: 2,
  },
  style: "균형형",
  styleDescription: "힐 아이템을 골고루 사용하는 균형 잡힌 생존 스타일입니다. 상황에 따라 유동적으로 힐링합니다.",
  funFact: "구급상자를 가장 즐겨 사용하는 플레이어입니다.",
  gamesAnalyzed: 8,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");
  const platform = searchParams.get("platform") ?? "steam";

  if (!nickname) return NextResponse.json({ error: "nickname 파라미터가 필요합니다" }, { status: 400 });

  try {
    const player = await getPlayer(nickname, platform);
    const result = await analyzeHealPattern(player.accountId, platform, player.recentMatchIds);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[heal-pattern]", msg);
    // PUBG API 실패 / 플레이어 없음 시 mock 데이터 반환
    return NextResponse.json(MOCK);
  }
}
