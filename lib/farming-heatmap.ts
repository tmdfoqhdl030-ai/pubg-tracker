// ── 파밍 루트 히트맵 서비스 ──────────────────────────────────────────
// LogItemPickup 좌표를 집계해 "어디서 주로 파밍하는지"를 분석한다.

import { getMatch, localizeMapName } from "./pubg-api";
import { getTelemetryUrl, parseTelemetryForPlayer } from "./telemetry-parser";
import { getCache, setCache } from "./cache";

export interface PickupPoint {
  x: number; // 0~100 (normalized)
  y: number; // 0~100 (normalized)
  category: string;
}

export interface HotZone {
  name: string;
  pickupCount: number;
  pct: number; // 전체 픽업 대비 %
}

export interface FarmingHeatmap {
  map: string;
  pickupPoints: PickupPoint[];
  hotZones: HotZone[];
  farmingStyle: "핫드랍형" | "외곽파밍형" | "중간지역형";
  avgPickupsPerGame: number;
  mostPickedItem: string;
  gamesAnalyzed: number;
}

// ─── 맵별 크기 (cm) ─────────────────────────────────────────────────

const MAP_SIZE: Record<string, number> = {
  Erangel: 816000,
  Miramar: 816000,
  Taego: 816000,
  Deston: 816000,
  Rondo: 816000,
  Sanhok: 408000,
  Vikendi: 600000,
};

// ─── 지역 좌표 테이블 ────────────────────────────────────────────────

interface ZoneRect { name: string; x1: number; y1: number; x2: number; y2: number; }

const ERANGEL_ZONES: ZoneRect[] = [
  { name: "Pochinki",       x1: 380000, y1: 420000, x2: 510000, y2: 540000 },
  { name: "Yasnaya",        x1: 555000, y1: 265000, x2: 695000, y2: 415000 },
  { name: "Rozok",          x1: 490000, y1: 435000, x2: 595000, y2: 545000 },
  { name: "Military Base",  x1: 475000, y1: 235000, x2: 625000, y2: 365000 },
  { name: "Georgopol",      x1: 195000, y1: 240000, x2: 350000, y2: 385000 },
  { name: "Novo Repnoye",   x1: 585000, y1: 510000, x2: 705000, y2: 635000 },
  { name: "Primorsk",       x1: 60000,  y1: 520000, x2: 200000, y2: 660000 },
  { name: "Lipovka",        x1: 660000, y1: 320000, x2: 770000, y2: 430000 },
  { name: "School",         x1: 555000, y1: 540000, x2: 650000, y2: 635000 },
  { name: "Stalber",        x1: 515000, y1: 95000,  x2: 625000, y2: 205000 },
  { name: "Severny",        x1: 585000, y1: 95000,  x2: 700000, y2: 210000 },
  { name: "Mylta Power",    x1: 655000, y1: 455000, x2: 765000, y2: 565000 },
  { name: "Gatka",          x1: 490000, y1: 545000, x2: 575000, y2: 630000 },
  { name: "Rozhok",         x1: 455000, y1: 370000, x2: 550000, y2: 460000 },
  { name: "Zharki",         x1: 80000,  y1: 100000, x2: 200000, y2: 220000 },
  { name: "Kameshki",       x1: 680000, y1: 90000,  x2: 790000, y2: 210000 },
  { name: "Shelter",        x1: 215000, y1: 520000, x2: 330000, y2: 630000 },
  { name: "Mylta",          x1: 635000, y1: 545000, x2: 745000, y2: 650000 },
  { name: "Ferry Pier",     x1: 300000, y1: 610000, x2: 395000, y2: 710000 },
  { name: "Ruins",          x1: 395000, y1: 570000, x2: 490000, y2: 670000 },
];

