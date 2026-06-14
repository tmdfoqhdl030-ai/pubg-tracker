import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerData } from "@/lib/fetch-player-data";
import { getWarmTargets } from "@/lib/popular-players";

// 인기 닉네임 사전 캐싱(cache warming) 작업.
// - 인기 닉네임의 전적 데이터를 미리 불러와 Redis 캐시에 채워둡니다.
// - 실사용자가 검색할 때 캐시 히트 → PUBG API 호출 0회 → 한도 절약.
// - 내부 rate limiter가 자동으로 분당 호출을 제어하므로 한도 초과 위험 없음.

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Hobby 플랜 서버리스 함수 한도(60초)

// 한 번 호출당 데울 최대 닉네임 수.
// rate limiter(분당 9회) + 60초 한도를 고려해 작게 유지.
// 더 많이 데우려면 endpoint를 여러 번(시간차로) 호출하세요.
const MAX_PER_RUN = 6;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // CRON_SECRET 미설정 시 누구나 호출 가능(개발용). 운영에선 반드시 설정 권장.
  if (!secret) return true;
  // Vercel Cron 은 Authorization: Bearer <CRON_SECRET> 헤더를 자동 전송
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  // 수동 트리거용: ?key=<secret> 쿼리도 허용
  const key = new URL(req.url).searchParams.get("key");
  return key === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const platform = (url.searchParams.get("platform") ?? "steam") as "steam" | "kakao";
  const lbTop = Math.min(Number(url.searchParams.get("top") ?? 8), 20);
  const cap = Math.min(Number(url.searchParams.get("limit") ?? MAX_PER_RUN), 12);

  const started = Date.now();
  const targets = (await getWarmTargets(platform, lbTop)).slice(0, cap);
  const warmed: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  // 순차 처리 — 동시 폭주 방지(rate limiter와 협조).
  // 60초 한도가 가까워지면 남은 대상은 skip (다음 호출에서 처리).
  for (const nick of targets) {
    if (Date.now() - started > 50_000) { skipped.push(nick); continue; }
    try {
      await fetchPlayerData(nick, platform);
      warmed.push(nick);
    } catch {
      failed.push(nick);
    }
  }

  return NextResponse.json({
    ok: true,
    platform,
    elapsedMs: Date.now() - started,
    warmed,
    failed,
    skipped,
  });
}
