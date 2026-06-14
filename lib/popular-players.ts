// ─── 인기 닉네임 사전 캐싱 대상 목록 ────────────────────────────────
// 사전 캐싱(cache warming)에 사용할 "자주 검색되는" 닉네임 목록입니다.
// ① 수동 큐레이션: 스트리머·지인 등 직접 추가 (가장 정확)
// ② 자동: PUBG 경쟁전 리더보드 상위권 (유지보수 0, 항상 최신)

import { getCurrentSeason } from "./pubg-api";

// ── ① 수동 큐레이션 목록 (여기에 인기 닉네임을 직접 추가하세요) ──────
//    플랫폼별로 분리. 닉네임은 PUBG 인게임 정확한 철자/대소문자로 입력.
export const CURATED_POPULAR: Record<"steam" | "kakao", string[]> = {
  steam: [
    // 예) "스트리머닉", "인기유저닉",
  ],
  kakao: [
    // 예) "카카오인기닉",
  ],
};

// 리더보드 shard (leaderboards 엔드포인트는 지역 shard 사용)
const LB_SHARD: Record<string, string> = {
  steam: "pc-as",
  kakao: "pc-kakao",
};

// ── ② 리더보드 상위 N명 닉네임 조회 ────────────────────────────────
async function fetchLeaderboardNames(
  platform: "steam" | "kakao",
  mode: string,
  topN: number
): Promise<string[]> {
  try {
    const apiKey = process.env.PUBG_API_KEY;
    if (!apiKey) return [];
    const seasonId = await getCurrentSeason(platform);
    if (!seasonId) return [];

    const shard = LB_SHARD[platform];
    const res = await fetch(
      `https://api.pubg.com/shards/${shard}/leaderboards/${seasonId}/${mode}`,
      { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json" }, cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.included ?? [])
      .filter((p: { attributes?: { rank?: number } }) => (p.attributes?.rank ?? 999) <= topN)
      .sort((a: { attributes: { rank: number } }, b: { attributes: { rank: number } }) => a.attributes.rank - b.attributes.rank)
      .map((p: { attributes: { name: string } }) => p.attributes.name);
  } catch {
    return [];
  }
}

// ── 사전 캐싱 대상 닉네임 최종 목록 (중복 제거) ─────────────────────
//    수동 목록 + 리더보드 상위 leaderboardTop명
export async function getWarmTargets(
  platform: "steam" | "kakao",
  leaderboardTop = 10
): Promise<string[]> {
  const curated = CURATED_POPULAR[platform] ?? [];
  const lbSquad = await fetchLeaderboardNames(platform, "squad", leaderboardTop);
  const merged = [...curated, ...lbSquad];
  // 대소문자 무시 중복 제거 (원본 표기 유지)
  const seen = new Set<string>();
  const result: string[] = [];
  for (const n of merged) {
    const key = n.toLowerCase();
    if (!seen.has(key)) { seen.add(key); result.push(n); }
  }
  return result;
}