const MIRAMAR_ZONES: ZoneRect[] = [
  { name: "Los Leones",     x1: 385000, y1: 585000, x2: 555000, y2: 755000 },
  { name: "San Martin",     x1: 170000, y1: 325000, x2: 320000, y2: 465000 },
  { name: "Hacienda",       x1: 390000, y1: 440000, x2: 510000, y2: 560000 },
  { name: "El Pozo",        x1: 100000, y1: 95000,  x2: 220000, y2: 220000 },
  { name: "Chumacera",      x1: 590000, y1: 400000, x2: 710000, y2: 520000 },
  { name: "El Azahar",      x1: 320000, y1: 170000, x2: 440000, y2: 290000 },
  { name: "Monte Nuevo",    x1: 480000, y1: 290000, x2: 600000, y2: 410000 },
  { name: "La Catedral",    x1: 420000, y1: 180000, x2: 535000, y2: 300000 },
  { name: "Campo Militar",  x1: 185000, y1: 455000, x2: 310000, y2: 580000 },
  { name: "Valle del Mar",  x1: 55000,  y1: 385000, x2: 175000, y2: 505000 },
  { name: "Pecado",         x1: 290000, y1: 440000, x2: 410000, y2: 560000 },
  { name: "Prison",         x1: 655000, y1: 525000, x2: 765000, y2: 635000 },
  { name: "Water Treatment",x1: 305000, y1: 305000, x2: 415000, y2: 420000 },
  { name: "Impala",         x1: 450000, y1: 555000, x2: 565000, y2: 670000 },
  { name: "Alcantara",      x1: 600000, y1: 290000, x2: 715000, y2: 405000 },
];

const TAEGO_ZONES: ZoneRect[] = [
  { name: "Taego City",     x1: 280000, y1: 280000, x2: 500000, y2: 500000 },
  { name: "Hado Port",      x1: 560000, y1: 230000, x2: 700000, y2: 370000 },
  { name: "Naesosa",        x1: 190000, y1: 470000, x2: 330000, y2: 610000 },
  { name: "Jiri",           x1: 410000, y1: 150000, x2: 580000, y2: 300000 },
  { name: "Suanbo",         x1: 580000, y1: 510000, x2: 720000, y2: 650000 },
  { name: "Bukdo",          x1: 590000, y1: 130000, x2: 730000, y2: 260000 },
  { name: "Hosan",          x1: 130000, y1: 290000, x2: 280000, y2: 430000 },
  { name: "Doowon",         x1: 130000, y1: 130000, x2: 270000, y2: 270000 },
  { name: "Sanhok (Taego)", x1: 310000, y1: 490000, x2: 450000, y2: 630000 },
];

const SANHOK_ZONES: ZoneRect[] = [
  { name: "Bootcamp",       x1: 255000, y1: 155000, x2: 375000, y2: 275000 },
  { name: "Paradise Resort",x1: 155000, y1: 255000, x2: 275000, y2: 375000 },
  { name: "Ruins",          x1: 155000, y1: 155000, x2: 245000, y2: 265000 },
  { name: "Quarry",         x1: 80000,  y1: 240000, x2: 185000, y2: 365000 },
  { name: "Kampong",        x1: 205000, y1: 315000, x2: 315000, y2: 435000 },
  { name: "Pai Nan",        x1: 285000, y1: 255000, x2: 380000, y2: 355000 },
  { name: "Sahmee",         x1: 285000, y1: 60000,  x2: 390000, y2: 180000 },
  { name: "Ban Tai",        x1: 205000, y1: 80000,  x2: 320000, y2: 205000 },
  { name: "Ha Tinh",        x1: 60000,  y1: 155000, x2: 180000, y2: 265000 },
  { name: "Cave",           x1: 60000,  y1: 40000,  x2: 195000, y2: 165000 },
  { name: "Bhan",           x1: 295000, y1: 145000, x2: 375000, y2: 240000 },
  { name: "Docks",          x1: 315000, y1: 355000, x2: 410000, y2: 430000 },
];

const VIKENDI_ZONES: ZoneRect[] = [
  { name: "Dobro Mesto",    x1: 260000, y1: 240000, x2: 380000, y2: 360000 },
  { name: "Cosmodrome",     x1: 430000, y1: 120000, x2: 570000, y2: 260000 },
  { name: "Volnova",        x1: 110000, y1: 270000, x2: 250000, y2: 390000 },
  { name: "Goroka",         x1: 370000, y1: 350000, x2: 490000, y2: 460000 },
  { name: "Podvosta",       x1: 230000, y1: 360000, x2: 350000, y2: 470000 },
  { name: "Cement Factory", x1: 330000, y1: 450000, x2: 450000, y2: 560000 },
  { name: "Movatra",        x1: 450000, y1: 390000, x2: 570000, y2: 510000 },
  { name: "Winery",         x1: 480000, y1: 280000, x2: 590000, y2: 390000 },
  { name: "Milnar",         x1: 150000, y1: 390000, x2: 270000, y2: 490000 },
  { name: "Tovar",          x1: 90000,  y1: 160000, x2: 210000, y2: 280000 },
];

