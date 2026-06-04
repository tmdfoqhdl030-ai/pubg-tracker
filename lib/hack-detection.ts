// ── 핵 탐지 서비스 ───────────────────────────────────────────────────
// weapon_mastery 데이터로 헤드샷율·킬효율을 수치화해 의심 점수를 계산한다.
// 텔레메트리 없이 동작 (빠른 응답).

import { getWeaponMastery } from "./pubg-api";
import { getCache, setCache } from "./cache";
import { weaponIdToName } from "./telemetry-parser";

export interface HackScore {
  suspicionScore: number; // 0~100
  suspicionLevel: "정상" | "의심" | "강한의심" | "핵의심";
  evidence: {
    topWeapon: string;
    overallHeadshotRate: number;
    headshotPercentile: number;
    avgKillsPerGame: number;
    killsPerGamePercentile: number;
    suspiciousFactors: string[];
  };
  label: string;
  disclaimer: string;
}

// ─── 백분위 추정 (PUBG 전체 유저 통계 기반) ──────────────────────────

function headshotPercentile(rate: number): number {
  // 전체 유저 기준 헤드샷율 분포: 평균 ~15%, 상위 10%=25%, 상위 1%=40%
  if (rate >= 65) return 0.05;
  if (rate >= 55) return 0.2;
  if (rate >= 45) return 0.5;
  if (rate >= 40) return 1;
  if (rate >= 35) return 2;
  if (rate >= 30) return 5;
  if (rate >= 25) return 10;
  if (rate >= 20) return 20;
  if (rate >= 15) return 35;
  return Math.max(55, 100 - rate * 2.5);
}

function killsPerGamePercentile(kpg: number): number {
  // 게임당 평균 킬 분포: 평균 ~0.8, 상위 10%=2.0, 상위 1%=4.5
  if (kpg >= 8) return 0.1;
  if (kpg >= 6) return 0.5;
  if (kpg >= 5) return 1;
  if (kpg >= 4) return 3;
  if (kpg >= 3) return 5;
  if (kpg >= 2.5) return 10;
  if (kpg >= 2) return 18;
  if (kpg >= 1.5) return 30;
  if (kpg >= 1) return 45;
  return 65;
}

function getSuspicionLevel(score: number): HackScore["suspicionLevel"] {
  if (score >= 80) return "핵의심";
  if (score >= 60) return "강한의심";
  if (score >= 35) return "의심";
  return "정상";
}

