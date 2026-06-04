type MatchData = Record<string, unknown>;

interface IncludedItem {
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
}

interface RosterRelationships {
  participants?: { data?: Array<{ type: string; id: string }> };
}

export interface TeammateEntry {
  nickname: string;
  accountId: string;
  gamesTogether: number;
  winsTogether: number;
  winRateTogether: number;
  avgPlacementTogether: number;
  avgKillsTogether: number;
  avgDamageTogether: number;
  synergyScore: number;
}

export interface TogetherMatch {
  matchId: string;
  isWin: boolean;
  placement: number;
  playerAKills: number;
  playerADamage: number;
  playerBKills: number;
  playerBDamage: number;
}

function getIncluded(matchData: MatchData): IncludedItem[] {
  return (matchData.included as IncludedItem[]) ?? [];
}

function getStats(item: IncludedItem): Record<string, unknown> {
  return ((item.attributes?.stats as Record<string, unknown>) ?? {});
}

// ─── 단일 매치에서 팀원 추출 ─────────────────────────────────
export function parseTeammatesFromMatch(
  matchData: MatchData,
  accountId: string
): Array<{
  accountId: string;
  nickname: string;
  kills: number;
  damage: number;
  isWin: boolean;
  placement: number;
}> {
  const included = getIncluded(matchData);

  const myParticipant = included.find(
    (item) => item.type === "participant" && getStats(item).playerId === accountId
  );
  if (!myParticipant) return [];

  const myRoster = included.find((item) => {
    if (item.type !== "roster") return false;
    const rel = item.relationships as RosterRelationships | undefined;
    return rel?.participants?.data?.some((p) => p.id === myParticipant.id) ?? false;
  });
  if (!myRoster) return [];

  const rosterRel = myRoster.relationships as RosterRelationships;

  // ✅ placement는 participant의 winPlace에서 가져옴 (roster.rank는 null이 많음)
  const myStats = getStats(myParticipant);
  const placement = (myStats.winPlace as number) ?? 99;
  // ✅ isWin은 winPlace === 1 기준 (roster.won은 API 버전마다 형식이 다름)
  const isWin = placement === 1;

  const teammateIds = (rosterRel.participants?.data ?? [])
    .filter((p) => p.id !== myParticipant.id)
    .map((p) => p.id);

  return teammateIds
    .map((pid) => {
      const p = included.find((item) => item.type === "participant" && item.id === pid);
      if (!p) return null;
      const s = getStats(p);
      return {
        accountId: String(s.playerId ?? ""),
        nickname: String(s.name ?? ""),
        kills: (s.kills as number) ?? 0,
        damage: Math.round((s.damageDealt as number) ?? 0),
        isWin,      // 같은 팀 → 동일한 isWin
        placement,  // 같은 팀 → 동일한 placement
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.accountId !== "");
}

// ─── 여러 매치 → 팀원 빈도 집계 ─────────────────────────────
export function buildFrequentTeammates(
  matchDataList: MatchData[],
  accountId: string
): TeammateEntry[] {
  const map: Record<
    string,
    {
      nickname: string;
      accountId: string;
      gamesTogether: number;
      winsTogether: number;
      totalPlacement: number;
      totalKills: number;
      totalDamage: number;
    }
  > = {};

  for (const matchData of matchDataList) {
    const teammates = parseTeammatesFromMatch(matchData, accountId);
    for (const t of teammates) {
      if (!map[t.accountId]) {
        map[t.accountId] = {
          nickname: t.nickname,
          accountId: t.accountId,
          gamesTogether: 0,
          winsTogether: 0,
          totalPlacement: 0,
          totalKills: 0,
          totalDamage: 0,
        };
      }
      const e = map[t.accountId];
      e.gamesTogether++;
      if (t.isWin) e.winsTogether++;
      e.totalPlacement += t.placement;
      e.totalKills += t.kills;
      e.totalDamage += t.damage;
    }
  }

  return Object.values(map)
    .map((e) => {
      const g = e.gamesTogether;
      const winRateTogether = g > 0 ? (e.winsTogether / g) * 100 : 0;
      const avgPlacement = g > 0 ? e.totalPlacement / g : 99;
      const avgKills = g > 0 ? Math.round((e.totalKills / g) * 10) / 10 : 0;
      const avgDamage = g > 0 ? Math.round(e.totalDamage / g) : 0;
      return {
        ...e,
        winRateTogether: Math.round(winRateTogether * 10) / 10,
        avgPlacementTogether: Math.round(avgPlacement * 10) / 10,
        avgKillsTogether: avgKills,
        avgDamageTogether: avgDamage,
        synergyScore: calculateSynergyScore(g, winRateTogether, avgPlacement),
      };
    })
    .sort((a, b) => b.gamesTogether - a.gamesTogether);
}

// ─── 시너지 점수 0-100 ──────────────────────────────────────
export function calculateSynergyScore(
  gamesTogether: number,
  winRateTogether: number,
  avgPlacement: number
): number {
  // 경험치: 50게임 기준 max 25
  const expScore = Math.min((gamesTogether / 50) * 25, 25);
  // 승률: 15% 기준 max 35
  const winScore = Math.min((winRateTogether / 15) * 35, 35);
  // 순위: 1위 = 35, 20위 = 0
  const placScore = Math.max(0, 35 - (avgPlacement - 1) * 2);

  return Math.min(Math.round(expScore + winScore + placScore + 5), 100);
}

// ─── 두 플레이어가 함께 플레이한 매치 분석 ──────────────────
export function parseTogetherMatches(
  matchEntries: Array<{ matchId: string; data: Record<string, unknown> }>,
  accountId: string,
  targetNickname: string
): TogetherMatch[] {
  const results: TogetherMatch[] = [];

  for (const entry of matchEntries) {
    const { matchId, data: matchData } = entry;
    const included = getIncluded(matchData);

    // Find PlayerA
    const playerAParticipant = included.find(
      (item) => item.type === "participant" && getStats(item).playerId === accountId
    );
    if (!playerAParticipant) continue;

    // Find PlayerB by nickname
    const playerBParticipant = included.find(
      (item) =>
        item.type === "participant" &&
        String(getStats(item).name ?? "").toLowerCase() === targetNickname.toLowerCase()
    );
    if (!playerBParticipant) continue;

    // Check same roster
    const myRoster = included.find((item) => {
      if (item.type !== "roster") return false;
      const rel = item.relationships as RosterRelationships | undefined;
      return rel?.participants?.data?.some((p) => p.id === playerAParticipant.id) ?? false;
    });
    if (!myRoster) continue;

    const rosterRel = myRoster.relationships as RosterRelationships;
    const isTeammate = rosterRel.participants?.data?.some(
      (p) => p.id === playerBParticipant.id
    ) ?? false;
    if (!isTeammate) continue;

    const isWin = (myRoster.attributes as Record<string, unknown>)?.won === "1";
    const placement = ((myRoster.attributes as Record<string, unknown>)?.rank as number) ?? 99;

    const aStats = getStats(playerAParticipant);
    const bStats = getStats(playerBParticipant);

    results.push({
      matchId,
      isWin,
      placement,
      playerAKills: (aStats.kills as number) ?? 0,
      playerADamage: Math.round((aStats.damageDealt as number) ?? 0),
      playerBKills: (bStats.kills as number) ?? 0,
      playerBDamage: Math.round((bStats.damageDealt as number) ?? 0),
    });
  }

  return results;
}
