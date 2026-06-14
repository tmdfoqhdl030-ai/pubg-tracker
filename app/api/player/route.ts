import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerData, MOCK_PLAYER_RESPONSE } from "@/lib/fetch-player-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const platform = searchParams.get("platform") ?? "steam";

  if (!name) {
    return NextResponse.json({ error: "name 파라미터가 필요합니다" }, { status: 400 });
  }

  try {
    const data = await fetchPlayerData(name, platform);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "닉네임을 찾을 수 없습니다. 정확한 닉네임과 플랫폼을 확인해주세요." }, { status: 404 });
    }
    if (msg === "RATE_LIMIT") {
      console.warn("[PUBG API] RATE_LIMIT");
      return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
    }
    console.error("[PUBG API]", msg);
    return NextResponse.json({ error: "데이터 조회에 실패했습니다." }, { status: 500 });
  }
}
