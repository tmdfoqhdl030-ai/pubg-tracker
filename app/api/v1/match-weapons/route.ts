import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/pubg-api";
import { analyzeRecentWeapons } from "@/lib/recent-weapons";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");
  const platform = searchParams.get("platform") ?? "steam";

  if (!nickname) {
    return NextResponse.json({ error: "nickname 파라미터가 필요합니다" }, { status: 400 });
  }

  try {
    const player = await getPlayer(nickname, platform);
    if (!player.recentMatchIds || player.recentMatchIds.length === 0) {
      return NextResponse.json({
        matchWeapons: [],
        topWeapons: [],
        gamesAnalyzed: 0,
        error: "NO_RECENT_MATCHES",
        message: "최근 14일간 게임 플레이 기록이 없습니다."
      });
    }
    const result = await analyzeRecentWeapons(
      player.accountId,
      platform,
      player.recentMatchIds
    );
    if (result.gamesAnalyzed === 0) {
      return NextResponse.json({
        matchWeapons: [],
        topWeapons: [],
        gamesAnalyzed: 0,
        error: "NO_RECENT_MATCHES",
        message: "최근 14일간 게임 플레이 기록이 없습니다."
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[match-weapons]", msg);
    // 오류/한도초과 모두 빈 데이터로 조용히 처리
    return NextResponse.json({ matchWeapons: [], topWeapons: [], gamesAnalyzed: 0, _limited: msg === "RATE_LIMIT" });
  }
}
