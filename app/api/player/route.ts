import { NextRequest, NextResponse } from "next/server";
import {
  getPlayer,
  getCurrentSeason,
  getSeasonStats,
  getRankedStats,
  getMatch,
  getWeaponMastery,
  parseMatchWithTeammates,
  localizeMapName,
  localizeMode,
} from "@/lib/pubg-api";
import { weaponIdToName } from "@/lib/telemetry-parser";
import { classifyPlayStyle } from "@/lib/play-style";
import { mockPlayer } from "@/lib/mock-data";

const MOCK_RESPONSE = {
  player: { accountId: "mock", nickname: mockPlayer.nickname, platform: "steam" },
  season: mockPlayer.season,
  modeStats: mockPlayer.modeStats,
  rankedTier: mockPlayer.rankedTier,
  recentMatches: mockPlayer.recentMatches,
  dangerScore: mockPlayer.dangerScore,
  dangerDetails: mockPlayer.dangerDetails,
  weapons: mockPlayer.weapons,
  aiAnalysis: mockPlayer.aiAnalysis,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const platform = searchParams.get("platform") ?? "steam";

  if (!name) {
    return NextResponse.json({ error: "name 파라미터가 필요합니다" }, { status: 400 });
  }

  try {
    const player = await getPlayer(name, platform);
    const seasonId = await getCurrentSeason(platform);
    const seasonStatsRaw = await getSeasonStats(player.accountId, platform, seasonId);
    const seasonStats = (seasonStatsRaw && seasonStatsRaw.gamesPlayed > 0) ? seasonStatsRaw : null;

    // 랭크 통계 (티어 정보)
    const rankedTier = await getRankedStats(player.accountId, platform, seasonId);

    const matchLimit = Math.min(player.recentMatchIds.length, 20);
    const matchResults = await Promise.allSettled(
      player.recentMatchIds.slice(0, matchLimit).map((id) => getMatch(id, platform))
    );

    const recentMatches = matchResults
      .map((result, i) => {
        if (result.status !== "fulfilled") return null;
        const parsed = parseMatchWithTeammates(result.value, player.accountId);
        if (!parsed) return null;
        return {
          id: player.recentMatchIds[i],
          map: localizeMapName(parsed.map),
          mode: localizeMode(parsed.mode),
          rank: parsed.placement,
          kills: parsed.kills,
          assists: parsed.assists,
          headshotKills: parsed.headshotKills,
          damage: parsed.damage,
          survived: parsed.survived,
          isWin: parsed.isWin,
          playedAt: parsed.playedAt,
          teammates: parsed.teammates,
          totalPlayers: parsed.totalPlayers,
          dbno: parsed.dbno,
          distanceKm: parsed.distanceKm,
        };
      })
      .filter(Boolean);

    const recent5 = recentMatches.slice(0, 5);
    let dangerScore = 50;
    let recentKDA = 0;
    let recentDamage = 0;
    let recentHeadshot = 0;

    if (recent5.length > 0) {
      const avgKills = recent5.reduce((s, m) => s + (m?.kills ?? 0), 0) / recent5.length;
      recentDamage = Math.round(recent5.reduce((s, m) => s + (m?.damage ?? 0), 0) / recent5.length);
      // KDA = kills / max(deaths, 1) — 사망 수는 패배 게임 수로 추산
      const avgDeaths = recent5.reduce((s, m) => s + (m?.isWin ? 0 : 1), 0) / recent5.length;
      recentKDA = Math.round((avgKills / Math.max(avgDeaths, 0.5)) * 10) / 10;
      // headshotKills는 match API에 없으므로 시즌 스탯 값으로 대체
      recentHeadshot = seasonStats?.headshotRate ?? 0;

      const kdaScore = Math.min(avgKills * 10, 40);
      const damageScore = Math.min((recentDamage / 600) * 30, 30);
      const winScore = recent5.filter((m) => m?.isWin).length * 2;
      dangerScore = Math.max(0, Math.min(100, Math.round(kdaScore + damageScore + winScore + 10)));
    }

    let weapons: { name: string; kills: number; headshotRate: number; games: number }[] = [];
    try {
      const masteryData = await getWeaponMastery(player.accountId, platform);
      const weaponStats = masteryData?.data?.attributes?.weaponsummary ?? {};
      weapons = Object.entries(weaponStats)
        .map(([id, stats]: [string, unknown]) => {
          const s = stats as Record<string, number>;
          const kills = s.kills ?? 0;
          const headshots = s.headShotKills ?? 0;
          return {
            name: weaponIdToName(id),
            kills,
            headshotRate: kills > 0 ? Math.round((headshots / kills) * 100) : 0,
            games: s.roundsPlayed ?? 0,
          };
        })
        .filter((w) => w.kills > 0)
        .sort((a, b) => b.kills - a.kills)
        .slice(0, 5);
    } catch { /* 무기 마스터리 실패 시 빈 배열 */ }

    return NextResponse.json({
      player: { accountId: player.accountId, nickname: player.nickname, platform },
      season: seasonStats,
      modeStats: seasonStats?.modeStats ?? null,
      rankedTier,
      recentMatches,
      dangerScore,
      dangerDetails: {
        recentKDA,
        recentDamage,
        recentHeadshot,
        preferredWeapon: weapons[0]?.name ?? null,
        playStyle: recentKDA >= 3 ? "공격형" : recentKDA >= 1.5 ? "균형형" : "존버형",
      },
      weapons,
      aiAnalysis: (function() {
        // 우선순위: ranked 스탯 > 일반 시즌 스탯(10게임 이상) > 최근 5경기
        const bestRanked = rankedTier?.squad ?? rankedTier?.duo ?? rankedTier?.solo ?? null;
        const seasonOk = (seasonStats?.gamesPlayed ?? 0) >= 10;

        let classifyStats: Parameters<typeof classifyPlayStyle>[0];

        if (bestRanked) {
          // ranked 스탯 기준 — headshotRate/topTenRate는 시즌 데이터가 충분하면 사용,
          // 부족하면 winRate 기반 추정 (ranked top10 ≈ winRate × 4, headshot ≈ winRate × 2)
          classifyStats = {
            kda:          bestRanked.kda,
            avgDamage:    bestRanked.avgDamage,
            winRate:      bestRanked.winRate,
            headshotRate: seasonOk ? (seasonStats!.headshotRate) : bestRanked.winRate * 2,
            topTenRate:   seasonOk ? (seasonStats!.topTenRate)   : Math.min(60, bestRanked.winRate * 4),
            gamesPlayed:  bestRanked.games,
          };
        } else if (seasonOk && seasonStats) {
          classifyStats = {
            kda:          seasonStats.kda,
            avgDamage:    seasonStats.avgDamage,
            winRate:      seasonStats.winRate,
            headshotRate: seasonStats.headshotRate,
            topTenRate:   seasonStats.topTenRate,
            gamesPlayed:  seasonStats.gamesPlayed,
          };
        } else {
          // 데이터 부족 — 최근 5경기 기반 fallback
          classifyStats = {
            kda:         recentKDA,
            avgDamage:   recentDamage,
            winRate:     recent5.filter(m => m?.isWin).length / Math.max(recent5.length, 1) * 100,
            headshotRate: recentHeadshot,
            topTenRate:  0,
            gamesPlayed: recent5.length,
          };
        }
        const styleDef = classifyPlayStyle(classifyStats);
        return {
          styleKey: styleDef.key,
          // 레거시 필드 (하위 호환)
          style: recentKDA >= 3 ? "공격형" : recentKDA >= 1.5 ? "균형형" : "존버형",
          summary: styleDef.summary,
          improvements: styleDef.improvements,
        };
      })(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "NOT_FOUND") {
      console.warn("[PUBG API] NOT_FOUND — mock 데이터로 대체");
      return NextResponse.json(MOCK_RESPONSE);
    }
    if (msg === "RATE_LIMIT") {
      console.warn("[PUBG API] RATE_LIMIT — mock 데이터로 대체");
      return NextResponse.json(MOCK_RESPONSE);
    }
    console.error("[PUBG API]", msg);
    return NextResponse.json(MOCK_RESPONSE);
  }
}

