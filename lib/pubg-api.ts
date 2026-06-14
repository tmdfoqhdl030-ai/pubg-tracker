import {
  getCache, setCache, setCacheWithStale,
  getCacheAsync, getStaleOrFreshAsync, setCacheWithStaleAsync,
} from "./cache";
import { pubgRatelimit } from "./redis";

const BASE_URL = "https://api.pubg.com/shards";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
    Accept: "application/vnd.api+json",
  };
}

function getShard(platform: string): string {
  if (platform === "kakao") return "kakao";
  return "steam";
}

// ── 중복 요청 방지 (inflight dedup) ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlightFetches = new Map<string, Promise<any>>();

// ── 전역 요청 throttle (분당 한도 보호) ──────────────────────────────
// PUBG 한도는 분당 10회. 안전하게 9회로 두고 슬라이딩 윈도우로 제어.
// /matches/{id} 엔드포인트는 rate limit 면제 대상이라 throttle 제외.
const RATE_LIMIT_PER_MIN = 9;
const WINDOW_MS = 60 * 1000;
let callTimestamps: number[] = [];

// 인메모리 슬라이딩 윈도우 (Redis 미연결 시 폴백)
async function acquireRateSlotMemory(): Promise<void> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const now = Date.now();
    callTimestamps = callTimestamps.filter((t) => now - t < WINDOW_MS);
    if (callTimestamps.length < RATE_LIMIT_PER_MIN) {
      callTimestamps.push(now);
      return;
    }
    const waitMs = WINDOW_MS - (now - callTimestamps[0]) + 50;
    await new Promise((r) => setTimeout(r, Math.min(waitMs, 5000)));
  }
}

// 분산 rate limiter (Redis 공유 카운터). 토큰 없으면 대기 후 재시도.
async function acquireRateSlot(): Promise<void> {
  if (!pubgRatelimit) return acquireRateSlotMemory();
  const MAX_WAIT_MS = 20_000; // 최대 20초 대기 후 그냥 진행 (무한 대기 방지)
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const { success, reset } = await pubgRatelimit.limit("global");
      if (success) return;
      const waitMs = Math.min(Math.max(reset - Date.now(), 200), 3000);
      if (Date.now() - start > MAX_WAIT_MS) return; // 너무 오래 걸리면 통과
      await new Promise((r) => setTimeout(r, waitMs));
    } catch {
      return acquireRateSlotMemory(); // Redis 오류 시 폴백
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function pubgFetch(url: string, opts?: { rateLimited?: boolean }): Promise<any> {
  const rateLimited = opts?.rateLimited ?? true; // 기본 true, 매치만 false
  let promise = inFlightFetches.get(url);
  if (!promise) {
    promise = (async () => {
      if (rateLimited) await acquireRateSlot();
      const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
      if (res.status === 429) throw new Error("RATE_LIMIT");
      if (res.status === 404) throw new Error("NOT_FOUND");
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`PUBG_API_ERROR:${res.status}:${body.slice(0, 200)}`);
      }
      return res.json();
    })();
    inFlightFetches.set(url, promise);
    promise.finally(() => inFlightFetches.delete(url));
  }
  return promise;
}

// ─── 플레이어 조회 ─────────────────────────────────────────────
// ⚡ 캐시 3분 — 같은 닉네임 여러 API 라우트가 중복 호출하는 낭비 방지
export async function getPlayer(nickname: string, platform: string) {
  const key = `player:${platform}:${nickname.toLowerCase()}`;
  const cached = await getCacheAsync<{ accountId: string; nickname: string; recentMatchIds: string[] }>(key);
  if (cached) return cached;

  const shard = getShard(platform);
  const url = `${BASE_URL}/${shard}/players?filter[playerNames]=${encodeURIComponent(nickname)}`;
  try {
    const data = await pubgFetch(url);
    const player = (data as { data?: { id: string; attributes: { name: string }; relationships?: { matches?: { data: { id: string }[] } } }[] }).data?.[0];
    if (!player) throw new Error("NOT_FOUND");
    const result = {
      accountId: player.id,
      nickname: player.attributes.name,
      recentMatchIds: (player.relationships?.matches?.data ?? []).map((m: { id: string }) => m.id).slice(0, 20),
    };
    await setCacheWithStaleAsync(key, result, 15 * 60 * 1000); // 15분 캐시, stale 4h
    return result;
  } catch (err) {
    // RATE_LIMIT 시 stale 캐시 우선 반환 (유저에게 에러 안 보임)
    if (err instanceof Error && err.message === "RATE_LIMIT") {
      const stale = await getStaleOrFreshAsync<{ accountId: string; nickname: string; recentMatchIds: string[] }>(key);
      if (stale) return stale;
    }
    throw err;
  }
}

