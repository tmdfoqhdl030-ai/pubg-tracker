// ── PUBG Telemetry Parser ─────────────────────────────────────────────
// 텔레메트리 파일(AWS S3)에서 필요한 이벤트만 필터링해 반환한다.
// 텔레메트리 URL은 PUBG API rate limit 외 CDN 요청이므로 무제한.

import { getCache, setCache } from "./cache";

// ─── Types ───────────────────────────────────────────────────────────

export interface TelemetryLocation {
  x: number;
  y: number;
  z: number;
}

export interface TelemetryCharacter {
  name: string;
  accountId: string;
  health?: number;
  location?: TelemetryLocation;
  ranking?: number;
  isInBlueZone?: boolean;
}

export interface TelemetryItem {
  itemId: string;
  stackCount?: number;
  category?: string;
  subCategory?: string;
  attachedItems?: string[];
}

export interface LogItemUseEvent {
  _T: "LogItemUse";
  _D: string;
  character: TelemetryCharacter;
  item: TelemetryItem;
}

export interface LogItemPickupEvent {
  _T: "LogItemPickup";
  _D: string;
  character: TelemetryCharacter;
  item: TelemetryItem;
}

export interface LogItemPickupFromCarepackageEvent {
  _T: "LogItemPickupFromCarepackage";
  _D: string;
  character: TelemetryCharacter;
  item: TelemetryItem;
}

export interface LogWeaponFireCountEvent {
  _T: "LogWeaponFireCount";
  _D: string;
  character: TelemetryCharacter;
  weaponId: string;
  fireCount: number; // 10발 단위
}

export interface LogPlayerKillV2Event {
  _T: "LogPlayerKillV2";
  _D: string;
  killer?: TelemetryCharacter;
  victim: TelemetryCharacter;
  distance?: number;
  damageCauserName?: string;
  damageTypeCategory?: string;
}

export interface ParsedTelemetry {
  healEvents: LogItemUseEvent[];
  pickupEvents: LogItemPickupEvent[];
  carepackageEvents: LogItemPickupFromCarepackageEvent[];
  fireCountEvents: LogWeaponFireCountEvent[];
  killEvents: LogPlayerKillV2Event[];
}

// ─── Telemetry URL Extractor ──────────────────────────────────────────

export function getTelemetryUrl(matchData: Record<string, unknown>): string | null {
  const included = matchData.included as Array<{
    type: string;
    attributes?: { URL?: string; name?: string };
  }> | undefined;
  if (!included) return null;
  const asset = included.find(
    (item) => item.type === "asset" && item.attributes?.name === "telemetry"
  );
  return asset?.attributes?.URL ?? null;
}

const REQUIRED_EVENTS = new Set([
  "LogItemUse",
  "LogItemPickup",
  "LogItemPickupFromCarepackage",
  "LogWeaponFireCount",
  "LogPlayerKillV2",
]);

const inFlightTelemetry = new Map<string, Promise<ParsedTelemetry>>();

