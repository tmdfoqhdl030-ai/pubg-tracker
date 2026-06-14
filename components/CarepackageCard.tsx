// 📦 케어패키지 기록 카드 — 비동기 서버 컴포넌트

import type { CarepackageStats } from "@/lib/carepackage-stats";
import { getBaseUrl } from "@/lib/base-url";

async function fetchCarepackage(nickname: string, platform: string): Promise<CarepackageStats | null> {
  try {
    const base = getBaseUrl();
    const res = await fetch(
      `${base}/api/v1/carepackage?nickname=${encodeURIComponent(nickname)}&platform=${platform}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const CAREPACKAGE_ITEM_EMOJI: Record<string, string> = {
  AWM: "🎯", Groza: "⚡", M249: "🔫", MG3: "🔫",
  "Lynx AMR": "🎯", AUG: "🔫", "PP-19": "🔫", DBS: "💥",
  P90: "🔫", 아드레날린: "💉",
  "레벨3 조끼": "🛡", "레벨4 조끼": "🛡", "레벨3 헬멧": "⛑️",
};

const RANK_COLORS = ["#F59E0B", "#94A3B8", "#CD7F32"];

export default async function CarepackageCard({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const data = await fetchCarepackage(nickname, platform);
  if (!data) return null;

  const hasLoot = data.totalLootCount > 0;
  const titleColor = hasLoot ? "#F97316" : "#94A3B8";

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">📦</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>보급함 기록</span>
        </div>
        <span className="text-xs" style={{ color: "#94A3B8" }}>최근 {data.gamesAnalyzed}게임</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* title + stats */}
        <div className="flex items-center justify-between p-3.5 rounded-xl"
          style={{ background: "linear-gradient(135deg, #FFF7ED, #FFF)", border: "1px solid #FDBA74" }}>
          <div>
            <div className="text-xs" style={{ color: "#94A3B8" }}>칭호</div>
            <div className="text-lg font-black mt-0.5" style={{ color: titleColor }}>
              {data.title}
            </div>
            {hasLoot && (
              <div className="text-[11px] mt-1" style={{ color: "#64748B" }}>
                전체 유저 상위 <span className="font-bold">{data.percentile}%</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color: hasLoot ? "#F97316" : "#CBD5E1" }}>
              {data.gamesWithLoot}
            </div>
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>보급함 오픈</div>
            <div className="text-[10px]" style={{ color: "#CBD5E1" }}>
              {data.gamesAnalyzed}게임 중
            </div>
          </div>
        </div>

        {/* item list */}
        {hasLoot && data.itemsLooted.length > 0 ? (
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: "#64748B" }}>
              획득 아이템 TOP {data.itemsLooted.length}
            </div>
            <div className="space-y-2">
              {data.itemsLooted.map((item, i) => {
                const rankColor = RANK_COLORS[i] ?? "#94A3B8";
                const emoji = CAREPACKAGE_ITEM_EMOJI[item.displayName] ?? "📦";
                const maxCount = data.itemsLooted[0]?.count ?? 1;
                const barPct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.displayName} className="flex items-center gap-2.5">
                    <span className="text-xs font-black w-5 text-center" style={{ color: rankColor }}>
                      {i + 1}
                    </span>
                    <span className="text-sm">{emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: "#0F172A" }}>
                          {item.displayName}
                        </span>
                        <span className="text-xs font-bold" style={{ color: rankColor }}>
                          × {item.count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${barPct}%`, backgroundColor: rankColor }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-sm font-medium" style={{ color: "#94A3B8" }}>보급함 기록 없음</div>
            <div className="text-xs mt-1" style={{ color: "#CBD5E1" }}>
              최근 {data.gamesAnalyzed}게임에서 보급함을 열지 않았습니다
            </div>
          </div>
        )}

        {/* fun fact */}
        <div className="text-xs leading-relaxed px-3 py-2.5 rounded-lg"
          style={{ backgroundColor: "#FFF7ED", color: "#92400E", border: "1px solid #FDE68A" }}>
          💬 {data.funFact}
        </div>
      </div>
    </div>
  );
}
