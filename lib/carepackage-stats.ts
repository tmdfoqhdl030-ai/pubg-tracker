// ── 케어패키지 통계 서비스 ────────────────────────────────────────────
// LogItemPickupFromCarepackage 이벤트로 케어패키지 관련 통계를 집계한다.

import { getMatch } from "./pubg-api";
import { getTelemetryUrl, parseTelemetryForPlayer, itemIdToDisplayName } from "./telemetry-parser";
import { getCache, setCache } from "./cache";

export interface CarepackageStats {
  totalLootCount: number;      // 케어패키지에서 아이템 획득 횟수
  gamesWithLoot: number;       // 케어패키지 1회 이상 연 게임 수
  itemsLooted: Array<{ displayName: string; count: number }>;
  mostLootedItem: string;
  title: string;               // 칭호
  funFact: string;
  gamesAnalyzed: number;
  percentile: number;          // 전체 유저 대비 (추정)
}

// ─── 칭호 기준 ────────────────────────────────────────────────────────

function getTitle(lootGames: number, analyzed: number): string {
  // 분석 게임 수 대비 비율로 계산
  const ratio = analyzed > 0 ? lootGames / analyzed : 0;
  if (ratio === 0) return "케어패키지가 뭔가요?";
  if (ratio <= 0.1) return "눈치형 하이에나";
  if (ratio <= 0.3) return "케어패키지 사냥꾼";
  if (ratio <= 0.6) return "보급 전문가";
  return "크래프톤의 VIP";
}

// 케어패키지 오픈 비율로 대략적인 백분위 추정
function estimatePercentile(ratio: number): number {
  if (ratio >= 0.7) return 3;
  if (ratio >= 0.5) return 10;
  if (ratio >= 0.3) return 25;
  if (ratio >= 0.1) return 45;
  return 70;
}

export async function analyzeCarepackageStats(
  accountId: string,
  platform: string,
  recentMatchIds: string[]
): Promise<CarepackageStats> {
  const cacheKey = `carepackage:${platform}:${accountId}`;
  const cached = getCache<CarepackageStats>(cacheKey);
  if (cached) return cached;

  const itemCountMap: Record<string, number> = {};
  const gamesWithCarepackageSet = new Set<string>();
  let gamesAnalyzed = 0;

  const matchLimit = Math.min(recentMatchIds.length, 8);

  const matchResults = await Promise.allSettled(
    recentMatchIds.slice(0, matchLimit).map(async (id) => {
      const md = await getMatch(id, platform);
      const url = getTelemetryUrl(md as Record<string, unknown>);
      if (!url) return { id, events: null };
      const tel = await parseTelemetryForPlayer(url, accountId, id);
      return { id, events: tel };
    })
  );

  for (const r of matchResults) {
    if (r.status !== "fulfilled" || !r.value?.events) continue;
    gamesAnalyzed++;
    const { id, events } = r.value;
    for (const ev of events.carepackageEvents) {
      const name = itemIdToDisplayName(ev.item.itemId);
      itemCountMap[name] = (itemCountMap[name] ?? 0) + 1;
      gamesWithCarepackageSet.add(id);
    }
  }

  const itemsLooted = Object.entries(itemCountMap)
    .sort(([, a], [, b]) => b - a)
    .map(([displayName, count]) => ({ displayName, count }));

  const totalLootCount = itemsLooted.reduce((s, i) => s + i.count, 0);
  const gamesWithLoot = gamesWithCarepackageSet.size;
  const mostLootedItem = itemsLooted[0]?.displayName ?? "없음";
  const ratio = gamesAnalyzed > 0 ? gamesWithLoot / gamesAnalyzed : 0;

  let funFact: string;
  if (totalLootCount === 0) {
    funFact = `최근 ${gamesAnalyzed}게임에서 케어패키지를 열지 않았습니다. 첫 번째 AWM을 노려보세요!`;
  } else if (itemsLooted[0]) {
    funFact = `최근 ${gamesAnalyzed}게임 중 ${gamesWithLoot}게임에서 케어패키지를 열었습니다. 가장 많이 가져간 아이템은 ${mostLootedItem}(${itemsLooted[0].count}개)입니다.`;
  } else {
    funFact = `총 ${totalLootCount}개의 케어패키지 아이템을 획득했습니다.`;
  }

  const result: CarepackageStats = {
    totalLootCount,
    gamesWithLoot,
    itemsLooted: itemsLooted.slice(0, 6),
    mostLootedItem,
    title: getTitle(gamesWithLoot, gamesAnalyzed),
    funFact,
    gamesAnalyzed,
    percentile: estimatePercentile(ratio),
  };

  setCache(cacheKey, result, 7200 * 1000); // 2h
  return result;
}
