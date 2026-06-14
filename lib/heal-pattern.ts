// ── 힐 패턴 분석 서비스 ──────────────────────────────────────────────
// LogItemUse 이벤트로 힐 아이템 사용 패턴을 분석해 플레이 스타일을 진단한다.

import { getMatch } from "./pubg-api";
import { getTelemetryUrl, parseTelemetryForPlayer, itemIdToHealCategory, HealCategory } from "./telemetry-parser";
import { getCache, setCache } from "./cache";

export interface HealPattern {
  totalHeals: number;
  breakdown: Record<Exclude<HealCategory, "other">, number>;
  ratios: Record<Exclude<HealCategory, "other">, number>;
  style: "극생존형" | "존버형" | "균형형" | "공격형" | "무모형";
  styleDescription: string;
  funFact: string;
  gamesAnalyzed: number;
}

const HEAL_LABELS: Record<Exclude<HealCategory, "other">, string> = {
  bandage: "붕대",
  firstAid: "구급상자",
  medKit: "의료용 키트",
  energyDrink: "에너지 음료",
  painkiller: "진통제",
  adrenaline: "아드레날린",
};

function determineStyle(r: HealPattern["ratios"]): {
  style: HealPattern["style"];
  description: string;
} {
  if (r.adrenaline >= 28) {
    return {
      style: "공격형",
      description:
        "교전 중 아드레날린에 의존하는 공격적 스타일. 안전 지역 확보 후 풀힐 습관을 들이면 후반전 생존율이 올라갑니다.",
    };
  }
  if (r.medKit >= 30) {
    return {
      style: "극생존형",
      description:
        "안전한 지역에서 완전 회복을 선호하는 스타일. 효율적인 힐 타이밍으로 더 많은 교전에 참여할 수 있습니다.",
    };
  }
  if (r.bandage >= 40) {
    return {
      style: "무모형",
      description:
        "위험한 상황에서도 붕대로 버티는 스타일. 상위 힐 아이템 관리가 승률을 높이는 핵심입니다.",
    };
  }
  if (r.adrenaline + r.painkiller + r.energyDrink >= 55) {
    return {
      style: "존버형",
      description:
        "부스터를 통한 지속 회복을 선호하는 생존 중심 스타일. 자기장 압박 시 매우 효과적입니다.",
    };
  }
  return {
    style: "균형형",
    description:
      "상황에 맞게 힐 아이템을 고르게 사용합니다. 안정적인 플레이어 유형입니다.",
  };
}

export async function analyzeHealPattern(
  accountId: string,
  platform: string,
  recentMatchIds: string[]
): Promise<HealPattern> {
  const cacheKey = `heal-pattern:${platform}:${accountId}`;
  const cached = getCache<HealPattern>(cacheKey);
  if (cached) return cached;

  const counts: Record<HealCategory, number> = {
    bandage: 0, firstAid: 0, medKit: 0,
    energyDrink: 0, painkiller: 0, adrenaline: 0, other: 0,
  };

  const matchLimit = Math.min(recentMatchIds.length, 5);
  let gamesAnalyzed = 0;

  const matchResults = await Promise.allSettled(
    recentMatchIds.slice(0, matchLimit).map(async (id) => {
      const md = await getMatch(id, platform);
      const url = getTelemetryUrl(md);
      if (!url) return null;
      return parseTelemetryForPlayer(url, accountId, id);
    })
  );

  for (const r of matchResults) {
    if (r.status !== "fulfilled" || !r.value) continue;
    gamesAnalyzed++;
    for (const ev of r.value.healEvents) {
      const cat = itemIdToHealCategory(ev.item.itemId);
      counts[cat]++;
    }
  }

  const healItems: Exclude<HealCategory, "other">[] = [
    "bandage", "firstAid", "medKit", "energyDrink", "painkiller", "adrenaline",
  ];
  const meaningful = healItems.reduce((s, k) => s + counts[k], 0);
  const totalHeals = meaningful + counts.other;

  const breakdown = Object.fromEntries(healItems.map((k) => [k, counts[k]])) as HealPattern["breakdown"];
  const divisor = Math.max(meaningful, 1);
  const ratios = Object.fromEntries(
    healItems.map((k) => [k, Math.round((counts[k] / divisor) * 100)])
  ) as HealPattern["ratios"];

  const { style, description } = determineStyle(ratios);

  // 가장 많이 쓴 아이템으로 재밌는 문구 생성
  const topEntry = healItems
    .map((k) => ({ k, v: counts[k] }))
    .sort((a, b) => b.v - a.v)[0];
  const funFact =
    totalHeals > 0
      ? `최근 ${gamesAnalyzed}게임에서 ${HEAL_LABELS[topEntry.k]}을(를) ${topEntry.v}회 사용했습니다 (전체의 ${Math.round((topEntry.v / Math.max(totalHeals, 1)) * 100)}%)`
      : `최근 ${gamesAnalyzed}게임 힐 사용 데이터가 없습니다.`;

  const result: HealPattern = {
    totalHeals, breakdown, ratios, style,
    styleDescription: description, funFact, gamesAnalyzed,
  };

  setCache(cacheKey, result, 4 * 3600 * 1000);
  return result;
}