const DESTON_ZONES: ZoneRect[] = [
  { name: "Ripton",         x1: 320000, y1: 280000, x2: 460000, y2: 420000 },
  { name: "Observatory",    x1: 450000, y1: 130000, x2: 590000, y2: 270000 },
  { name: "Aldosterone",    x1: 170000, y1: 340000, x2: 310000, y2: 480000 },
  { name: "Cascade Peaks",  x1: 180000, y1: 180000, x2: 320000, y2: 320000 },
  { name: "Shipyard",       x1: 580000, y1: 380000, x2: 720000, y2: 520000 },
  { name: "Oja",            x1: 450000, y1: 420000, x2: 590000, y2: 560000 },
  { name: "Stillwater",     x1: 310000, y1: 430000, x2: 450000, y2: 570000 },
];

const RONDO_ZONES: ZoneRect[] = [
  { name: "Kinta",          x1: 310000, y1: 290000, x2: 460000, y2: 440000 },
  { name: "Sanshu",         x1: 190000, y1: 270000, x2: 320000, y2: 400000 },
  { name: "Yancheng",       x1: 450000, y1: 200000, x2: 600000, y2: 350000 },
  { name: "Old Quarter",    x1: 180000, y1: 390000, x2: 330000, y2: 520000 },
  { name: "Harbor",         x1: 560000, y1: 400000, x2: 700000, y2: 540000 },
  { name: "Dongkang",       x1: 330000, y1: 430000, x2: 470000, y2: 570000 },
  { name: "Xiuying",        x1: 160000, y1: 140000, x2: 300000, y2: 270000 },
];

function getZonesForMap(mapName: string): ZoneRect[] {
  if (mapName.includes("Miramar") || mapName.includes("Desert")) return MIRAMAR_ZONES;
  if (mapName.includes("Taego")   || mapName.includes("Tiger"))  return TAEGO_ZONES;
  if (mapName.includes("Sanhok")  || mapName.includes("Savage")) return SANHOK_ZONES;
  if (mapName.includes("Vikendi") || mapName.includes("DihorOtok")) return VIKENDI_ZONES;
  if (mapName.includes("Deston")  || mapName.includes("Kiki"))   return DESTON_ZONES;
  if (mapName.includes("Rondo")   || mapName.includes("Neon"))   return RONDO_ZONES;
  return ERANGEL_ZONES; // default (Erangel, Summerland 등)
}

function findZoneName(x: number, y: number, mapName: string): string | null {
  for (const z of getZonesForMap(mapName)) {
    if (x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2) return z.name;
  }
  return null;
}



function normalizeCoord(v: number, mapName: string): number {
  const size = MAP_SIZE[mapName] ?? 816000;
  return Math.max(0, Math.min(100, (v / size) * 100));
}

function itemIdToCategory(itemId: string): string {
  if (itemId.includes("Weapon")) return "무기";
  if (itemId.includes("Ammo")) return "탄약";
  if (itemId.includes("Armor") || itemId.includes("Head") || itemId.includes("Vest")) return "방어구";
  if (itemId.includes("Heal") || itemId.includes("Boost")) return "힐";
  if (itemId.includes("Scope") || itemId.includes("Attach") || itemId.includes("Mag") || itemId.includes("Stock")) return "부착물";
  return "기타";
}

function determineFarmingStyle(points: PickupPoint[]): FarmingHeatmap["farmingStyle"] {
  if (points.length === 0) return "중간지역형";
  // 분산도 측정: 표준편차 계산
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const mx = xs.reduce((s, v) => s + v, 0) / xs.length;
  const my = ys.reduce((s, v) => s + v, 0) / ys.length;
  const sdx = Math.sqrt(xs.reduce((s, v) => s + (v - mx) ** 2, 0) / xs.length);
  const sdy = Math.sqrt(ys.reduce((s, v) => s + (v - my) ** 2, 0) / ys.length);
  const spread = (sdx + sdy) / 2;

  if (spread < 8) return "핫드랍형";    // 좁은 지역 집중
  if (spread > 20) return "외곽파밍형"; // 넓게 이동
  return "중간지역형";
}

