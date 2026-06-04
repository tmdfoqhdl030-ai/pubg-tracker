// ── PUBG 플레이 유형 분류 시스템 (20가지) ──────────────────────────────
// KDA / 딜량 / 승률 / 헤드샷율 / 탑10율 / 게임 수 기반 분류

export type PlayStyleKey =
  | "eagle"       // 독수리 🦅
  | "reaper"      // 저승사자 💀
  | "destroyer"   // 파괴신 💥
  | "commander"   // 야전사령관 🎖️
  | "spy"         // 쁘락치 🕵️
  | "chicken"     // 치킨마스터 🐔
  | "sniper"      // 저격수 🎯
  | "breaker"     // 브레이커 🔨
  | "shadow"      // 그림자 👤
  | "charger"     // 돌격대장 ⚔️
  | "maniac"      // 전쟁광 😤
  | "faker"       // 가짜공격수 🎭
  | "ghost"       // 유령병사 👻
  | "minefield"   // 지뢰밭 💣
  | "joker"       // 조커 🃏
  | "driver"      // 버스기사 🚌
  | "turtle"      // 거북이 🐢
  | "assault"     // 공격대장 🔥
  | "allrounder"  // 올라운더 ⚡
  | "survivor"    // 생존왕 🛡️
  | "rookie";     // 입문자 🌱 (fallback)

export interface PlayStyleDef {
  key: PlayStyleKey;
  emoji: string;
  name: string;
  subtitle: string;
  gradient: string;
  gradientFrom: string;  // canvas용 시작색
  gradientTo: string;    // canvas용 끝색
  color: string;         // 포인트 색상
  bgColor: string;       // 카드 배경
  summary: string;
  improvements: string[];
}

