// ── 탄약 효율 (BPK) 서비스 ───────────────────────────────────────────
// LogWeaponFireCount(발사 횟수) + weapon_mastery(킬 수)로 BPK를 계산한다.
// 발사 횟수가 없으면 weapon_mastery만으로 추정한다.

import { getMatch, getWeaponMastery } from "./pubg-api";
import { getTelemetryUrl, parseTelemetryForPlayer, weaponIdToName } from "./telemetry-parser";
import { getCache, setCache } from "./cache";

export interface WeaponBPK {
  weaponName: string;
  totalKills: number;
  totalBulletsFired: number;
  bulletsPerKill: number;
  efficiency: "S" | "A" | "B" | "C" | "D";
  percentile: number; // 낮을수록 좋음 (하위 %)
  funLabel: string;
}

export interface BulletEfficiency {
  weapons: WeaponBPK[];
  overallBpk: number;
  bestWeapon: string;
  worstWeapon: string;
  totalBulletsFired: number;
  totalKills: number;
  efficiencyScore: number; // 0~100 (높을수록 정확)
  gamesAnalyzed: number;
}

// ─── 효율 등급 기준 ───────────────────────────────────────────────────

function getBpkGrade(bpk: number): WeaponBPK["efficiency"] {
  if (bpk <= 7) return "S";
  if (bpk <= 15) return "A";
  if (bpk <= 25) return "B";
  if (bpk <= 40) return "C";
  return "D";
}

// BPK percentile: 낮을수록 좋음 → percentile = 상위 몇% 효율인가
function bpkPercentile(bpk: number): number {
  // 전체 유저 평균 BPK 약 20~25
  if (bpk <= 5) return 2;
  if (bpk <= 8) return 8;
  if (bpk <= 12) return 18;
  if (bpk <= 18) return 32;
  if (bpk <= 25) return 50;
  if (bpk <= 35) return 68;
  if (bpk <= 50) return 80;
  return 90;
}

function bpkLabel(name: string, bpk: number, pct: number): string {
  const grade = getBpkGrade(bpk);
  if (grade === "S") return `${name}으로 킬당 평균 ${bpk.toFixed(1)}발 — 상위 ${pct}% 정확도`;
  if (grade === "A") return `${name}: ${bpk.toFixed(1)}발/킬 — 우수한 효율`;
  if (grade === "B") return `${name}: ${bpk.toFixed(1)}발/킬 — 평균 수준`;
  if (grade === "C") return `${name}: ${bpk.toFixed(1)}발/킬 — 탄약 절약이 필요합니다`;
  return `${name}: ${bpk.toFixed(1)}발/킬 — 점사 연습 권장`;
}

export async function analyzeBulletEfficiency(
  accountId: string,
  platform: string,
  recentMatchIds: string[]
): Promise<BulletEfficiency> {
  const cacheKey = `bullet-eff:${platform}:${accountId}`;
  const cached = getCache<BulletEfficiency>(cacheKey);
  if (cached) return cached;

  // 텔레메트리에서 발사 횟수 수집
  const fireMap: Record<string, number> = {}; // weaponId → total bullets fired
  let gamesAnalyzed = 0;

  const matchLimit = Math.min(recentMatchIds.length, 5);
  const matchResults = await Promise.allSettled(
    recentMatchIds.slice(0, matchLimit).map(async (id) => {
      const md = await getMatch(id, platform);
      const url = getTelemetryUrl(md as Record<string, unknown>);
      if (!url) return null;
      return parseTelemetryForPlayer(url, accountId, id);
    })
  );

  for (const r of matchResults) {
    if (r.status !== "fulfilled" || !r.value) continue;
    gamesAnalyzed++;
    for (const ev of r.value.fireCountEvents) {
      fireMap[ev.weaponId] = (fireMap[ev.weaponId] ?? 0) + ev.fireCount;
    }
  }

  // weapon_mastery에서 킬 수 수집
  const masteryData = await getWeaponMastery(accountId, platform);
  const weaponStats = masteryData?.data?.attributes?.weaponsummary ?? {};

  const weaponList: WeaponBPK[] = [];

  for (const [id, raw] of Object.entries(weaponStats)) {
    const s = raw as Record<string, number>;
    const kills = s.kills ?? 0;
    if (kills < 5) continue; // 최소 5킬

    const name = weaponIdToName(id);
    const bulletsFired = fireMap[id] ?? 0;

    let bpk: number;
    if (bulletsFired > 0 && kills > 0) {
      bpk = bulletsFired / kills;
    } else if (kills > 0) {
      // 텔레메트리 없을 때 무기 종류별 추정값
      const isSniper = ["AWM", "M24", "Kar98k", "Mosin", "Win94", "SLR", "SKS", "VSS", "MK14"].includes(name);
      const isShotgun = ["S686", "S1897", "S12K", "DBS"].includes(name);
      bpk = isSniper ? 4 : isShotgun ? 8 : 18; // 추정
    } else {
      continue;
    }

    const roundBpk = Math.round(bpk * 10) / 10;
    const pct = bpkPercentile(roundBpk);
    weaponList.push({
      weaponName: name,
      totalKills: kills,
      totalBulletsFired: bulletsFired,
      bulletsPerKill: roundBpk,
      efficiency: getBpkGrade(roundBpk),
      percentile: pct,
      funLabel: bpkLabel(name, roundBpk, pct),
    });
  }

  // 킬 수 기준 정렬
  weaponList.sort((a, b) => b.totalKills - a.totalKills);
  const topWeapons = weaponList.slice(0, 6);

  const totalKills = topWeapons.reduce((s, w) => s + w.totalKills, 0);
  const totalBullets = topWeapons.reduce((s, w) => s + w.totalBulletsFired, 0);
  const overallBpk = totalKills > 0 && totalBullets > 0
    ? Math.round((totalBullets / totalKills) * 10) / 10
    : 0;

  const sorted = [...topWeapons].sort((a, b) => a.bulletsPerKill - b.bulletsPerKill);
  const bestWeapon = sorted[0]?.weaponName ?? "정보 없음";
  const worstWeapon = sorted[sorted.length - 1]?.weaponName ?? "정보 없음";

  const efficiencyScore = topWeapons.length > 0
    ? Math.round(100 - topWeapons.reduce((s, w) => s + w.percentile, 0) / topWeapons.length)
    : 50;

  const result: BulletEfficiency = {
    weapons: topWeapons,
    overallBpk,
    bestWeapon,
    worstWeapon,
    totalBulletsFired: totalBullets,
    totalKills,
    efficiencyScore: Math.max(0, Math.min(100, efficiencyScore)),
    gamesAnalyzed,
  };

  setCache(cacheKey, result, 3600 * 1000);
  return result;
}
