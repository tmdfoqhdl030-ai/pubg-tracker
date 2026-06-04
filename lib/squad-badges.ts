// ─── 스쿼드 팀 유형 배지 서비스 ───────────────────────────────────────
// 총 21가지의 재치 있고 다양한 팀 유형 배지를 정의하고, 팀원들의 전적을 바탕으로 매칭합니다.

export interface SquadBadge {
  name: string;
  emoji: string;
  description: string;
  gradient: string; // tailwind/css gradient style
  borderClass: string;
  textColor: string;
}

export interface SquadMember {
  nickname: string;
  role: string; // "돌격형" | "저격형" | "지원형" | "생존형"
  kda: number;
  damage: number;
  headshotRate: number;
  winRate: number;
}

const ALL_BADGES: {
  name: string;
  emoji: string;
  description: string;
  gradient: string;
  borderClass: string;
  textColor: string;
  matchFn: (members: SquadMember[]) => boolean;
}[] = [
  {
    name: "특수부대",
    emoji: "🪖",
    description: "에란겔을 씹어 먹는 최정예 요원들. 압도적인 화력과 전술을 펼칩니다.",
    gradient: "linear-gradient(135deg, #1E3A8A, #065F46)",
    borderClass: "rgba(6,95,70,0.5)",
    textColor: "#A7F3D0",
    matchFn: (members) =>
      members.length >= 2 &&
      members.every((m) => m.kda >= 2.0) &&
      members.reduce((sum, m) => sum + m.damage, 0) / members.length >= 220,
  },
  {
    name: "네 얼간이",
    emoji: "🤪",
    description: "우승보다는 예능! 적보다 아군을 더 많이 기절시키는 오합지졸 분대.",
    gradient: "linear-gradient(135deg, #EF4444, #F59E0B)",
    borderClass: "rgba(239,68,68,0.5)",
    textColor: "#FFE4E6",
    matchFn: (members) =>
      members.length === 4 &&
      members.every((m) => m.kda < 1.0),
  },
  {
    name: "북트리오",
    emoji: "🏔️",
    description: "북쪽 끝 산자락에서 내려온 매서운 삼총사. 뛰어난 결속력을 자랑합니다.",
    gradient: "linear-gradient(135deg, #334155, #64748B)",
    borderClass: "rgba(100,116,139,0.5)",
    textColor: "#F1F5F9",
    matchFn: (members) => members.length === 3,
  },
  {
    name: "덤 앤 더머",
    emoji: "🤝",
    description: "둘이 뭉쳐 생존력이 절반으로 감소하는 전설의 환장 콤비.",
    gradient: "linear-gradient(135deg, #D97706, #B45309)",
    borderClass: "rgba(180,83,9,0.5)",
    textColor: "#FEF3C7",
    matchFn: (members) =>
      members.length === 2 &&
      members.every((m) => m.kda < 1.0),
  },
  {
    name: "버스 기사와 승객들",
    emoji: "🚌",
    description: "초특급 에이스 1명이 운전대를 잡고 지쳐 쓰러질 때까지 캐리합니다.",
    gradient: "linear-gradient(135deg, #10B981, #047857)",
    borderClass: "rgba(4,120,87,0.5)",
    textColor: "#ECFDF5",
    matchFn: (members) => {
      if (members.length < 2) return false;
      const superStarCount = members.filter((m) => m.kda >= 2.5).length;
      const passengerCount = members.filter((m) => m.kda < 1.0).length;
      return superStarCount === 1 && passengerCount >= members.length - 1;
    },
  },
  {
    name: "어벤져스",
    emoji: "🦸",
    description: "각기 다른 고유 포지션에서 최정상 기량을 펼치는 완벽한 밸런스의 분대.",
    gradient: "linear-gradient(135deg, #6366F1, #EC4899)",
    borderClass: "rgba(99,102,241,0.5)",
    textColor: "#EEF2F6",
    matchFn: (members) => {
      if (members.length !== 4) return false;
      const roles = new Set(members.map((m) => m.role));
      const avgKDA = members.reduce((sum, m) => sum + m.kda, 0) / 4;
      return roles.size === 4 && avgKDA >= 1.8;
    },
  },
  {
    name: "황금 밸런스",
    emoji: "⚖️",
    description: "누구 하나 구멍도 에이스도 없다! 자로 잰 듯 똑같이 굴러가는 톱니바퀴 팀.",
    gradient: "linear-gradient(135deg, #059669, #3B82F6)",
    borderClass: "rgba(5,150,105,0.5)",
    textColor: "#ECFDF5",
    matchFn: (members) => {
      if (members.length < 2) return false;
      const kdas = members.map((m) => m.kda);
      const avg = kdas.reduce((s, v) => s + v, 0) / kdas.length;
      const stdDev = Math.sqrt(kdas.reduce((s, v) => s + (v - avg) ** 2, 0) / kdas.length);
      return stdDev < 0.35 && avg >= 1.1;
    },
  },
  {
    name: "헤드샷 명사수단",
    emoji: "🎯",
    description: "평균 헤드샷 비율 상위권! 조준했다 하면 뚝배기를 날려버립니다.",
    gradient: "linear-gradient(135deg, #7C3AED, #DB2777)",
    borderClass: "rgba(124,58,237,0.5)",
    textColor: "#FDF2F8",
    matchFn: (members) =>
      members.length >= 2 &&
      members.reduce((sum, m) => sum + m.headshotRate, 0) / members.length >= 25,
  },
  {
    name: "여포 군단",
    emoji: "🔥",
    description: "적을 마주치면 물러서지 않고 로비로 보내버리는 교전 중독 팀.",
    gradient: "linear-gradient(135deg, #EF4444, #7F1D1D)",
    borderClass: "rgba(239,68,68,0.5)",
    textColor: "#FFE4E6",
    matchFn: (members) =>
      members.length >= 2 &&
      members.reduce((sum, m) => sum + m.damage, 0) / members.length >= 270,
  },
  {
    name: "존버 야영단",
    emoji: "⛺",
    description: "싸움은 피한다! 풀숲과 바위 뒤에 몸을 숨기고 끈질기게 생존합니다.",
    gradient: "linear-gradient(135deg, #0D5C34, #047857)",
    borderClass: "rgba(4,120,87,0.5)",
    textColor: "#D1FAE5",
    matchFn: (members) =>
      members.length >= 2 &&
      members.reduce((sum, m) => sum + m.winRate, 0) / members.length >= 13 &&
      members.reduce((sum, m) => sum + m.damage, 0) / members.length < 160,
  },
  {
    name: "평화주의자들",
    emoji: "🕊️",
    description: "피를 흘리지 않고 순위 경쟁만 즐기는 평화롭고 친환경적인 연대.",
    gradient: "linear-gradient(135deg, #64748B, #94A3B8)",
    borderClass: "rgba(100,116,139,0.3)",
    textColor: "#F8FAFC",
    matchFn: (members) =>
      members.length >= 2 &&
      members.every((m) => m.kda < 0.6),
  },
  {
    name: "환상의 커플",
    emoji: "👩‍❤️‍👨",
    description: "둘만 뭉쳐도 적 스쿼드를 가뿐히 초토화할 수 있는 강력한 듀오.",
    gradient: "linear-gradient(135deg, #EC4899, #F43F5E)",
    borderClass: "rgba(236,72,153,0.5)",
    textColor: "#FFF1F2",
    matchFn: (members) =>
      members.length === 2 &&
      members.every((m) => m.kda >= 2.0),
  },
  {
    name: "불도저 돌격대",
    emoji: "🛡️",
    description: "선봉에서 몸을 사리지 않고 먼저 진입해 활로를 여는 화끈한 돌격 중심 스쿼드.",
    gradient: "linear-gradient(135deg, #EA580C, #B91C1C)",
    borderClass: "rgba(234,88,12,0.5)",
    textColor: "#FFEDD5",
    matchFn: (members) =>
      members.filter((m) => m.role === "돌격형").length >= 2,
  },
  {
    name: "기적의 응급 구조대",
    emoji: "🩺",
    description: "기절한 팀원에게 0.1초 만에 연막을 뿌리고 달려가는 빛나는 서포터 분대.",
    gradient: "linear-gradient(135deg, #0D9488, #059669)",
    borderClass: "rgba(13,148,136,0.5)",
    textColor: "#F0FDFA",
    matchFn: (members) =>
      members.filter((m) => m.role === "지원형").length >= 2,
  },
  {
    name: "화력 덕후단",
    emoji: "💣",
    description: "총은 많이 쏘고 딜은 폭발적이지만 이상하게 막타 킬은 다른 팀이 가로챕니다.",
    gradient: "linear-gradient(135deg, #F97316, #C2410C)",
    borderClass: "rgba(249,115,22,0.5)",
    textColor: "#FFF7ED",
    matchFn: (members) =>
      members.length >= 2 &&
      members.reduce((sum, m) => sum + m.damage, 0) / members.length >= 220 &&
      members.reduce((sum, m) => sum + m.kda, 0) / members.length < 1.3,
  },
  {
    name: "질주 본능 레이서즈",
    emoji: "🏎️",
    description: "차 소리만 들리면 먼저 타서 운전석을 점령하는 광속 드라이브 분대.",
    gradient: "linear-gradient(135deg, #2563EB, #1D4ED8)",
    borderClass: "rgba(37,99,235,0.5)",
    textColor: "#EFF6FF",
    matchFn: (members) =>
      members.length >= 2 &&
      members.some((m) => m.role === "생존형" && m.winRate >= 10),
  },
  {
    name: "소리 없는 자객단",
    emoji: "👤",
    description: "그림자처럼 움직여 스코프로 머리를 조용히 저격하는 암살 특화 분대.",
    gradient: "linear-gradient(135deg, #1F2937, #111827)",
    borderClass: "rgba(31,41,55,0.5)",
    textColor: "#F9FAFB",
    matchFn: (members) =>
      members.filter((m) => m.role === "저격형").length >= 2 &&
      members.reduce((sum, m) => sum + m.kda, 0) / members.length >= 1.5,
  },
  {
    name: "치킨 원정대",
    emoji: "🍗",
    description: "언제나 생존률과 톱10 확률이 높아 1일 1치킨을 달성하고 마는 치킨 매니아들.",
    gradient: "linear-gradient(135deg, #D97706, #EA580C)",
    borderClass: "rgba(217,119,6,0.5)",
    textColor: "#FEF3C7",
    matchFn: (members) =>
      members.length >= 2 &&
      members.reduce((sum, m) => sum + m.winRate, 0) / members.length >= 15,
  },
  {
    name: "어색한 동행",
    emoji: "🚶",
    description: "KDA 3.0 이상 썩은물 고수와 1.0 미만 뉴비가 엮여있는 독특한 듀오.",
    gradient: "linear-gradient(135deg, #475569, #94A3B8)",
    borderClass: "rgba(71,85,105,0.4)",
    textColor: "#F8FAFC",
    matchFn: (members) =>
      members.length === 2 &&
      ((members[0].kda >= 2.5 && members[1].kda < 1.0) ||
        (members[1].kda >= 2.5 && members[0].kda < 1.0)),
  },
  {
    name: "유리대포 분대",
    emoji: "💎",
    description: "딜량은 엄청나지만 방어와 엄폐를 까먹어 기절도 빛의 속도로 하는 분대.",
    gradient: "linear-gradient(135deg, #0284C7, #025986)",
    borderClass: "rgba(2,132,199,0.5)",
    textColor: "#F0F9FF",
    matchFn: (members) =>
      members.length >= 2 &&
      members.reduce((sum, m) => sum + m.damage, 0) / members.length >= 230 &&
      members.reduce((sum, m) => sum + m.winRate, 0) / members.length < 8,
  },
  {
    name: "용두사미 분대",
    emoji: "📉",
    description: "초반 파밍과 첫 교전은 최강이나, 후반 서클 운영에서 말려 치킨을 놓치는 유형.",
    gradient: "linear-gradient(135deg, #EF4444, #991B1B)",
    borderClass: "rgba(239,68,68,0.5)",
    textColor: "#FEE2E2",
    matchFn: (members) =>
      members.length >= 3 &&
      members.reduce((sum, m) => sum + m.damage, 0) / members.length >= 190 &&
      members.reduce((sum, m) => sum + m.winRate, 0) / members.length < 5,
  },
];

