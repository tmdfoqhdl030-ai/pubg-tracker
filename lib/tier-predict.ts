// ── PUBG 다음 시즌 티어 예측 엔진 ──────────────────────────────────────
// KDA / 평균 딜량 / 승률 / 헤드샷율 / 탑10율 다섯 가지 지표로 100점 환산

export interface TierPredictResult {
  tier: string;
  subTier: string;
  score: number;     // 0-100
  kdaScore: number;
  damageScore: number;
  winScore: number;
  hsScore: number;
  top10Score: number;
}

/** 각 지표별 상한점수 합계 = 100 */
// const MAX = { kda: 35, damage: 30, win: 20, hs: 8, top10: 7 };

export function predictTier(stats: {
  kda: number;
  avgDamage: number;
  winRate: number;
  headshotRate: number;
  topTenRate: number;
}): TierPredictResult {
  const { kda, avgDamage, winRate, headshotRate, topTenRate } = stats;

  /* ── KDA (35점) ─────────────────────── */
  const kdaScore =
    kda >= 6.0 ? 35 : kda >= 5.0 ? 31 : kda >= 4.0 ? 26 :
    kda >= 3.0 ? 22 : kda >= 2.5 ? 18 : kda >= 2.0 ? 14 :
    kda >= 1.5 ? 10 : kda >= 1.0 ? 6  : kda >= 0.5 ? 2  : 0;

  /* ── 평균 딜량 (30점) ────────────────── */
  const damageScore =
    avgDamage >= 650 ? 30 : avgDamage >= 550 ? 26 : avgDamage >= 450 ? 22 :
    avgDamage >= 380 ? 18 : avgDamage >= 300 ? 13 : avgDamage >= 230 ? 9  :
    avgDamage >= 180 ? 5  : avgDamage >= 120 ? 2  : 0;

  /* ── 승률 (20점) ─────────────────────── */
  const winScore =
    winRate >= 20 ? 20 : winRate >= 15 ? 17 : winRate >= 12 ? 14 :
    winRate >= 9  ? 10 : winRate >= 6  ? 7  : winRate >= 3  ? 3  : 0;

  /* ── 헤드샷율 (8점) ─────────────────── */
  const hsScore =
    headshotRate >= 45 ? 8 : headshotRate >= 35 ? 6 :
    headshotRate >= 25 ? 4 : headshotRate >= 15 ? 2 : 0;

  /* ── 탑10율 (7점) ───────────────────── */
  const top10Score =
    topTenRate >= 50 ? 7 : topTenRate >= 40 ? 5 :
    topTenRate >= 30 ? 3 : topTenRate >= 20 ? 1 : 0;

  const score = kdaScore + damageScore + winScore + hsScore + top10Score;

  /* ── 점수 → 티어 ─────────────────────── */
  const tier =
    score >= 90 ? { tier: "Conqueror", subTier: ""    } :
    score >= 82 ? { tier: "Master",    subTier: ""    } :
    score >= 74 ? { tier: "Diamond",   subTier: "I"   } :
    score >= 66 ? { tier: "Diamond",   subTier: "II"  } :
    score >= 58 ? { tier: "Diamond",   subTier: "III" } :
    score >= 50 ? { tier: "Platinum",  subTier: "I"   } :
    score >= 43 ? { tier: "Platinum",  subTier: "II"  } :
    score >= 36 ? { tier: "Platinum",  subTier: "III" } :
    score >= 30 ? { tier: "Gold",      subTier: "I"   } :
    score >= 24 ? { tier: "Gold",      subTier: "II"  } :
    score >= 19 ? { tier: "Gold",      subTier: "III" } :
    score >= 14 ? { tier: "Silver",    subTier: "I"   } :
    score >= 10 ? { tier: "Silver",    subTier: "II"  } :
    score >= 6  ? { tier: "Silver",    subTier: "III" } :
    score >= 3  ? { tier: "Bronze",    subTier: "I"   } :
                  { tier: "Bronze",    subTier: "II"  };

  return { ...tier, score, kdaScore, damageScore, winScore, hsScore, top10Score };
}

