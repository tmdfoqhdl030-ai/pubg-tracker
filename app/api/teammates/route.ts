import { NextRequest, NextResponse } from "next/server";
import { getPlayer, getMatch } from "@/lib/pubg-api";
import { buildFrequentTeammates } from "@/lib/teammates";
import { getCache, setCache } from "@/lib/cache";

const TTL_30MIN = 30 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const platform = searchParams.get("platform") ?? "steam";
  const limit = Math.min(Number(searchParams.get("limit") ?? 6), 10);

  if (!name) {
    return NextResponse.json({ error: "name 파라미터가 필요합니다" }, { status: 400 });
  }

  const cacheKey = `teammates:${platform}:${name.toLowerCase()}`;
  const cached = getCache<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // 1. 플레이어 조회 (1 RPM)
    const player = await getPlayer(name, platform);

    // 2. 최근 매치 데이터 수집 (RPM 무제한)
    const matchLimit = Math.min(player.recentMatchIds.length, 20);
    const matchResults = await Promise.allSettled(
      player.recentMatchIds.slice(0, matchLimit).map((id) => getMatch(id, platform))
    );

    const matchDataList = matchResults
      .filter((r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled")
      .map((r) => r.value as Record<string, unknown>);

    // 3. 팀원 빈도 집계
    const teammates = buildFrequentTeammates(matchDataList, player.accountId);
    const topTeammates = teammates.slice(0, limit);

    const result = {
      basePlayer: player.nickname,
      accountId: player.accountId,
      frequentTeammates: topTeammates,
    };

    setCache(cacheKey, result, TTL_30MIN);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "플레이어를 찾을 수 없습니다" }, { status: 404 });
    }
    if (msg === "RATE_LIMIT") {
      return NextResponse.json({ error: "API 요청 한도 초과. 잠시 후 재시도하세요" }, { status: 429 });
    }
    console.error("[Teammates API]", msg);
    return NextResponse.json({ error: "팀원 조회 중 오류가 발생했습니다" }, { status: 500 });
  }
}
