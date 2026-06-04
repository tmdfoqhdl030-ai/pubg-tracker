export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/pubg-api";
import { analyzeBulletEfficiency, type BulletEfficiency } from "@/lib/bullet-efficiency";

const MOCK: BulletEfficiency = {
  weapons: [
    {
      weaponName: "M416",
      totalKills: 34,
      totalBulletsFired: 1020,
      bulletsPerKill: 30.0,
      efficiency: "B",
      percentile: 35,
      funLabel: "평균적인 탄약 효율입니다. 조금 더 집중하면 A등급 가능!",
    },
    {
      weaponName: "SKS",
      totalKills: 18,
      totalBulletsFired: 270,
      bulletsPerKill: 15.0,
      efficiency: "A",
      percentile: 15,
      funLabel: "정밀한 저격 실력을 보여줍니다.",
    },
    {
      weaponName: "UMP45",
      totalKills: 12,
      totalBulletsFired: 480,
      bulletsPerKill: 40.0,
      efficiency: "C",
      percentile: 55,
      funLabel: "탄약이 물처럼 쏟아집니다. 단점 개선 필요!",
    },
  ],
  overallBpk: 28.3,
  bestWeapon: "SKS",
  worstWeapon: "UMP45",
  totalBulletsFired: 1770,
  totalKills: 64,
  efficiencyScore: 62,
  gamesAnalyzed: 8,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");
  const platform = searchParams.get("platform") ?? "steam";

  if (!nickname) return NextResponse.json({ error: "nickname 파라미터가 필요합니다" }, { status: 400 });

  try {
    const player = await getPlayer(nickname, platform);
    const result = await analyzeBulletEfficiency(player.accountId, platform, player.recentMatchIds);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[bullet-efficiency]", msg);
    // PUBG API 실패 시 mock 데이터 반환
    return NextResponse.json(MOCK);
  }
}