export async function calculateHackScore(
  accountId: string,
  platform: string
): Promise<HackScore> {
  const cacheKey = `hack-score:${platform}:${accountId}`;
  const cached = getCache<HackScore>(cacheKey);
  if (cached) return cached;

  const masteryData = await getWeaponMastery(accountId, platform);
  const weaponStats = masteryData?.data?.attributes?.weaponsummary ?? {};

  const weapons = Object.entries(weaponStats)
    .map(([id, raw]: [string, unknown]) => {
      const s = raw as Record<string, number>;
      const kills = s.kills ?? 0;
      const hsKills = s.headShotKills ?? 0;
      const rounds = s.roundsPlayed ?? 0;
      return { id, name: weaponIdToName(id), kills, hsKills, rounds };
    })
    .filter((w) => w.kills >= 10)
    .sort((a, b) => b.kills - a.kills);

  if (weapons.length === 0) {
    const empty: HackScore = {
      suspicionScore: 0,
      suspicionLevel: "정상",
      evidence: {
        topWeapon: "데이터 없음",
        overallHeadshotRate: 0,
        headshotPercentile: 50,
        avgKillsPerGame: 0,
        killsPerGamePercentile: 50,
        suspiciousFactors: [],
      },
      label: "무기 마스터리 데이터가 부족합니다 (킬 10회 이상 필요).",
      disclaimer: "이 수치는 참고용이며 실제 핵 사용 여부를 보증하지 않습니다.",
    };
    setCache(cacheKey, empty, 3600 * 1000);
    return empty;
  }

  const totalKills = weapons.reduce((s, w) => s + w.kills, 0);
  const totalHs = weapons.reduce((s, w) => s + w.hsKills, 0);
  const maxRounds = Math.max(...weapons.map((w) => w.rounds), 1);

  const overallHsRate = totalKills > 0 ? (totalHs / totalKills) * 100 : 0;
  const avgKpg = maxRounds > 0 ? totalKills / maxRounds : 0;

  const hsPct = headshotPercentile(overallHsRate);
  const kpgPct = killsPerGamePercentile(avgKpg);

  // 의심 점수 계산
  const hsScore = hsPct <= 0.2 ? 45 : hsPct <= 0.5 ? 35 : hsPct <= 1 ? 28 : hsPct <= 3 ? 18 : hsPct <= 5 ? 10 : hsPct <= 10 ? 5 : 0;
  const kpgScore = kpgPct <= 0.5 ? 40 : kpgPct <= 1 ? 30 : kpgPct <= 3 ? 20 : kpgPct <= 5 ? 12 : kpgPct <= 10 ? 6 : 0;
  const comboBonus = hsPct <= 3 && kpgPct <= 3 ? 18 : 0;
  const suspicionScore = Math.min(100, Math.round(hsScore + kpgScore + comboBonus));

  const suspiciousFactors: string[] = [];

  // 무기별 상위 3개 분석
  for (const w of weapons.slice(0, 3)) {
    const wHsRate = w.kills > 0 ? Math.round((w.hsKills / w.kills) * 100) : 0;
    const wHsPct = headshotPercentile(wHsRate);
    if (wHsPct <= 2) {
      suspiciousFactors.push(`${w.name}: ${w.kills}킬 중 헤드샷 ${wHsRate}% (상위 ${wHsPct.toFixed(1)}%)`);
    }
  }
  if (kpgPct <= 3) {
    suspiciousFactors.push(`게임당 평균 ${avgKpg.toFixed(1)}킬 (상위 ${kpgPct.toFixed(1)}%)`);
  }
  if (overallHsRate >= 45) {
    suspiciousFactors.push(`전체 헤드샷율 ${overallHsRate.toFixed(1)}% — 비정상 수준`);
  }

  const topName = weapons[0].name;
  const topHsRate = weapons[0].kills > 0
    ? Math.round((weapons[0].hsKills / weapons[0].kills) * 100)
    : 0;

  const level = getSuspicionLevel(suspicionScore);
  let label: string;
  if (level === "정상") {
    label = `${topName}으로 헤드샷율 ${topHsRate}% — 정상 범위 내입니다.`;
  } else if (level === "의심") {
    label = `헤드샷율 ${overallHsRate.toFixed(1)}%로 평균보다 높습니다 (상위 ${hsPct.toFixed(1)}%).`;
  } else if (level === "강한의심") {
    label = `${topName} 헤드샷율 ${topHsRate}%로 상위 ${hsPct.toFixed(1)}%, 게임당 ${avgKpg.toFixed(1)}킬.`;
  } else {
    label = `다수 지표가 상위 1% 이내. ${topName} 헤드샷율 ${topHsRate}% (상위 ${hsPct.toFixed(1)}%).`;
  }

  const result: HackScore = {
    suspicionScore,
    suspicionLevel: level,
    evidence: {
      topWeapon: topName,
      overallHeadshotRate: Math.round(overallHsRate * 10) / 10,
      headshotPercentile: hsPct,
      avgKillsPerGame: Math.round(avgKpg * 10) / 10,
      killsPerGamePercentile: kpgPct,
      suspiciousFactors,
    },
    label,
    disclaimer: "이 수치는 참고용이며 실제 핵 사용 여부를 보증하지 않습니다.",
  };

  setCache(cacheKey, result, 3600 * 1000);
  return result;
}
