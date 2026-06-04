// ─── 스쿼드 고도화 분석 서비스 ────────────────────────────────────────
// 팀원들의 능력치를 종합하여 레이더 차트 데이터, 케미 매트릭스, 작전 보고서 등을 생성합니다.

import { SquadMember } from "./squad-badges";

export interface RadarDataPoint {
  subject: string;
  A: number; // 팀 능력치 (0~100)
  fullMark: number;
}

export interface ChemistryPair {
  player1: string;
  player2: string;
  title: string;
  emoji: string;
  description: string;
  type: "best" | "worst" | "normal";
  score: number;
}

export interface SignatureMapInfo {
  bestMap: string;
  bestMapEmoji: string;
  bestMapDesc: string;
  worstMap: string;
  worstMapEmoji: string;
  worstMapDesc: string;
  recommendedZone: string;
}

// 1. 레이더 차트 데이터 계산
export function calculateRadarData(members: SquadMember[], synergyScore: number): RadarDataPoint[] {
  if (members.length === 0) return [];

  const avgKda = members.reduce((s, m) => s + m.kda, 0) / members.length;
  const avgDamage = members.reduce((s, m) => s + m.damage, 0) / members.length;
  const avgHs = members.reduce((s, m) => s + m.headshotRate, 0) / members.length;
  const avgWr = members.reduce((s, m) => s + m.winRate, 0) / members.length;

  // 0~100 스케일링
  const firepower = Math.min(100, Math.max(15, (avgDamage / 350) * 100));
  const survival = Math.min(100, Math.max(15, (avgWr / 20) * 100));
  const accuracy = Math.min(100, Math.max(15, (avgHs / 40) * 100));
  
  // 기동성: 돌격형/생존형 비율 및 평균 KDA 기반 산출
  const speedRoles = members.filter(m => m.role === "돌격형" || m.role === "생존형").length;
  const mobility = Math.min(100, Math.max(20, (speedRoles / members.length) * 40 + (avgKda * 15) + 20));

  return [
    { subject: "공격력 (Firepower)", A: Math.round(firepower), fullMark: 100 },
    { subject: "생존력 (Survival)", A: Math.round(survival), fullMark: 100 },
    { subject: "정밀도 (Accuracy)", A: Math.round(accuracy), fullMark: 100 },
    { subject: "기동성 (Mobility)", A: Math.round(mobility), fullMark: 100 },
    { subject: "조화력 (Synergy)", A: Math.round(synergyScore), fullMark: 100 },
  ];
}

// 2. 팀원 간 케미 분석 (Duo Matrix)
export function analyzeChemistry(members: SquadMember[]): { best: ChemistryPair | null; comedy: ChemistryPair | null } {
  if (members.length < 2) return { best: null, comedy: null };

  const pairs: ChemistryPair[] = [];

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const kdaSum = a.kda + b.kda;
      const avgDamage = (a.damage + b.damage) / 2;

      let title = "일반적인 전우";
      let emoji = "🤝";
      let description = "서로 등 뒤를 맡기며 묵묵히 1인분을 수행하는 안정적인 동료 관계입니다.";
      let type: "best" | "worst" | "normal" = "normal";
      let score = kdaSum * 10;

      // 케미 등급 분기
      if (a.kda >= 2.0 && b.kda >= 2.0) {
        title = "환상의 듀오";
        emoji = "👑";
        description = "마주치는 적들을 더블 킬로 정리해버리는 이 팀의 핵심 화력 라인!";
        type = "best";
        score = 150 + kdaSum * 10;
      } else if ((a.kda >= 2.5 && b.kda < 1.0) || (b.kda >= 2.5 && a.kda < 1.0)) {
        const driver = a.kda >= 2.5 ? a.nickname : b.nickname;
        const passenger = a.kda >= 2.5 ? b.nickname : a.nickname;
        title = "버스 기사와 승객";
        emoji = "🚌";
        description = `${driver} 기사님이 풀악셀을 밟았고, ${passenger} 승객님은 경치 구경 중입니다.`;
        type = "best";
        score = 120;
      } else if (a.kda < 1.0 && b.kda < 1.0) {
        title = "덤 앤 더머";
        emoji = "🤪";
        description = "둘이 뭉치면 교전 승률이 30% 아래로 감소하는 환장의 개그 콤비.";
        type = "worst";
        score = 10;
      } else if (avgDamage >= 250) {
        title = "쌍포 화력 분대";
        emoji = "🔥";
        description = "둘이 쏘는 총알 세례에 적들이 엄폐물 째로 갈려 나갑니다.";
        type = "best";
        score = 110 + kdaSum * 5;
      } else if (
        (a.role === "저격형" && b.role === "지원형") ||
        (b.role === "저격형" && a.role === "지원형")
      ) {
        title = "공격과 서포트";
        emoji = "🎯";
        description = "한 명은 안전하게 조준하고, 한 명은 뒤에서 든든하게 구상과 연막을 챙겨줍니다.";
        type = "normal";
        score = 80;
      }

      pairs.push({
        player1: a.nickname,
        player2: b.nickname,
        title,
        emoji,
        description,
        type,
        score,
      });
    }
  }

  // 점수가 가장 높은 것을 Best 케미로, 가장 낮거나 특이한 것을 Comedy(주의) 케미로 선정
  const sorted = [...pairs].sort((a, b) => b.score - a.score);
  const best = sorted[0] || null;

  // Comedy 케미는 점수가 낮거나 버스기사/덤앤더머인 조합 중 선정
  const comedyCandidates = pairs.filter(p => p.type === "worst" || p.title === "버스 기사와 승객");
  const comedy = comedyCandidates.length > 0 
    ? comedyCandidates[Math.floor(Math.random() * comedyCandidates.length)] 
    : (sorted[sorted.length - 1] && sorted[sorted.length - 1] !== best ? sorted[sorted.length - 1] : null);

  return { best, comedy };
}

