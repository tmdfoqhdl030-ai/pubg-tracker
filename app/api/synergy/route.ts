import { NextRequest, NextResponse } from "next/server";
import { getPlayer, getMatch } from "@/lib/pubg-api";
import { parseTogetherMatches, calculateSynergyScore } from "@/lib/teammates";
import { getCache, setCache } from "@/lib/cache";

const TTL_1HOUR = 60 * 60 * 1000;

function generateSynergyComment(score: number, gamesTogether: number, winRate: number): string {
  if (gamesTogether === 0) return "함께 플레이한 최근 기록이 없습니다. 매치를 더 쌓으면 분석이 가능합니다.";
  if (score >= 85) return `최상급 시너지 듀오입니다. ${gamesTogether}게임의 경험치와 ${winRate.toFixed(1)}% 승률이 이를 증명합니다.`;
  if (score >= 70) return `호흡이 잘 맞는 파트너입니다. 포지셔닝을 통일하면 승률이 더 올라갈 수 있습니다.`;
  if (score >= 55) return `준수한 시너지입니다. 교전 타이밍을 맞추고 함께 움직이는 연습을 늘려보세요.`;
  if (score >= 40) return `아직 발전 여지가 많습니다. 함께 플레이하며 역할을 분담하면 시너지가 올라갑니다.`;
  return `초기 단계입니다. 게임을 더 함께 쌓으면 시너지 점수가 의미 있는 수준이 됩니다.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { players, platform = "steam" } = body as { players: string[]; platform: string };

    if (!Array.isArray(players) || players.length < 2) {
      return NextResponse.json({ error: "players 배열에 2명 이상 필요합니다" }, { status: 400 });
    }

    const [baseNick, ...withNicks] = players.map((p: string) => p.trim());

    // 듀오 분석만 지원 (스쿼드는 순차로 확장 가능)
    const withNick = withNicks[0];

    // 캐시 키: 알파벳 정렬 → 순서 무관
    const sortedKey = [...players].sort().join(",").toLowerCase();
    const cacheKey = `synergy:${platform}:${sortedKey}`;
    const cached = getCache<unknown>(cacheKey);
    if (cached) return NextResponse.json(cached);

    // 1. Base 플레이어 조회 (1 RPM)
    const playerA = await getPlayer(baseNick, platform);

    // 2. 최근 매치 fetch (unlimited RPM)
    const matchLimit = Math.min(playerA.recentMatchIds.length, 5);
    const matchResults = await Promise.allSettled(
      playerA.recentMatchIds.slice(0, matchLimit).map(async (id) => ({
        matchId: id,
        data: await getMatch(id, platform),
      }))
    );

    const matchEntries = matchResults
      .filter((r): r is PromiseFulfilledResult<{ matchId: string; data: unknown }> =>
        r.status === "fulfilled"
      )
      .map((r) => r.value);

    // 3. 같이 플레이한 매치 파싱
    const togetherMatches = parseTogetherMatches(
      matchEntries.map((e) => ({ matchId: e.matchId, data: e.data as Record<string, unknown> })),
      playerA.accountId,
      withNick
    );

    const gamesTogether = togetherMatches.length;
    const winsTogether = togetherMatches.filter((m) => m.isWin).length;
    const winRateTogether = gamesTogether > 0 ? (winsTogether / gamesTogether) * 100 : 0;
    const avgPlacement =
      gamesTogether > 0
        ? togetherMatches.reduce((s, m) => s + m.placement, 0) / gamesTogether
        : 99;
    const avgCombinedKills =
      gamesTogether > 0
        ? Math.round(
            (togetherMatches.reduce((s, m) => s + m.playerAKills + m.playerBKills, 0) /
              gamesTogether) * 10
          ) / 10
        : 0;
    const avgCombinedDamage =
      gamesTogether > 0
        ? Math.round(
            togetherMatches.reduce((s, m) => s + m.playerADamage + m.playerBDamage, 0) /
              gamesTogether
          )
        : 0;

    const synergyScore = calculateSynergyScore(gamesTogether, winRateTogether, avgPlacement);

    // 역대 최고 게임 (이긴 게임 중 합산 킬 최대)
    const wins = togetherMatches.filter((m) => m.isWin);
    const bestGame =
      wins.length > 0
        ? wins.reduce((best, m) =>
            m.playerAKills + m.playerBKills > best.playerAKills + best.playerBKills ? m : best
          )
        : null;

    const result = {
      type: players.length === 2 ? "duo" : "squad",
      players,
      synergyScore,
      togetherStats: {
        gamesPlayed: gamesTogether,
        winRate: Math.round(winRateTogether * 10) / 10,
        avgPlacement: Math.round(avgPlacement * 10) / 10,
        avgTotalKills: avgCombinedKills,
        avgTotalDamage: avgCombinedDamage,
        bestGame,
      },
      synergyComment: generateSynergyComment(synergyScore, gamesTogether, winRateTogether),
    };

    setCache(cacheKey, result, TTL_1HOUR);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "플레이어를 찾을 수 없습니다" }, { status: 404 });
    }
    if (msg === "RATE_LIMIT") {
      return NextResponse.json({ error: "API 요청 한도 초과. 잠시 후 재시도하세요" }, { status: 429 });
    }
    console.error("[Synergy API]", msg);
    return NextResponse.json({ error: "시너지 분석 중 오류가 발생했습니다" }, { status: 500 });
  }
}
