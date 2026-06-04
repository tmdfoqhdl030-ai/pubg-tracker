import Image from "next/image";

export interface TierConfig { letter: string; label: string; color: string; }

export const TIER_COLORS: Record<string, string> = {
  Bronze:    "#CD7F32",
  Silver:    "#9CA3AF",
  Gold:      "#D97706",
  Platinum:  "#0891B2",
  Diamond:   "#7C3AED",
  Master:    "#EA580C",
  Conqueror: "#DC2626",
};

export const TIER_KO: Record<string, string> = {
  Bronze:"브론즈", Silver:"실버", Gold:"골드",
  Platinum:"플래티넘", Diamond:"다이아", Master:"마스터", Conqueror:"컨커러",
};

export function getTierFromString(tier: string): TierConfig {
  const norm = tier.trim().charAt(0).toUpperCase() + tier.trim().slice(1).toLowerCase();
  return { letter: tier[0] ?? "?", label: TIER_KO[norm] ?? tier, color: TIER_COLORS[norm] ?? "#9CA3AF" };
}

export function getTier(kda: number): TierConfig {
  if (kda >= 8)   return { letter:"C", label:"컨커러",   color: TIER_COLORS.Conqueror };
  if (kda >= 6)   return { letter:"M", label:"마스터",   color: TIER_COLORS.Master };
  if (kda >= 4)   return { letter:"D", label:"다이아",   color: TIER_COLORS.Diamond };
  if (kda >= 2.5) return { letter:"P", label:"플래티넘", color: TIER_COLORS.Platinum };
  if (kda >= 1.5) return { letter:"G", label:"골드",     color: TIER_COLORS.Gold };
  if (kda >= 1.0) return { letter:"S", label:"실버",     color: TIER_COLORS.Silver };
  return           { letter:"B", label:"브론즈",          color: TIER_COLORS.Bronze };
}

const SUBTIER_ROMAN: Record<string, string> = {
  "I":"I","II":"II","III":"III","IV":"IV","V":"V",
  "1":"I","2":"II","3":"III","4":"IV","5":"V",
};

export function getTierImage(tier: string, subTier: string = ""): string {
  const norm = tier.trim().toLowerCase();

  // Ranks with subtiers (Bronze, Silver, Gold, Platinum, Diamond)
  if (["bronze", "silver", "gold", "platinum", "diamond"].includes(norm)) {
    let levelNum = "5"; // Default to lowest division
    const normSub = subTier.trim().toUpperCase();
    if (normSub === "I" || normSub === "1") levelNum = "1";
    else if (normSub === "II" || normSub === "2") levelNum = "2";
    else if (normSub === "III" || normSub === "3") levelNum = "3";
    else if (normSub === "IV" || normSub === "4") levelNum = "4";
    else if (normSub === "V" || normSub === "5") levelNum = "5";

    return `/tiers/${norm}${levelNum}.png`;
  }

  // Single division ranks
  if (norm === "master") {
    return "/tiers/master.png";
  }
  if (norm === "conqueror" || norm === "survivor") {
    return "/tiers/conqueror.png";
  }

  return "/tiers/unranked.png";
}

export function PUBGTierEmblem({
  tier, subTier = "", size = 72,
}: { tier: string; subTier?: string; size?: number }) {
  const norm = tier.trim().charAt(0).toUpperCase() + tier.trim().slice(1).toLowerCase();
  const c     = TIER_COLORS[norm] ?? "#9CA3AF";
  const label = TIER_KO[norm] ?? tier;
  const roman = ["Master", "Conqueror", "Survivor"].includes(norm) ? "" : (SUBTIER_ROMAN[subTier] ?? subTier);
  const src   = getTierImage(tier, subTier);

  return (
    <div className="flex flex-col items-center gap-0.5 select-none animate-fadeIn">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <Image
          src={src}
          alt={`${label} 티어`}
          width={size}
          height={size}
          className="object-contain hover:scale-105 transition-transform duration-200"
          priority
          unoptimized
        />
        {roman && (
          <span
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full text-white font-black"
            style={{
              width: Math.max(16, size * 0.28),
              height: Math.max(16, size * 0.28),
              fontSize: Math.max(8, size * 0.14),
              backgroundColor: "rgba(0,0,0,0.75)",
              border: `1.5px solid ${c}`,
              lineHeight: 1,
            }}
          >
            {roman}
          </span>
        )}
      </div>
      <div className="text-center leading-none">
        <span className="text-[10px] font-black tracking-wider" style={{ color: c }}>
          {label} {roman && `${roman}`}
        </span>
      </div>
    </div>
  );
}

interface Props { kda: number; size?: number; }
export default function TierBadge({ kda, size = 80 }: Props) {
  const t = getTier(kda);
  const tierKey = Object.entries(TIER_COLORS).find(([,v])=>v===t.color)?.[0] ?? "Bronze";
  return <PUBGTierEmblem tier={tierKey} size={size} />;
}