// 3. AI 전술 보고서 생성
export function generateTacticalReport(members: SquadMember[]): string {
  if (members.length === 0) return "팀원 정보가 부족하여 작전을 수립할 수 없습니다.";

  const assaulters = members.filter(m => m.role === "돌격형").map(m => m.nickname);
  const snipers = members.filter(m => m.role === "저격형").map(m => m.nickname);
  const supporters = members.filter(m => m.role === "지원형").map(m => m.nickname);
  const survivors = members.filter(m => m.role === "생존형").map(m => m.nickname);

  let report = "";

  if (assaulters.length > 0) {
    report += `교전이 시작되면 돌격대장 ${assaulters.join(" 대원과 ")} 대원이 최전선에서 과감하게 진입해 적의 시선을 끌어주어야 합니다. `;
  } else {
    report += `이 팀은 전방을 뚫어줄 전문 돌격수가 부족합니다. 성급한 진입을 자제하고 3인칭 엄폐 각을 활용해 천천히 진입해야 합니다. `;
  }

  if (snipers.length > 0) {
    report += `이때 고지대나 2선에 배치된 명사수 ${snipers.join(", ")} 대원이 DMR/SR로 확실하게 상대 대가리를 터뜨려주며 수적 우위를 확보해야 합니다. `;
  } else {
    report += `원거리 지원 화력이 아쉬우니, 개활지 싸움은 피하고 시가전이나 가옥 방어 중심으로 동선을 짜는 것을 강력히 추천합니다. `;
  }

  if (supporters.length > 0) {
    report += `교전 중 부상이나 기절이 발생할 경우, 만능 헬퍼 ${supporters.join(" 대원이 ")} 신속하게 연막을 펼쳐 부활 각을 확보하고 치료제 공급을 전담하면 팀 유지력이 극대화됩니다. `;
  } else {
    report += `기절 시 살려줄 전담 서포터가 부재하므로, 각자 엄폐물을 절대 벗어나지 않는 이기적인 생존 플레이를 지향해야 생존률이 오릅니다. `;
  }

  if (survivors.length > 0) {
    report += `서클 외곽 운영 시에는 넓은 시야를 가진 생존 마스터 ${survivors.join(", ")} 대원의 오더를 전적으로 따르며 짤파밍과 차량 확보에 집중하면 무난한 TOP 10 진입이 가능합니다.`;
  } else {
    report += `운영의 핵심인 네비게이터가 없으니, 미니맵 자기장 서클 변화에 항상 귀를 기울이고 남들보다 반 박자 빠르게 중심부 스플릿 가옥을 점령하는 야성을 키워야 합니다.`;
  }

  return report;
}