/** 다음 티어 달성에 필요한 점수 차와 제안 메시지 */
export function nextTierTarget(score: number): { needScore: number; nextTier: string; nextSub: string } {
  const thresholds: { score: number; tier: string; sub: string }[] = [
    { score: 3,  tier: "Bronze",    sub: "I"   },
    { score: 6,  tier: "Silver",    sub: "III" },
    { score: 10, tier: "Silver",    sub: "II"  },
    { score: 14, tier: "Silver",    sub: "I"   },
    { score: 19, tier: "Gold",      sub: "III" },
    { score: 24, tier: "Gold",      sub: "II"  },
    { score: 30, tier: "Gold",      sub: "I"   },
    { score: 36, tier: "Platinum",  sub: "III" },
    { score: 43, tier: "Platinum",  sub: "II"  },
    { score: 50, tier: "Platinum",  sub: "I"   },
    { score: 58, tier: "Diamond",   sub: "III" },
    { score: 66, tier: "Diamond",   sub: "II"  },
    { score: 74, tier: "Diamond",   sub: "I"   },
    { score: 82, tier: "Master",    sub: ""    },
    { score: 90, tier: "Conqueror", sub: ""    },
  ];
  const next = thresholds.find(t => t.score > score);
  if (!next) return { needScore: 0, nextTier: "Conqueror", nextSub: "" };
  return { needScore: next.score - score, nextTier: next.tier, nextSub: next.sub };
}

// ── 시즌 목표 진행률 ──────────────────────────────────────────────────

/** 티어별 기준 RP (approximate, PUBG 시즌 기준) */
export const TIER_RP: Record<string, number> = {
  "Bronze-III":    500,  "Bronze-II":    700,  "Bronze-I":    900,
  "Silver-III":   1100,  "Silver-II":   1300,  "Silver-I":   1500,
  "Gold-IV":      1700,  "Gold-III":    2000,  "Gold-II":    2300,  "Gold-I":    2600,
  "Platinum-IV":  2900,  "Platinum-III":3200,  "Platinum-II":3500,  "Platinum-I":3800,
  "Diamond-III":  4100,  "Diamond-II":  4400,  "Diamond-I":  4700,
  "Master":       5000,  "Conqueror":   5500,
};

/** 현재 RP 기준 다음 티어 목표 */
export function getNextGoal(
  currentTier: string,
  currentSub: string
): { goalTier: string; goalSub: string; goalRP: number; prevRP: number } {
  const order: { tier: string; sub: string; rp: number }[] = [
    { tier: "Bronze",   sub: "III", rp: 500  },
    { tier: "Bronze",   sub: "II",  rp: 700  },
    { tier: "Bronze",   sub: "I",   rp: 900  },
    { tier: "Silver",   sub: "III", rp: 1100 },
    { tier: "Silver",   sub: "II",  rp: 1300 },
    { tier: "Silver",   sub: "I",   rp: 1500 },
    { tier: "Gold",     sub: "IV",  rp: 1700 },
    { tier: "Gold",     sub: "III", rp: 2000 },
    { tier: "Gold",     sub: "II",  rp: 2300 },
    { tier: "Gold",     sub: "I",   rp: 2600 },
    { tier: "Platinum", sub: "IV",  rp: 2900 },
    { tier: "Platinum", sub: "III", rp: 3200 },
    { tier: "Platinum", sub: "II",  rp: 3500 },
    { tier: "Platinum", sub: "I",   rp: 3800 },
    { tier: "Diamond",  sub: "III", rp: 4100 },
    { tier: "Diamond",  sub: "II",  rp: 4400 },
    { tier: "Diamond",  sub: "I",   rp: 4700 },
    { tier: "Master",   sub: "",    rp: 5000 },
    { tier: "Conqueror", sub: "",   rp: 5500 },
  ];

  // 현재 티어 인덱스 찾기
  const idx = order.findIndex(t => t.tier === currentTier && t.sub === currentSub);
  const nextIdx = Math.max(idx, 0) + 1;
  const next  = order[Math.min(nextIdx, order.length - 1)];
  const prev  = order[Math.max(nextIdx - 1, 0)];

  return {
    goalTier: next.tier,
    goalSub:  next.sub,
    goalRP:   next.rp,
    prevRP:   prev.rp,
  };
}

/** 경기당 예상 RP 획득량 (winRate %, kda, avgDamage 기준) */
export function estimateRpPerGame(winRate: number, kda: number, avgDamage: number): number {
  const raw = (winRate / 100) * 60 + kda * 4 + (avgDamage / 100) * 2 - 24;
  return Math.max(3, Math.round(raw));
}

/** 각 항목별 등급 라벨 */
export function gradeLabel(actual: number, max: number): { label: string; color: string } {
  const r = actual / max;
  if (r >= 0.86) return { label: "최상",  color: "#F97316" };
  if (r >= 0.72) return { label: "우수",  color: "#EAB308" };
  if (r >= 0.50) return { label: "보통",  color: "#3B82F6" };
  if (r >= 0.25) return { label: "부족",  color: "#94A3B8" };
  return                 { label: "미흡",  color: "#EF4444" };
}