export async function analyzeFarmingHeatmap(
  accountId: string,
  platform: string,
  recentMatchIds: string[]
): Promise<FarmingHeatmap> {
  const cacheKey = `farming-heatmap:${platform}:${accountId}`;
  const cached = getCache<FarmingHeatmap>(cacheKey);
  if (cached) return cached;

  const allPoints: PickupPoint[] = [];
  const itemCountMap: Record<string, number> = {};
  const zoneCountMap: Record<string, number> = {};
  let dominantMap = "Erangel";
  const mapCounts: Record<string, number> = {};
  let gamesAnalyzed = 0;

  const matchLimit = Math.min(recentMatchIds.length, 5);

  const matchResults = await Promise.allSettled(
    recentMatchIds.slice(0, matchLimit).map(async (id) => {
      const md = await getMatch(id, platform);
      const url = getTelemetryUrl(md as Record<string, unknown>);
      if (!url) return null;
      const mapRaw = (md.data as { attributes?: { mapName?: string } })?.attributes?.mapName ?? "";
      const mapName = localizeMapName(mapRaw);
      const telemetry = await parseTelemetryForPlayer(url, accountId, id);
      return { telemetry, mapName };
    })
  );

  // 1. 먼저 각 매치의 맵 정보로 dominantMap 결정
  for (const r of matchResults) {
    if (r.status !== "fulfilled" || !r.value) continue;
    const { mapName } = r.value;
    mapCounts[mapName] = (mapCounts[mapName] ?? 0) + 1;
  }

  if (Object.keys(mapCounts).length > 0) {
    dominantMap = Object.entries(mapCounts).sort(([, a], [, b]) => b - a)[0][0];
  }

  // 2. dominantMap에 해당하는 매치만 데이터 집계
  for (const r of matchResults) {
    if (r.status !== "fulfilled" || !r.value) continue;
    const { telemetry, mapName } = r.value;
    if (mapName !== dominantMap) continue;

    gamesAnalyzed++;

    for (const ev of telemetry.pickupEvents) {
      const loc = ev.character?.location;
      if (!loc) continue;

      const nx = normalizeCoord(loc.x, dominantMap);
      const ny = normalizeCoord(loc.y, dominantMap);
      const cat = itemIdToCategory(ev.item.itemId);

      allPoints.push({ x: nx, y: ny, category: cat });

      // 아이템 카운트
      itemCountMap[cat] = (itemCountMap[cat] ?? 0) + 1;

      // 지역 카운트 — 알 수 없는 위치는 "Outskirts/Others"로 집계
      const zone = findZoneName(loc.x, loc.y, dominantMap) ?? "Outskirts/Others";
      zoneCountMap[zone] = (zoneCountMap[zone] ?? 0) + 1;
    }
  }

  // 핫존 계산 (상위 10개)
  const totalPickups = allPoints.length;
  const hotZones: HotZone[] = Object.entries(zoneCountMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      pickupCount: count,
      pct: Math.round((count / Math.max(totalPickups, 1)) * 100),
    }));

  // 가장 많이 주운 아이템 종류
  const mostPickedItem =
    Object.entries(itemCountMap).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "정보 없음";

  const farmingStyle = determineFarmingStyle(
    allPoints.filter((p) => p.category === "무기" || p.category === "탄약")
  );

  const result: FarmingHeatmap = {
    map: dominantMap,
    pickupPoints: allPoints.slice(0, 300), // 최대 300개 점만 전달
    hotZones,
    farmingStyle,
    avgPickupsPerGame: gamesAnalyzed > 0 ? Math.round(totalPickups / gamesAnalyzed) : 0,
    mostPickedItem,
    gamesAnalyzed,
  };

  // 분석 성공한 경우만 캐시 (gamesAnalyzed=0이면 캐시 안 함 → 다음 요청 때 재시도)
  if (gamesAnalyzed > 0) {
    setCache(cacheKey, result, 7200 * 1000); // 2h
  }
  return result;
}