// ─── 현재 시즌 조회 ────────────────────────────────────────────
// ⚡ 캐시 6시간 — 시즌은 하루에 바뀌지 않음
export async function getCurrentSeason(platform: string) {
  const key = `season:${platform}`;
  const cached = await getCacheAsync<string>(key);
  if (cached) return cached;

  const shard = getShard(platform);
  const url = `${BASE_URL}/${shard}/seasons`;
  const data = await pubgFetch(url);
  const current = data.data?.find((s: { attributes: { isCurrentSeason: boolean; isOffseason: boolean } }) =>
    s.attributes.isCurrentSeason && !s.attributes.isOffseason
  );
  const seasonId = current
    ? (current.id as string)
    : (data.data?.[data.data.length - 1]?.id as string);
  if (seasonId) await setCacheWithStaleAsync(key, seasonId, 24 * 60 * 60 * 1000, 72 * 60 * 60 * 1000); // 24h 캐시, stale 72h
  return seasonId;
}

// ─── 시즌 통계 조회 (RPM 소모) ──────────────────────────────────
export interface ModeStats {
  kda: number; winRate: number; avgDamage: number;
  headshotRate: number; topTenRate: number;
  gamesPlayed: number; wins: number; top10s: number; losses: number;
  avgRank: number; kills: number;
}

function computeModeStats(rawModes: Record<string, unknown>[]): ModeStats | null {
  let g = 0, wins = 0, kills = 0, damage = 0, headshots = 0, top10 = 0, rankSum = 0, rankCount = 0;
  for (const m of rawModes) {
    const mm = m as Record<string, number>;
    const gp = mm.roundsPlayed ?? 0;
    g += gp;
    wins += mm.wins ?? 0;
    kills += mm.kills ?? 0;
    damage += mm.damageDealt ?? 0;
    headshots += mm.headshotKills ?? 0;
    top10 += mm.top10s ?? 0;
    if (gp > 0) { rankSum += (mm.roundMostKills ?? 0); rankCount += gp; }
  }
  if (g === 0) return null;
  const deaths = Math.max(g - wins, 1);
  return {
    kda: kills / deaths,
    winRate: (wins / g) * 100,
    avgDamage: damage / g,
    headshotRate: kills > 0 ? (headshots / kills) * 100 : 0,
    topTenRate: (top10 / g) * 100,
    gamesPlayed: g, wins, top10s: top10, losses: g - wins,
    avgRank: rankCount > 0 ? rankSum / rankCount : 0,
    kills,
  };
}

// ─── 시즌 스탯 조회 ────────────────────────────────────────────
// ⚡ 캐시 5분
export async function getSeasonStats(accountId: string, platform: string, seasonId: string) {
  const key = `season-stats:${platform}:${accountId}:${seasonId}`;
  const cached = await getCacheAsync<{ kda: number; winRate: number; avgDamage: number; headshotRate: number; topTenRate: number; gamesPlayed: number; modeStats: unknown }>(key);
  if (cached !== null) return cached;

  const shard = getShard(platform);
  const url = `${BASE_URL}/${shard}/players/${accountId}/seasons/${seasonId}`;
  const data = await pubgFetch(url);
  const stats = data.data?.attributes?.gameModeStats;
  if (!stats) return null;

  const allModes = ["squad","squad-fpp","duo","duo-fpp","solo","solo-fpp"].map(k => stats[k] ?? {});

  let totalGames = 0, totalWins = 0, totalKills = 0, totalDamage = 0, totalHeadshots = 0, totalTop10 = 0;
  for (const m of allModes) {
    const mm = m as Record<string, number>;
    const gp = mm.roundsPlayed ?? 0;
    totalGames += gp;
    totalWins += mm.wins ?? 0;
    totalKills += mm.kills ?? 0;
    totalDamage += mm.damageDealt ?? 0;
    totalHeadshots += mm.headshotKills ?? 0;
    totalTop10 += mm.top10s ?? 0;
  }

  const deaths = Math.max(totalGames - totalWins, 1);
  const kda = totalKills / deaths;
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  const avgDamage = totalGames > 0 ? totalDamage / totalGames : 0;
  const headshotRate = totalKills > 0 ? (totalHeadshots / totalKills) * 100 : 0;
  const topTenRate = totalGames > 0 ? (totalTop10 / totalGames) * 100 : 0;

  const modeStats = {
    squad: computeModeStats(["squad","squad-fpp"].map(k => stats[k] ?? {})),
    duo:   computeModeStats(["duo","duo-fpp"].map(k => stats[k] ?? {})),
    solo:  computeModeStats(["solo","solo-fpp"].map(k => stats[k] ?? {})),
  };

  const result = {
    kda, winRate, avgDamage, headshotRate, topTenRate,
    gamesPlayed: totalGames,
    modeStats,
  };
  await setCacheWithStaleAsync(key, result, 30 * 60 * 1000); // 30분 캐시, stale 4h
  return result;
}
// ─── 랭크 통계 조회 ────────────────────────────────────────────
// ⚡ 캐시 5분
export interface RankedTierInfo {
  tier: string; subTier: string; rp: number;
  wins: number; losses: number; games: number;
  kills: number; kda: number; winRate: number; avgDamage: number;
}