export async function parseTelemetryForPlayer(
  telemetryUrl: string,
  accountId: string,
  matchId: string
): Promise<ParsedTelemetry> {
  const cacheKey = `telemetry:${matchId}:${accountId}`;
  const cached = getCache<ParsedTelemetry>(cacheKey);
  if (cached) return cached;

  let promise = inFlightTelemetry.get(cacheKey);
  if (!promise) {
    promise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      let events: Array<{ _T: string; [key: string]: unknown }>;
      try {
        const res = await fetch(telemetryUrl, {
          headers: { "Accept-Encoding": "gzip" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Telemetry HTTP ${res.status}`);
        events = await res.json();
      } finally {
        clearTimeout(timeout);
      }

      const healEvents: LogItemUseEvent[] = [];
      const pickupEvents: LogItemPickupEvent[] = [];
      const carepackageEvents: LogItemPickupFromCarepackageEvent[] = [];
      const fireCountEvents: LogWeaponFireCountEvent[] = [];
      const killEvents: LogPlayerKillV2Event[] = [];

      for (const e of events) {
        if (!REQUIRED_EVENTS.has(e._T)) continue;

        switch (e._T) {
          case "LogItemUse": {
            const ev = e as unknown as LogItemUseEvent;
            if (ev.character?.accountId === accountId) healEvents.push(ev);
            break;
          }
          case "LogItemPickup": {
            const ev = e as unknown as LogItemPickupEvent;
            if (ev.character?.accountId === accountId) pickupEvents.push(ev);
            break;
          }
          case "LogItemPickupFromCarepackage": {
            const ev = e as unknown as LogItemPickupFromCarepackageEvent;
            if (ev.character?.accountId === accountId) carepackageEvents.push(ev);
            break;
          }
          case "LogWeaponFireCount": {
            const ev = e as unknown as LogWeaponFireCountEvent;
            if (ev.character?.accountId === accountId) fireCountEvents.push(ev);
            break;
          }
          case "LogPlayerKillV2": {
            const ev = e as unknown as LogPlayerKillV2Event;
            if (
              ev.killer?.accountId === accountId ||
              ev.victim?.accountId === accountId
            )
              killEvents.push(ev);
            break;
          }
        }
      }

      const result: ParsedTelemetry = {
        healEvents, pickupEvents, carepackageEvents, fireCountEvents, killEvents,
      };
      // 텔레메트리는 불변 데이터 → 24시간 캐시
      setCache(cacheKey, result, 86400 * 1000);
      return result;
    })();

    inFlightTelemetry.set(cacheKey, promise);
    promise.finally(() => {
      inFlightTelemetry.delete(cacheKey);
    });
  }

  return promise;
}

// ─── Helper: Item ID → Category / Display Name ───────────────────────

export type HealCategory =
  | "bandage" | "firstAid" | "medKit"
  | "energyDrink" | "painkiller" | "adrenaline" | "other";

export function itemIdToHealCategory(itemId: string): HealCategory {
  if (itemId.includes("Bandage")) return "bandage";
  if (itemId.includes("FirstAid")) return "firstAid";
  if (itemId.includes("MedKit")) return "medKit";
  if (itemId.includes("EnergyDrink")) return "energyDrink";
  if (itemId.includes("Painkiller")) return "painkiller";
  if (itemId.includes("AdrenalineSyringe") || itemId.includes("Adrenaline"))
    return "adrenaline";
  return "other";
}

const WEAPON_NAMES: Record<string, string> = {
  Item_Weapon_M416_C: "M416",
  Item_Weapon_AWM_C: "AWM",
  Item_Weapon_AKM_C: "AKM",
  "Item_Weapon_SCAR-L_C": "SCAR-L",
  Item_Weapon_SCAR_L_C: "SCAR-L",
  Item_Weapon_UMP45_C: "UMP45",
  Item_Weapon_Vector_C: "벡터",
  Item_Weapon_M24_C: "M24",
  Item_Weapon_Kar98k_C: "Kar98k",
  Item_Weapon_SKS_C: "SKS",
  Item_Weapon_Mini14_C: "미니14",
  Item_Weapon_QBZ95_C: "QBZ",
  Item_Weapon_Beryl_C: "베릴 M762",
  Item_Weapon_DP28_C: "DP-28",
  Item_Weapon_MK14_C: "Mk14",
  Item_Weapon_MK47Mutant_C: "뮤턴트 (Mk47)",
  Item_Weapon_G36C_C: "G36C",
  Item_Weapon_MP5K_C: "MP5K",
  Item_Weapon_PP19_C: "비존",
  Item_Weapon_Tommy_C: "토미 건",
  Item_Weapon_P90_C: "P90",
  Item_Weapon_Groza_C: "그로자",
  Item_Weapon_M249_C: "M249",
  Item_Weapon_Mosin_C: "모신나강",
  Item_Weapon_MG3_C: "MG3",
  Item_Weapon_Lynx_C: "링크스 AMR",
  Item_Weapon_Pan_C: "프라이팬",
  Item_Weapon_SLR_C: "SLR",
  Item_Weapon_Win94_C: "Win94",
  Item_Weapon_VSS_C: "VSS",
  Item_Weapon_Crossbow_C: "석궁",
  Item_Weapon_S686_C: "S686",
  Item_Weapon_S1897_C: "S1897",
  Item_Weapon_S12K_C: "S12K",
  Item_Weapon_DBS_C: "DBS",
  Item_Weapon_HK416_C: "M416",
  Item_Weapon_K2_C: "K2",
  Item_Weapon_ACE32_C: "ACE32",
  Item_Weapon_MP9_C: "MP9",
};

export function weaponIdToName(weaponId: string): string {
  let cleanId = weaponId.trim();
  // Strip prefixes
  cleanId = cleanId.replace(/^Item_Weapon_/, "");
  cleanId = cleanId.replace(/^Weap/, "");
  // Strip suffixes
  cleanId = cleanId.replace(/_C$/, "");
  cleanId = cleanId.replace(/_HR$/, ""); // Thompson_HR -> Thompson, M1911_HR -> M1911

  const WEAPON_MAP: Record<string, string> = {
    M416: "M416",
    AWM: "AWM",
    AKM: "AKM",
    "SCAR-L": "SCAR-L",
    SCAR_L: "SCAR-L",
    UMP45: "UMP45",
    Vector: "벡터",
    M24: "M24",
    Kar98k: "Kar98k",
    SKS: "SKS",
    Mini14: "미니14",
    QBZ95: "QBZ",
    QBZ: "QBZ",
    BerylM762: "베릴 M762",
    Beryl: "베릴 M762",
    DP28: "DP-28",
    MK14: "Mk14",
    Mk14: "Mk14",
    MK47Mutant: "뮤턴트 (Mk47)",
    Mk47: "뮤턴트 (Mk47)",
    G36C: "G36C",
    MP5K: "MP5K",
    PP19: "비존",
    Tommy: "토미 건",
    TommyGun: "토미 건",
    Thompson: "토미 건",
    P90: "P90",
    Groza: "그로자",
    M249: "M249",
    Mosin: "모신나강",
    MG3: "MG3",
    Lynx: "링크스 AMR",
    LynxAMR: "링크스 AMR",
    Pan: "프라이팬",
    SLR: "SLR",
    Win94: "Win94",
    VSS: "VSS",
    Crossbow: "석궁",
    S686: "S686",
    S1897: "S1897",
    S12K: "S12K",
    DBS: "DBS",
    HK416: "M416",
    K2: "K2",
    ACE32: "ACE32",
    MP9: "MP9",
    M16A4: "M16A4",
    Mk12: "Mk12",
    QBU: "QBU",
    O12: "O12",
    P1911: "P1911",
    M1911: "P1911",
    P92: "P92",
    P18C: "P18C",
    R1895: "R1895",
    R45: "R45",
    DesertEagle: "디글",
    Deagle: "디글",
    Sawnoff: "소드오프",
    M79: "M79 (연막탄 발사기)",
    StunGun: "스턴건",
    Famas: "파마스",
    FAMAS: "파마스",
    AUG: "AUG",
    Dragunov: "드라구노프"
  };

  if (WEAPON_MAP[cleanId]) return WEAPON_MAP[cleanId];
  return cleanId;
}

export function itemIdToDisplayName(itemId: string): string {
  let cleanId = itemId.trim();

  const ITEM_MAP: Record<string, string> = {
    // Gear / Wearables
    G_01_Lv3: "3레벨 헬멧",
    C_01_Lv3: "3레벨 조끼",
    Item_Head_G_01_Lv3_C: "3레벨 헬멧",
    Item_Armor_C_01_Lv3_C: "3레벨 조끼",
    Item_Back_C_01_Lv3_C: "3레벨 배낭",
    Item_Back_BlueBlocker_Lv3: "방해 전파 배낭",
    
    Item_Head_F_02_Lv2_C: "2레벨 헬멧",
    Item_Armor_D_02_Lv2_C: "2레벨 조끼",
    Item_Back_B_02_Lv2_C: "2레벨 배낭",
    
    Item_Head_E_01_Lv1_C: "1레벨 헬멧",
    Item_Armor_E_01_Lv1_C: "1레벨 조끼",
    Item_Back_A_01_Lv1_C: "1레벨 배낭",

    // Heals & Boosts
    Item_Heal_Bandage_C: "붕대",
    Item_Heal_FirstAid_C: "구급상자",
    Item_Heal_MedKit_C: "의료용 키트",
    Item_Boost_EnergyDrink_C: "에너지 음료",
    Item_Boost_Painkiller_C: "진통제",
    Item_Boost_AdrenalineSyringe_C: "아드레날린 주사기",

    // Ghillies
    Item_Ghillie_C: "길리 슈트",
    Item_Ghillie_01_C: "길리 슈트",
    Item_Ghillie_02_C: "길리 슈트",
    Item_Ghillie_03_C: "길리 슈트",
    Item_Ghillie_04_C: "길리 슈트",
    Item_Ghillie_05_C: "길리 슈트",
    Item_Ghillie_06_C: "길리 슈트",
    Item_Armor_Ghillie_C: "길리 슈트",

    // Special items
    Item_Weapon_AWM_C: "AWM",
    Item_Weapon_Groza_C: "그로자",
    Item_Weapon_MK14_C: "Mk14",
    Item_Weapon_MG3_C: "MG3",
    Item_Weapon_P90_C: "P90",
    Item_Weapon_Famas_C: "파마스",
    Item_Weapon_AUG_C: "AUG",
    Item_Ammo_300Magnum_C: ".300 매그넘 탄약",
    Item_Ammo_570mm_C: "5.7mm 탄약",

    // Attachments
    Item_Attach_Weapon_Muzzle_Suppressor_Large_C: "소음기 (AR/DMR)",
    Item_Attach_Weapon_Muzzle_Suppressor_Medium_C: "소음기 (SMG)",
    Item_Attach_Weapon_Muzzle_Suppressor_SniperRifle_C: "소음기 (SR)",
    Item_Attach_Weapon_Magazine_ExtendedQuickDraw_Large_C: "대용량 퀵드로우 탄창 (AR/DMR)",
    Item_Attach_Weapon_Magazine_ExtendedQuickDraw_SniperRifle_C: "대용량 퀵드로우 탄창 (SR)",
    Item_Attach_Weapon_Stock_AR_Composite_C: "전술 개머리판",
    Item_Attach_Weapon_Stock_SniperRifle_CheekPad_C: "칙패드 (SR/DMR)",
    Item_Attach_Weapon_Upper_Scope15x_C: "15배율 스코프",
    Item_Attach_Weapon_Upper_Scope8x_C: "8배율 스코프",
    Item_Attach_Weapon_Upper_Scope6x_C: "6배율 스코프",
    Item_Attach_Weapon_Upper_Scope4x_C: "4배율 스코프",
    Item_Attach_Weapon_Upper_Scope3x_C: "3배율 스코프",
    Item_Attach_Weapon_Upper_Holosight_C: "홀로그램 조준경",
    Item_Attach_Weapon_Upper_DotSight_C: "레드 닷 사이트",
  };

  if (ITEM_MAP[cleanId]) return ITEM_MAP[cleanId];

  // Try mapping via weapons map
  const weaponName = weaponIdToName(cleanId);
  if (weaponName !== cleanId) return weaponName;

  // Fuzzy regex mapping as fallback
  if (cleanId.includes("Lv3") || cleanId.includes("Level3")) {
    if (cleanId.includes("Head") || cleanId.includes("Helmet") || cleanId.startsWith("G_")) return "3레벨 헬멧";
    if (cleanId.includes("Armor") || cleanId.includes("Vest") || cleanId.startsWith("C_")) return "3레벨 조끼";
    if (cleanId.includes("Back") || cleanId.includes("Backpack")) return "3레벨 배낭";
  }
  if (cleanId.includes("Lv2") || cleanId.includes("Level2")) {
    if (cleanId.includes("Head") || cleanId.includes("Helmet")) return "2레벨 헬멧";
    if (cleanId.includes("Armor") || cleanId.includes("Vest")) return "2레벨 조끼";
    if (cleanId.includes("Back") || cleanId.includes("Backpack")) return "2레벨 배낭";
  }
  if (cleanId.includes("Lv1") || cleanId.includes("Level1")) {
    if (cleanId.includes("Head") || cleanId.includes("Helmet")) return "1레벨 헬멧";
    if (cleanId.includes("Armor") || cleanId.includes("Vest")) return "1레벨 조끼";
    if (cleanId.includes("Back") || cleanId.includes("Backpack")) return "1레벨 배낭";
  }
  if (cleanId.includes("Ghillie")) return "길리 슈트";
  if (cleanId.includes("Suppressor") || cleanId.includes("Silencer")) return "소음기";
  if (cleanId.includes("ExtendedQuickDraw") || cleanId.includes("ExQD")) return "대용량 퀵드로우 탄창";
  if (cleanId.includes("Extended") && !cleanId.includes("QuickDraw")) return "대용량 탄창";
  if (cleanId.includes("QuickDraw") && !cleanId.includes("Extended")) return "퀵드로우 탄창";
  if (cleanId.includes("Scope8x")) return "8배율 스코프";
  if (cleanId.includes("Scope6x")) return "6배율 스코프";
  if (cleanId.includes("Scope4x")) return "4배율 스코프";
  if (cleanId.includes("Scope15x")) return "15배율 스코프";

  // General clean up fallback
  const m =
    cleanId.match(/Item_Weapon_(.+?)_C$/) ??
    cleanId.match(/Item_(?:Heal|Boost|Armor|Head|Ammo|Attach|Back)_(.+?)_C$/);
  return m ? m[1] : cleanId;
}