// 4. 팀 시그니처 맵 & 드롭포인트 도출
export function getSignatureMap(members: SquadMember[]): SignatureMapInfo {
  const avgHs = members.reduce((s, m) => s + m.headshotRate, 0) / members.length;
  const avgWr = members.reduce((s, m) => s + m.winRate, 0) / members.length;
  const assaulterCount = members.filter(m => m.role === "돌격형").length;
  const sniperCount = members.filter(m => m.role === "저격형").length;

  let bestMap = "에란겔";
  let bestMapEmoji = "🌲";
  let bestMapDesc = "산악 엄폐와 밀밭 시가전이 적절해 가장 균형 잡힌 전술을 구사할 수 있습니다.";
  let worstMap = "미라마";
  let worstMapEmoji = "🏜️";
  let worstMapDesc = "고지대 저격각이 많아 개활지 이동 중 허망하게 로비로 튕겨 나갈 우려가 큽니다.";
  let recommendedZone = "Pochinki (Erangel)";

  // 저격수가 많고 헤드샷 정밀도가 높다면 미라마가 최고의 전장
  if (sniperCount >= 2 || avgHs >= 22) {
    bestMap = "미라마";
    bestMapEmoji = "🏜️";
    bestMapDesc = "고지대 장거리 저격 효율이 극대화되는 전장으로, 명사수들이 날뛰기 좋습니다.";
    worstMap = "사녹";
    worstMapEmoji = "🌴";
    worstMapDesc = "풀이 너무 길어 적을 포착하기 전에 3인칭 낙엽 장치들에 의해 전멸당하기 쉽습니다.";
    recommendedZone = "Pecado (Miramar)";
  } 
  // 돌격수가 많다면 개활지보단 사녹이나 론도 난전이 유리
  else if (assaulterCount >= 2) {
    bestMap = "사녹";
    bestMapEmoji = "🌴";
    bestMapDesc = "초반 난전과 게릴라식 여포 플레이가 활성화되는 사녹이 킬을 쓸어 담기 제격입니다.";
    worstMap = "비켄디";
    worstMapEmoji = "❄️";
    worstMapDesc = "넓은 시야 차단과 빙판길 슬라이딩으로 백업이 늦어져 각개격파 당하기 쉽습니다.";
    recommendedZone = "Bootcamp (Sanhok)";
  } 
  // 생존주의 위주
  else if (avgWr >= 12) {
    bestMap = "태이고";
    bestMapEmoji = "🌾";
    bestMapDesc = "복귀전과 다채로운 파밍 루트가 있어, 뛰어난 생존력으로 치킨 원정을 완성합니다.";
    worstMap = "카라킨";
    worstMapEmoji = "🏜️";
    worstMapDesc = "블랙존으로 가옥째 파괴되어 존버가 불가능하고 교전 강요가 빈번합니다.";
    recommendedZone = "Taego City (Taego)";
  }

  return {
    bestMap,
    bestMapEmoji,
    bestMapDesc,
    worstMap,
    worstMapEmoji,
    worstMapDesc,
    recommendedZone,
  };
}

// 5. 멤버별 재치 있는 한줄 타이틀
export function getWittyTitle(member: SquadMember, isMaxKda: boolean, isMaxDamage: boolean, isMaxHs: boolean): string {
  if (isMaxDamage && member.damage >= 280) {
    return "인간 폭격기 (팀 내 딜량 독식)";
  }
  if (isMaxHs && member.headshotRate >= 30) {
    return "자비 없는 뚝배기 브레이커 🎯";
  }
  if (isMaxKda && member.kda >= 2.5) {
    return "팀의 실질적 수호신 👑";
  }
  if (member.kda < 0.9) {
    return "로비 사출 전문 승객 🚌";
  }

  switch (member.role) {
    case "돌격형":
      return "직진밖에 모르는 불도저 🚜";
    case "저격형":
      return "숨참기 500배 명사수 🔭";
    case "지원형":
      return "걸어다니는 구급상자 🩺";
    case "생존형":
      return "야생의 순위 방어단 ⛺";
    default:
      return "듬직한 1인분 요원";
  }
}