type RankedResult = { squad: RankedTierInfo | null; duo: RankedTierInfo | null; solo: RankedTierInfo | null } | null;

export async function getRankedStats(accountId: string, platform: string, seasonId: string): Promise<RankedResult> {
  const key = `ranked-stats:${platform}:${accountId}:${seasonId}`;
  const cached = await getCacheAsync<RankedResult>(key);
  if (cached !== null) return cached;

  const shard = getShard(platform);
  const url = `${BASE_URL}/${shard}/players/${accountId}/seasons/${seasonId}/ranked`;
  try {
    const data = await pubgFetch(url);
    const stats = data.data?.attributes?.rankedGameModeStats;
    if (!stats) return null;

    function extractMode(keys: string[]): RankedTierInfo | null {
      let g = 0, wins = 0, kills = 0, damage = 0;
      let tier = "", subTier = "", rp = 0;
      for (const key of keys) {
        const m = stats[key];
        if (!m) continue;
        g += m.roundsPlayed ?? 0;
        wins += m.wins ?? 0;
        kills += m.kills ?? 0;
        damage += m.damageDealt ?? 0;
        if (!tier && m.currentTier?.tier) {
          tier = m.currentTier.tier;
          subTier = m.currentTier.subTier ?? "";
          rp = m.currentRankPoint ?? 0;
        }
      }
      if (g === 0 || !tier) return null;
      // losses = m.losses가 0이거나 누락되면 KDA가 kills/1이 되는 버그 방지
      // → 항상 g - wins (= 비우승 게임 수) 를 death 기준으로 사용
      const losses = g - wins;
      const d = Math.max(losses, 1);
      return {
        tier, subTier, rp, wins,
        losses, games: g,
        kills, kda: Math.round((kills / d) * 100) / 100,
        winRate: (wins / g) * 100,
        avgDamage: g > 0 ? damage / g : 0,
      };
    }

    const result: RankedResult = {
      squad: extractMode(["squad","squad-fpp"]),
      duo:   extractMode(["duo","duo-fpp"]),
      solo:  extractMode(["solo","solo-fpp"]),
    };
    await setCacheWithStaleAsync(key, result, 30 * 60 * 1000); // 30분 캐시, stale 4h
    return result;
  } catch {
    setCache(key, null, 3 * 60 * 1000); // 실패도 3분 캐시 (반복 호출 방지)
    return null;
  }
}

// ─── 매치 상세 (RPM 무제한, 캐시 24h) ──────────────────────────
// ⚡ 매치 데이터는 불변 → 24시간 캐시
export async function getMatch(matchId: string, platform: string) {
  const key = `match:${matchId}`;
  const cached = getCache<Record<string, unknown>>(key);
  if (cached) return cached;

  const shard = getShard(platform);
  const url = `${BASE_URL}/${shard}/matches/${matchId}`;
  const data = await pubgFetch(url, { rateLimited: false }); // 매치는 rate limit 면제
  setCacheWithStale(key, data, 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000); // 24h 캐시, stale 7일 (매치는 불변)
  return data;
}