// 매칭되는 배지가 없을 때의 기본 fallback 배지
const DEFAULT_BADGE: SquadBadge = {
  name: "동네 친구들",
  emoji: "☕",
  description: "퇴근 후 가볍게 치킨을 노리며 한잔 수다를 나누는 끈끈한 친근 콤비.",
  gradient: "linear-gradient(135deg, #475569, #334155)",
  borderClass: "rgba(71,85,105,0.4)",
  textColor: "#F8FAFC",
};

export function getSquadBadges(members: SquadMember[]): SquadBadge[] {
  if (!members || members.length === 0) return [DEFAULT_BADGE];
  const matched = ALL_BADGES.filter((b) => b.matchFn(members));
  if (matched.length === 0) return [DEFAULT_BADGE];
  const b = matched[0];
  return [{
    name: b.name,
    emoji: b.emoji,
    description: b.description,
    gradient: b.gradient,
    borderClass: b.borderClass,
    textColor: b.textColor,
  }];
}

export function getAllBadges(): SquadBadge[] {
  const list = ALL_BADGES.map(({ name, emoji, description, gradient, borderClass, textColor }) => ({
    name,
    emoji,
    description,
    gradient,
    borderClass,
    textColor,
  }));
  return [...list, DEFAULT_BADGE];
}