export const PLAY_STYLES: Record<PlayStyleKey, PlayStyleDef> = {
  eagle: {
    key: "eagle",
    emoji: "🦅",
    name: "독수리",
    subtitle: "헤드샷 정밀 사수",
    gradient: "linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #7C3AED 100%)",
    gradientFrom: "#2E1065",
    gradientTo: "#7C3AED",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    summary: "헤드샷 비율과 KDA가 모두 높은 정밀 사수 타입입니다. 당신과 교전한 적은 어디서 맞았는지도 모릅니다.",
    improvements: [
      "헤드샷 기회를 위해 부시 저격 포지션을 적극 활용하세요",
      "교전 전 배율을 미리 맞춰 반응 속도를 높이세요",
      "생존율을 높이면 더 많은 교전 기회를 만들 수 있습니다",
    ],
  },
  reaper: {
    key: "reaper",
    emoji: "💀",
    name: "저승사자",
    subtitle: "KDA 탑 1% 살인마",
    gradient: "linear-gradient(135deg, #18181B 0%, #27272A 50%, #52525B 100%)",
    gradientFrom: "#18181B",
    gradientTo: "#EF4444",
    color: "#EF4444",
    bgColor: "#FFF1F2",
    summary: "이름만 들어도 적이 도망가는 수준의 KDA를 기록 중입니다. 당신과 마주치면 게임이 끝납니다.",
    improvements: [
      "팀 협력으로 단독 교전 승률을 더욱 높여보세요",
      "탑10 진입 후 안정적 파밍으로 우승 확률을 높이세요",
      "적 위치 파악 후 선제 교전으로 이점을 극대화하세요",
    ],
  },
  destroyer: {
    key: "destroyer",
    emoji: "💥",
    name: "파괴신",
    subtitle: "딜량+KDA 완벽 조합",
    gradient: "linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #F97316 100%)",
    gradientFrom: "#7F1D1D",
    gradientTo: "#F97316",
    color: "#DC2626",
    bgColor: "#FFF7ED",
    summary: "높은 딜량과 KDA를 동시에 갖춘 전장의 파괴자입니다. 한 경기당 손해보는 법이 없습니다.",
    improvements: [
      "높은 딜량을 유지하면서 탑10 진입 의식도 챙기세요",
      "팀원의 딜 서포트를 통해 우승률을 높여보세요",
      "후반 자기장 포지셔닝에 더 집중해보세요",
    ],
  },
  commander: {
    key: "commander",
    emoji: "🎖️",
    name: "야전사령관",
    subtitle: "모든 지표 상위권 완벽 플레이어",
    gradient: "linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #0EA5E9 100%)",
    gradientFrom: "#0C4A6E",
    gradientTo: "#0EA5E9",
    color: "#0369A1",
    bgColor: "#F0F9FF",
    summary: "KDA, 딜량, 승률, 탑10 모든 지표가 균형있게 높습니다. 전장의 완벽한 지휘관이자 팀의 중심입니다.",
    improvements: [
      "팀을 이끄는 콜을 더 적극적으로 해보세요",
      "이미 높은 지표를 유지하며 컨시스턴시에 집중하세요",
      "후반 자기장 이동 판단력을 더욱 키워보세요",
    ],
  },
  spy: {
    key: "spy",
    emoji: "🕵️",
    name: "쁘락치",
    subtitle: "KDA는 높은데 우승이 없다",
    gradient: "linear-gradient(135deg, #1C1917 0%, #44403C 50%, #78716C 100%)",
    gradientFrom: "#1C1917",
    gradientTo: "#78716C",
    color: "#78716C",
    bgColor: "#FAFAF9",
    summary: "KDA는 엄청 좋은데 왜 우승이 없죠? 혼자만 살아남으려는 건 아닌지 팀원이 의심하고 있습니다.",
    improvements: [
      "교전 후 팀원을 챙기고 함께 생존하는 전략을 써보세요",
      "혼자 교전보다 팀 배치를 먼저 고려해보세요",
      "탑10에서 팀원과 함께 포지션을 잡는 연습을 하세요",
    ],
  },
  chicken: {
    key: "chicken",
    emoji: "🐔",
    name: "치킨마스터",
    subtitle: "싸우지 않고 먹는다",
    gradient: "linear-gradient(135deg, #713F12 0%, #D97706 50%, #FCD34D 100%)",
    gradientFrom: "#713F12",
    gradientTo: "#FCD34D",
    color: "#D97706",
    bgColor: "#FFFBEB",
    summary: "딜량은 적지만 우승률이 높습니다. 싸우지 않고 살아남아 치킨을 먹는 진정한 생존 고수입니다.",
    improvements: [
      "가끔은 교전에도 참여해 딜량을 올려보세요",
      "유리한 상황에서 선제 교전을 늘려보세요",
      "더 적극적인 파밍으로 장비 우위를 점해보세요",
    ],
  },
  sniper: {
    key: "sniper",
    emoji: "🎯",
    name: "저격수",
    subtitle: "멀리서 조용히 처리한다",
    gradient: "linear-gradient(135deg, #134E4A 0%, #0F766E 50%, #14B8A6 100%)",
    gradientFrom: "#134E4A",
    gradientTo: "#14B8A6",
    color: "#0F766E",
    bgColor: "#F0FDFA",
    summary: "헤드샷율이 높고 딜량도 안정적입니다. 상대방은 어디서 죽는지도 모릅니다. 조용한 암살자 유형입니다.",
    improvements: [
      "근접 교전 대비 보조 무기를 항상 챙기세요",
      "저격 포지션 후 빠른 위치 이동으로 생존율을 높이세요",
      "팀원과 거리를 유지하되 커버 사격을 놓치지 마세요",
    ],
  },
  breaker: {
    key: "breaker",
    emoji: "🔨",
    name: "브레이커",
    subtitle: "딜은 넣는데 자꾸 죽는다",
    gradient: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #818CF8 100%)",
    gradientFrom: "#1E1B4B",
    gradientTo: "#818CF8",
    color: "#4338CA",
    bgColor: "#EEF2FF",
    summary: "딜량은 엄청나게 넣는데 KDA가 낮습니다. 교전은 잘 하지만 마무리가 아쉬운 열정파 플레이어입니다.",
    improvements: [
      "딜을 넣고 나서 바로 엄폐물로 이동하는 습관을 기르세요",
      "교전 시작 전 체력/장비 상태를 먼저 확인하세요",
      "무리한 단독 교전을 줄이고 팀 지원을 받으세요",
    ],
  },
  shadow: {
    key: "shadow",
    emoji: "👤",
    name: "그림자",
    subtitle: "막타만 치는 하이에나",
    gradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #475569 100%)",
    gradientFrom: "#0F172A",
    gradientTo: "#475569",
    color: "#64748B",
    bgColor: "#F8FAFC",
    summary: "KDA는 높은데 딜량이 낮습니다. 팀원이 딜을 다 넣으면 마지막에 막타를 치는 하이에나 스타일입니다.",
    improvements: [
      "교전 초반부터 적극적으로 딜을 넣어보세요",
      "팀원을 따라다니며 막타 치는 습관을 개선해보세요",
      "단독 교전 능력을 키워 실질적인 기여도를 높이세요",
    ],
  },
  charger: {
    key: "charger",
    emoji: "⚔️",
    name: "돌격대장",
    subtitle: "앞만 보고 달린다",
    gradient: "linear-gradient(135deg, #7F1D1D 0%, #B91C1C 50%, #EF4444 100%)",
    gradientFrom: "#7F1D1D",
    gradientTo: "#EF4444",
    color: "#B91C1C",
    bgColor: "#FFF1F2",
    summary: "KDA는 높지만 탑10 진입율이 낮습니다. 교전은 잘 하지만 앞만 보고 달리는 진정한 돌격대장입니다.",
    improvements: [
      "무조건 돌진보다 자기장 위치를 먼저 파악하세요",
      "탑10 진입 후 교전을 시작하는 습관을 기르세요",
      "팀원의 생존을 함께 챙기는 플레이를 늘려보세요",
    ],
  },
  maniac: {
    key: "maniac",
    emoji: "😤",
    name: "전쟁광",
    subtitle: "싸움만 하다 끝난다",
    gradient: "linear-gradient(135deg, #431407 0%, #9A3412 50%, #EA580C 100%)",
    gradientFrom: "#431407",
    gradientTo: "#EA580C",
    color: "#EA580C",
    bgColor: "#FFF7ED",
    summary: "딜량은 많이 넣지만 우승이 거의 없습니다. 교전을 너무 좋아해서 항상 게임이 일찍 끝납니다.",
    improvements: [
      "불필요한 교전을 자제하고 생존을 우선시하세요",
      "자기장 이동 타이밍을 미리 계획하세요",
      "탑10 이후 교전으로 집중도를 높이세요",
    ],
  },
  faker: {
    key: "faker",
    emoji: "🎭",
    name: "가짜공격수",
    subtitle: "존버하면서 공격형인 척",
    gradient: "linear-gradient(135deg, #4A044E 0%, #86198F 50%, #D946EF 100%)",
    gradientFrom: "#4A044E",
    gradientTo: "#D946EF",
    color: "#86198F",
    bgColor: "#FDF4FF",
    summary: "탑10 진입율은 높지만 딜량과 KDA가 낮습니다. 실제로는 숨어 있으면서 공격형인 척하는 연기파 플레이어입니다.",
    improvements: [
      "탑10 생존 기술을 교전 기술로도 이어가보세요",
      "유리한 위치 선점 후 적극적으로 교전해보세요",
      "장비를 충분히 파밍한 후 교전에 참여하세요",
    ],
  },
  ghost: {
    key: "ghost",
    emoji: "👻",
    name: "유령병사",
    subtitle: "어떻게 우승하는지 아무도 모름",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
    gradientFrom: "#0C4A6E",
    gradientTo: "#6366F1",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    summary: "탑10 진입율이 낮은데 우승율이 높습니다. 도대체 어떻게 우승하는지 분석이 안 되는 미스터리 유형입니다.",
    improvements: [
      "지금의 비결이 뭔지 본인도 파악해보세요",
      "더 일관성 있는 플레이를 위해 루틴을 만들어보세요",
      "탑10 진입율을 높이면 우승율이 더 오를 수 있습니다",
    ],
  },
  minefield: {
    key: "minefield",
    emoji: "💣",
    name: "지뢰밭",
    subtitle: "무조건 탄약 뿌린다",
    gradient: "linear-gradient(135deg, #292524 0%, #57534E 50%, #A8A29E 100%)",
    gradientFrom: "#292524",
    gradientTo: "#A8A29E",
    color: "#78716C",
    bgColor: "#FAFAF9",
    summary: "딜량은 높지만 헤드샷율이 낮습니다. 정확도보다는 탄약 소모로 싸우는 스프레이 마스터입니다.",
    improvements: [
      "조준 연습으로 헤드샷율을 높이면 딜 효율이 올라갑니다",
      "근거리 교전 시 버스트 사격보다 단발 제어를 연습해보세요",
      "탄약 관리를 신경써 후반 교전 준비를 하세요",
    ],
  },
  joker: {
    key: "joker",
    emoji: "🃏",
    name: "조커",
    subtitle: "뭔가 열심히는 하는데",
    gradient: "linear-gradient(135deg, #1C1917 0%, #3F3F46 50%, #71717A 100%)",
    gradientFrom: "#1C1917",
    gradientTo: "#71717A",
    color: "#71717A",
    bgColor: "#FAFAFA",
    summary: "딜은 넣는데 KDA도 낮고 우승도 없습니다. 열심히 하는 것 같은데 결과가 따라주지 않는 아이러니한 타입입니다.",
    improvements: [
      "딜을 넣고 나서 생존하는 방법을 연습해보세요",
      "교전 후 안전한 위치로 이동하는 습관을 기르세요",
      "팀원과 함께 싸우는 비율을 늘려보세요",
    ],
  },
  driver: {
    key: "driver",
    emoji: "🚌",
    name: "버스기사",
    subtitle: "경험은 많은데 실력이...",
    gradient: "linear-gradient(135deg, #065F46 0%, #059669 50%, #34D399 100%)",
    gradientFrom: "#065F46",
    gradientTo: "#34D399",
    color: "#059669",
    bgColor: "#ECFDF5",
    summary: "게임 경험은 많은데 KDA와 우승율이 낮습니다. 버스를 태워주듯 다른 사람에게 경험치를 나눠주고 있습니다.",
    improvements: [
      "많은 경험을 바탕으로 기본 전술을 다시 점검해보세요",
      "게임 수보다 질에 집중해 각 교전을 분석해보세요",
      "커뮤니티에서 프로 플레이 영상을 보고 전략을 배워보세요",
    ],
  },
  turtle: {
    key: "turtle",
    emoji: "🐢",
    name: "거북이",
    subtitle: "살아있지만 아무것도 안 한다",
    gradient: "linear-gradient(135deg, #166534 0%, #15803D 50%, #22C55E 100%)",
    gradientFrom: "#166534",
    gradientTo: "#22C55E",
    color: "#15803D",
    bgColor: "#F0FDF4",
    summary: "탑10 진입은 잘 하는데 딜량이 극히 낮습니다. 살아는 있는데 아무것도 안 하는 대형 거북이 유형입니다.",
    improvements: [
      "탑10에서 유리한 위치를 잡았을 때 적극적으로 교전해보세요",
      "파밍 시간을 줄이고 교전 참여 비율을 높여보세요",
      "팀원이 교전할 때 지원 사격을 놓치지 마세요",
    ],
  },
  assault: {
    key: "assault",
    emoji: "🔥",
    name: "공격대장",
    subtitle: "강한 공격형 전사",
    gradient: "linear-gradient(135deg, #7C2D12 0%, #C2410C 50%, #F97316 100%)",
    gradientFrom: "#7C2D12",
    gradientTo: "#F97316",
    color: "#C2410C",
    bgColor: "#FFF7ED",
    summary: "KDA와 딜량이 모두 높은 강한 공격형 플레이어입니다. 교전에서 항상 주도권을 잡고 싸웁니다.",
    improvements: [
      "생존 의식을 더하면 우승률을 높일 수 있습니다",
      "팀원과의 협력 교전으로 교전 성공률을 극대화하세요",
      "유리한 포지션 선점 후 교전을 시작하는 습관을 기르세요",
    ],
  },
  allrounder: {
    key: "allrounder",
    emoji: "⚡",
    name: "올라운더",
    subtitle: "밸런스형 만능 플레이어",
    gradient: "linear-gradient(135deg, #1E3A5F 0%, #1D4ED8 50%, #60A5FA 100%)",
    gradientFrom: "#1E3A5F",
    gradientTo: "#60A5FA",
    color: "#1D4ED8",
    bgColor: "#EFF6FF",
    summary: "KDA, 딜량, 승률, 탑10 모든 지표가 균형 잡혀 있습니다. 어떤 상황에서도 안정적인 플레이를 합니다.",
    improvements: [
      "모든 지표가 좋은 만큼 한 분야를 더 특화해보세요",
      "팀원의 플레이 스타일에 맞게 유연하게 역할을 바꿔보세요",
      "다음 목표 티어에 맞는 전략을 연구해보세요",
    ],
  },
  survivor: {
    key: "survivor",
    emoji: "🛡️",
    name: "생존왕",
    subtitle: "살아남는 것이 최선이다",
    gradient: "linear-gradient(135deg, #14532D 0%, #16A34A 50%, #4ADE80 100%)",
    gradientFrom: "#14532D",
    gradientTo: "#4ADE80",
    color: "#16A34A",
    bgColor: "#F0FDF4",
    summary: "탑10 진입율이 높아 안정적으로 살아남는 플레이어입니다. 끝까지 살아남는 것 자체가 전략입니다.",
    improvements: [
      "생존 기술을 교전 기술로도 이어가보세요",
      "유리한 위치에서 교전을 늘려 딜량을 높여보세요",
      "파이널 서클에서의 교전 능력을 강화하세요",
    ],
  },
  rookie: {
    key: "rookie",
    emoji: "🌱",
    name: "입문자",
    subtitle: "이제 막 시작한 배틀로얄러",
    gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #93C5FD 100%)",
    gradientFrom: "#1E40AF",
    gradientTo: "#93C5FD",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    summary: "아직 성장 중인 플레이어입니다. 매 경기 하나씩 배워가다 보면 금방 실력이 올라갈 것입니다!",
    improvements: [
      "기본 이동과 엄폐 기술을 먼저 익히세요",
      "무기마다 반동 패턴이 다르니 사격장에서 연습해보세요",
      "자기장 이동 타이밍을 항상 먼저 확인하는 습관을 기르세요",
    ],
  },
};

