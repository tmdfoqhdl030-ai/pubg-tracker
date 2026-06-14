// 🗺 파밍 루트 히트맵 카드 — 비동기 서버 컴포넌트

import type { FarmingHeatmap } from "@/lib/farming-heatmap";
import { getBaseUrl } from "@/lib/base-url";

async function fetchFarmingHeatmap(nickname: string, platform: string): Promise<FarmingHeatmap | null> {
  try {
    const base = getBaseUrl();
    const res = await fetch(
      `${base}/api/v1/farming-heatmap?nickname=${encodeURIComponent(nickname)}&platform=${platform}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const MAP_COLOR: Record<string, string> = {
  Erangel: "#22C55E",
  Miramar: "#F59E0B",
  Taego: "#F97316",
  Sanhok: "#84CC16",
  Vikendi: "#60A5FA",
  Deston: "#8B5CF6",
  Rondo: "#EC4899",
};

const MAP_KO: Record<string, string> = {
  Erangel: "에란겔", Miramar: "미라마", Taego: "태이고",
  Sanhok: "산호크", Vikendi: "비켄디", Deston: "데스턴", Rondo: "론도",
};

const LOCATION_KO: Record<string, string> = {
  // 에란겔
  "Pochinki": "포치인키", "School": "학교", "Georgopol": "조지오폴",
  "Military Base": "군사기지", "Mylta Power": "밀타 파워", "Rozhok": "로조크",
  "Severny": "세베르니", "Yasnaya Polyana": "야스나야", "Lipovka": "리포브카",
  "Primorsk": "프리모르스크", "Novorepnoye": "노보레프노예", "Gatka": "가트카",
  "Ferry Pier": "선착장",
  // 미라마
  "El Pozo": "엘 포조", "San Martin": "산 마르틴", "Los Leones": "로스 레오네스",
  "Monte Nuevo": "몬테 누에보", "Pecado": "페카도", "La Cobreria": "라 코브레리아",
  "Hacienda del Patron": "하시엔다", "Crater Fields": "크레이터 필드",
  // 태이고
  "Taego-Ri": "태이고리", "Mystic Woods": "신비의 숲", "Yangyang": "양양",
  // 산호크
  "Cave": "동굴", "Bootcamp": "부트캠프", "Paradise Resort": "파라다이스 리조트",
  "Camp Alpha": "알파 캠프", "Ruins": "유적지", "Pai Nan": "파이 난",
  // 비켄디
  "Castle": "성", "Movatra": "모바트라", "Cosmodrome": "코스모드롬",
  // 공통
  "Airport": "공항", "Power Plant": "발전소",
};

const STYLE_CONFIG: Record<string, { emoji: string; desc: string; color: string }> = {
  핫드랍형: { emoji: "🔥", desc: "고밀집 지역에 집중 드랍하는 스타일", color: "#EF4444" },
  외곽파밍형: { emoji: "🌿", desc: "외곽 지역을 이동하며 안전하게 파밍", color: "#22C55E" },
  중간지역형: { emoji: "⚡", desc: "중간 지역에서 균형 있게 파밍", color: "#3B82F6" },
};

export default async function FarmingHeatmapCard({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const data = await fetchFarmingHeatmap(nickname, platform);
  if (!data || data.gamesAnalyzed === 0) return null;

  const mapColor = MAP_COLOR[data.map] ?? "#64748B";
  const styleCfg = STYLE_CONFIG[data.farmingStyle] ?? STYLE_CONFIG.중간지역형;

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🗺</span>
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>파밍 스타일 분석</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: `${mapColor}18`, color: mapColor }}>
            {MAP_KO[data.map] ?? data.map}
          </span>
          <span className="text-xs" style={{ color: "#94A3B8" }}>{data.gamesAnalyzed}게임</span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* farming style */}
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: `${styleCfg.color}08`, border: `1px solid ${styleCfg.color}20` }}>
          <span className="text-2xl">{styleCfg.emoji}</span>
          <div>
            <div className="text-sm font-bold" style={{ color: styleCfg.color }}>{data.farmingStyle}</div>
            <div className="text-[11px]" style={{ color: "#64748B" }}>{styleCfg.desc}</div>
          </div>
        </div>

        {/* hot zones */}
        {data.hotZones.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: "#64748B" }}>
              주요 파밍 지역 TOP {Math.min(10, data.hotZones.length)}
            </div>
            <div className="space-y-1.5">
              {data.hotZones.slice(0, 10).map((z, i) => (
                <div key={z.name} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-4 text-center" style={{ color: "#94A3B8" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "#374151" }}>{z.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${z.pct}%`, backgroundColor: mapColor }} />
                      </div>
                      <span className="text-[10px]" style={{ color: "#94A3B8" }}>{z.pickupCount}회</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#F8FAFC" }}>
            <div className="text-sm font-bold" style={{ color: "#0F172A" }}>{data.avgPickupsPerGame}</div>
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>게임당 평균 픽업</div>
          </div>
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#F8FAFC" }}>
            <div className="text-sm font-bold" style={{ color: "#0F172A" }}>{data.mostPickedItem}</div>
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>가장 많이 줍는 아이템</div>
          </div>
        </div>
      </div>
    </div>
  );
}
