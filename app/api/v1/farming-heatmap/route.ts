import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/pubg-api";
import { analyzeFarmingHeatmap, type FarmingHeatmap } from "@/lib/farming-heatmap";

// 실제 텔레메트리 분석 실패 시 빈 데이터 반환 (가짜 데이터 표시 방지)
const EMPTY: FarmingHeatmap = {
  map: "Erangel",
  pickupPoints: [],
  hotZones: [],
  farmingStyle: "중간지역형",
  avgPickupsPerGame: 0,
  mostPickedItem: "",
  gamesAnalyzed: 0,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");
  const platform = searchParams.get("platform") ?? "steam";

  if (!nickname) return NextResponse.json({ error: "nickname 파라미터가 필요합니다" }, { status: 400 });

  try {
    const player = await getPlayer(nickname, platform);
    if (!player.recentMatchIds || player.recentMatchIds.length === 0) {
      return NextResponse.json({
        ...EMPTY,
        error: "NO_RECENT_MATCHES",
        message: "최근 14일간 게임 플레이 기록이 없습니다."
      });
    }
    const result = await analyzeFarmingHeatmap(player.accountId, platform, player.recentMatchIds);
    if (result.gamesAnalyzed === 0) {
      return NextResponse.json({
        ...EMPTY,
        error: "NO_RECENT_MATCHES",
        message: "최근 14일간 게임 플레이 기록이 없습니다."
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[farming-heatmap]", msg);
    if (msg === "RATE_LIMIT") {
      return NextResponse.json(
        { error: "RATE_LIMIT", message: "PUBG API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "SERVER_ERROR", message: msg },
      { status: 500 }
    );
  }
}