// ── 플레이 유형 분류 함수 ────────────────────────────────────────────────
// 우선순위 높은 순서대로 체크 (특수한 조건 → 일반 조건 → fallback)
export function classifyPlayStyle(stats: {
  kda: number;
  avgDamage: number;
  winRate: number;
  headshotRate: number;
  topTenRate: number;
  gamesPlayed: number;
}): PlayStyleDef {
  const { kda, avgDamage, winRate, headshotRate, topTenRate, gamesPlayed } = stats;

  // 1. 독수리 🦅 — 헤드샷율+KDA 모두 높음
  if (headshotRate >= 40 && kda >= 3.0) return PLAY_STYLES.eagle;

  // 2. 저승사자 💀 — KDA 극단적으로 높음
  if (kda >= 5.0) return PLAY_STYLES.reaper;

  // 3. 파괴신 💥 — 딜량+KDA 둘 다 상위
  if (avgDamage >= 500 && kda >= 3.5) return PLAY_STYLES.destroyer;

  // 4. 야전사령관 🎖️ — 모든 지표 균형있게 높음
  if (kda >= 2.5 && avgDamage >= 340 && winRate >= 10 && topTenRate >= 35) return PLAY_STYLES.commander;

  // 5. 쁘락치 🕵️ — KDA는 높은데 우승이 없음
  if (kda >= 2.5 && winRate < 5 && topTenRate < 20) return PLAY_STYLES.spy;

  // 6. 치킨마스터 🐔 — 우승율 높은데 딜량이 낮음
  if (winRate >= 12 && avgDamage < 220) return PLAY_STYLES.chicken;

  // 7. 저격수 🎯 — 헤드샷율+KDA 조합
  if (headshotRate >= 35 && kda >= 2.0) return PLAY_STYLES.sniper;

  // 8. 브레이커 🔨 — 딜은 많은데 KDA가 낮음
  if (avgDamage >= 420 && kda < 1.5) return PLAY_STYLES.breaker;

  // 9. 그림자 👤 — KDA는 높은데 딜량이 낮음 (막타형)
  if (kda >= 3.0 && avgDamage < 200) return PLAY_STYLES.shadow;

  // 10. 돌격대장 ⚔️ — KDA 높고 딜량도 있는데 탑10 낮음
  if (kda >= 2.5 && avgDamage >= 280 && topTenRate < 20) return PLAY_STYLES.charger;

  // 11. 전쟁광 😤 — 딜 많은데 우승·KDA 낮음
  if (avgDamage >= 350 && winRate < 5 && kda < 2.0) return PLAY_STYLES.maniac;

  // 12. 가짜공격수 🎭 — 탑10은 높은데 딜·KDA가 낮음
  if (topTenRate >= 45 && kda < 1.3 && avgDamage < 240) return PLAY_STYLES.faker;

  // 13. 유령병사 👻 — 탑10 낮은데 우승율 높음
  if (winRate >= 10 && topTenRate < 20) return PLAY_STYLES.ghost;

  // 14. 지뢰밭 💣 — 딜 많은데 헤드샷율 극히 낮음
  if (avgDamage >= 350 && headshotRate < 12) return PLAY_STYLES.minefield;

  // 15. 조커 🃏 — 딜은 하는데 KDA·우승 없음
  if (kda < 1.0 && avgDamage >= 250 && winRate < 3) return PLAY_STYLES.joker;

  // 16. 버스기사 🚌 — 경험은 많은데 KDA·우승 낮음
  if (gamesPlayed >= 60 && winRate < 3 && kda < 1.0) return PLAY_STYLES.driver;

  // 17. 거북이 🐢 — 탑10은 높은데 딜량 극히 낮음
  if (topTenRate >= 40 && winRate < 5 && avgDamage < 180) return PLAY_STYLES.turtle;

  // 18. 공격대장 🔥 — KDA+딜량 둘 다 준수
  if (kda >= 2.0 && avgDamage >= 300) return PLAY_STYLES.assault;

  // 19. 올라운더 ⚡ — 전반적으로 균형잡힌 중상위
  if (kda >= 1.5 && avgDamage >= 200 && winRate >= 5 && topTenRate >= 25) return PLAY_STYLES.allrounder;

  // 20. 생존왕 🛡️ — 탑10 진입율이 높음
  if (topTenRate >= 30) return PLAY_STYLES.survivor;

  // fallback — 입문자 🌱
  return PLAY_STYLES.rookie;
}
