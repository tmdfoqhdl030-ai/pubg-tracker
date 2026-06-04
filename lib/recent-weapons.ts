// ── 최근 매치 텔레메트리 기반 무기 사용 분석 ──────────────────────────
// LogWeaponFireCount 이벤트로 "지금 실제로 쓰는 무기"를 탐지한다.
// weapon_mastery(평생 누적)와 달리 최근 5경기 기준이므로 정확하다.

import { getMatch } from "./pubg-api";
import { getTelemetryUrl, parseTelemetryForPlayer, weaponIdToName } from "./telemetry-parser";
import { getCache, setCache } from "./cache";

export interface MatchWeapon {
  matchId: string;
  weapon: string | null; // 해당 매치에서 가장 많이 쏜 무기
}

export interface TopWeapon {
  name: string;
  fireCount: number; // 최근 5경기 총 발사 횟수
  pct: number;       // 전체 발사 대비 %
}

export interface RecentWeaponsResult {
  matchWeapons: MatchWeapon[];
  topWeapons: TopWeapon[];
  gamesAnalyzed: number;
}

export async function analyzeRecentWeapons(
  accountId: string,
  platform: string,
  recentMatchIds: string[]
): Promise<RecentWeaponsResult> {
  const cacheKey = `recent-weapons:${platform}:${accountId}`;
  const cached = getCache<RecentWeaponsResult>(cacheKey);
  if (cached) return cached;

  const matchLimit = Math.min(recentMatchIds.length, 5);
  let gamesAnalyzed = 0;

  // 매치별 & 전체 발사 횟수 집계
  const totalFireMap: Record<string, number> = {}; // weaponId → 총 발사 수
  const matchWeapons: MatchWeapon[] = [];

  const matchResults = await Promise.allSettled(
    recentMatchIds.slice(0, matchLimit).map(async (id) => {
      const md = await getMatch(id, platform);
      const url = getTelemetryUrl(md as Record<string, unknown>);
      if (!url) return null;
      const telemetry = await parseTelemetryForPlayer(url, accountId, id);

      // 이 매치의 무기별 발사 횟수
      const matchFireMap: Record<string, number> = {};
      for (const ev of telemetry.fireCountEvents) {
        if (!ev.weaponId.startsWith("Item_Weapon_") && !ev.weaponId.startsWith("Weap")) continue;
        matchFireMap[ev.weaponId] = Math.max(matchFireMap[ev.weaponId] ?? 0, ev.fireCount);
      }

      // 해당 매치 1위 무기
      const topEntry = Object.entries(matchFireMap).sort(([, a], [, b]) => b - a)[0];
      const primaryWeapon = topEntry ? weaponIdToName(topEntry[0]) : null;

      return { matchId: id, weapon: primaryWeapon, matchFireMap };
    })
  );

  for (const r of matchResults) {
    if (r.status !== "fulfilled" || !r.value) continue;
    gamesAnalyzed++;
    matchWeapons.push({ matchId: r.value.matchId, weapon: r.value.weapon });

    for (const [wid, count] of Object.entries(r.value.matchFireMap)) {
      totalFireMap[wid] = (totalFireMap[wid] ?? 0) + count;
    }
  }

  // 전체 발사 횟수 합계
  const totalFire = Object.values(totalFireMap).reduce((s, v) => s + v, 0);

  // Top 5 무기 (발사 횟수 기준)
  const topWeapons: TopWeapon[] = Object.entries(totalFireMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([wid, count]) => ({
      name: weaponIdToName(wid),
      fireCount: count,
      pct: Math.round((count / Math.max(totalFire, 1)) * 100),
    }));

  const result: RecentWeaponsResult = { matchWeapons, topWeapons, gamesAnalyzed };
  setCache(cacheKey, result, 3600 * 1000); // 1시간 캐시
  return result;
}