// ─── 무기 마스터리 ──────────────────────────────────────────────
// ⚡ 캐시 1시간
export async function getWeaponMastery(accountId: string, platform: string) {
  const key = `weapon-mastery:${platform}:${accountId}`;
  const cached = await getCacheAsync<Record<string, unknown>>(key);
  if (cached) return cached;

  const shard = getShard(platform);
  const url = `${BASE_URL}/${shard}/players/${accountId}/weapon_mastery`;
  const data = await pubgFetch(url);
  await setCacheWithStaleAsync(key, data, 2 * 60 * 60 * 1000); // 2시간 캐시, stale 4h
  return data;
}

// ─── 매치에서 특정 플레이어 통계 파싱 ──────────────────────────
export function parsePlayerMatchStats(matchData: Record<string, unknown>, accountId: string) {
  return parseMatchWithTeammates(matchData, accountId);
}

// ─── 매치에서 플레이어 + 팀원 통계 파싱 ────────────────────────
export function parseMatchWithTeammates(
  matchData: Record<string, unknown>,
  accountId: string
) {
  type Participant = {
    type: string;
    id: string;
    attributes: Record<string, unknown>;
    relationships?: Record<string, { data: { id: string; type: string }[] }>;
  };

  const included = matchData.included as Participant[] | undefined;
  if (!included) return null;

  const matchAttr =
    (matchData.data as { attributes?: Record<string, unknown> })?.attributes ?? {};

  const myParticipant = included.find(
    (item) =>
      item.type === "participant" &&
      (item.attributes?.stats as Record<string, unknown>)?.playerId === accountId
  );
  if (!myParticipant) return null;

  // 내 로스터(팀) 찾기
  const myRoster = included.find(
    (item) =>
      item.type === "roster" &&
      item.relationships?.participants?.data?.some((p) => p.id === myParticipant.id)
  );

  // 팀원 추출
  const teammates: { name: string; kills: number; damage: number }[] = [];
  if (myRoster?.relationships?.participants?.data) {
    for (const { id } of myRoster.relationships.participants.data) {
      if (id === myParticipant.id) continue;
      const p = included.find((item) => item.type === "participant" && item.id === id);
      if (!p) continue;
      const s = p.attributes?.stats as Record<string, unknown> ?? {};
      const pName = s.name as string | undefined;
      if (pName) {
        teammates.push({
          name: pName,
          kills: (s.kills as number) ?? 0,
          damage: Math.round((s.damageDealt as number) ?? 0),
        });
      }
    }
  }

  const stats = myParticipant.attributes?.stats as Record<string, unknown> ?? {};
  const walk = Math.round((stats.walkDistance as number) ?? 0);
  const ride = Math.round((stats.rideDistance as number) ?? 0);
  const swim = Math.round((stats.swimDistance as number) ?? 0);
  return {
    kills: (stats.kills as number) ?? 0,
    assists: (stats.assists as number) ?? 0,
    headshotKills: (stats.headshotKills as number) ?? 0,
    damage: Math.round((stats.damageDealt as number) ?? 0),
    survived: Math.round((stats.timeSurvived as number) ?? 0),
    placement: (stats.winPlace as number) ?? 99,
    isWin: (stats.winPlace as number) === 1,
    map: (matchAttr.mapName as string) ?? "Unknown",
    mode: (matchAttr.gameMode as string) ?? "squad",
    playedAt: (matchAttr.createdAt as string) ?? "",
    teammates,
    totalPlayers: (matchAttr.totalParticipants as number) ?? 100,
    dbno: (stats.DBNOs as number) ?? 0,
    distanceKm: Math.round((walk + ride + swim) / 100) / 10,
    walkDistance: walk,
    rideDistance: ride,
  };
}

// 맵 이름 한국어 변환
export function localizeMapName(name: string): string {
  const maps: Record<string, string> = {
    Baltic_Main: "Erangel",
    Erangel_Main: "Erangel",
    Desert_Main: "Miramar",
    Savage_Main: "Sanhok",
    Summerland_Main: "Karakin",
    DihorOtok_Main: "Vikendi",
    Tiger_Main: "Taego",
    Kiki_Main: "Deston",
    Neon_Main: "Rondo",
  };
  return maps[name] ?? name;
}

// 게임 모드 한국어 변환
export function localizeMode(mode: string): string {
  const modes: Record<string, string> = {
    squad: "스쿼드",
    "squad-fpp": "스쿼드FPP",
    duo: "듀오",
    "duo-fpp": "듀오FPP",
    solo: "솔로",
    "solo-fpp": "솔로FPP",
  };
  return modes[mode] ?? mode;
}
