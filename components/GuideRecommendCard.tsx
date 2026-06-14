import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

interface SeasonData {
  kda: number;
  winRate: number;
  avgDamage: number;
  headshotRate: number;
  topTenRate: number;
}

interface GuideItem {
  slug: string;
  emoji: string;
  title: string;
  reason: string;
  priority: "urgent" | "recommend";
}

function getWeakGuides(s: SeasonData): GuideItem[] {
  const guides: GuideItem[] = [];

  // 헤드샷율 낮음 (C/D = <14%)
  if (s.headshotRate < 14) {
    guides.push({
      slug: "headshot-aim",
      emoji: "🎯",
      title: "헤드샷율 올리는 에임 훈련법",
      reason: `헤드샷율 ${s.headshotRate.toFixed(1)}% — 조준점 교정이 가장 빠른 개선 경로`,
      priority: s.headshotRate < 7 ? "urgent" : "recommend",
    });
  }

  // KDA 낮음 (<1.5)
  if (s.kda < 1.5) {
    guides.push({
      slug: "win-1v1",
      emoji: "⚔️",
      title: "1대1 교전 이기는 법",
      reason: `KDA ${s.kda.toFixed(2)} — 불리한 교전 줄이고 유리한 상황만 싸우는 법`,
      priority: s.kda < 1.0 ? "urgent" : "recommend",
    });
  }

  // 딜량 낮음 (<220)
  if (s.avgDamage < 220) {
    guides.push({
      slug: "season-meta-weapons",
      emoji: "🔫",
      title: "시즌 메타 무기 완전 분석",
      reason: `평균 딜 ${Math.round(s.avgDamage)} — 딜 효율 높은 무기 조합으로 교체`,
      priority: s.avgDamage < 130 ? "urgent" : "recommend",
    });
  }

  // 탑10율 낮음 (<20%)
  if (s.topTenRate < 20) {
    guides.push({
      slug: "bluezone-survival",
      emoji: "🔵",
      title: "자기장 생존 완벽 가이드",
      reason: `탑10율 ${s.topTenRate.toFixed(1)}% — 자기장 이동 타이밍이 생존율 결정`,
      priority: s.topTenRate < 10 ? "urgent" : "recommend",
    });
  }

  // 승률 낮음 (<4%)
  if (s.winRate < 4) {
    guides.push({
      slug: "rank-up",
      emoji: "📈",
      title: "랭크 올리는 전략 가이드",
      reason: `승률 ${s.winRate.toFixed(1)}% — 파이널 서클 처리 능력 집중 개선`,
      priority: "recommend",
    });
  }

  // 약점이 없거나 1개뿐이면 전적 해석 가이드 추가
  if (guides.length < 2) {
    guides.push({
      slug: "read-your-stats",
      emoji: "📊",
      title: "내 전적 지표 제대로 읽는 법",
      reason: "KDA·딜·헤드샷율·탑10율이 실력에 미치는 영향 완전 해설",
      priority: "recommend",
    });
  }

  // urgent 먼저, 최대 3개
  return [
    ...guides.filter(g => g.priority === "urgent"),
    ...guides.filter(g => g.priority === "recommend"),
  ].slice(0, 3);
}

interface Props {
  season: SeasonData | null;
}

export default function GuideRecommendCard({ season }: Props) {
  if (!season) return null;

  const guides = getWeakGuides(season);
  if (guides.length === 0) return null;

  const hasUrgent = guides.some(g => g.priority === "urgent");

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0", backgroundColor: "#fff" }}>
      {/* 헤더 */}
      <div className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: "#FAFAFA" }}>
        <div className="flex items-center gap-2">
          <BookOpen size={13} style={{ color: "#F97316" }} />
          <span className="text-xs font-bold" style={{ color: "#0F172A" }}>
            내 약점에 맞는 공략
          </span>
          {hasUrgent && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>
              개선 필요
            </span>
          )}
        </div>
        <Link href="/guide"
          className="flex items-center gap-0.5 text-[10px] font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#F97316" }}>
          전체 보기 <ChevronRight size={10} />
        </Link>
      </div>

      {/* 공략 목록 */}
      <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}`}
            className="flex items-center gap-3 px-5 py-3.5 group hover:bg-[#FAFAFA] transition-colors"
          >
            <span className="text-xl flex-shrink-0">{g.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold truncate" style={{ color: "#0F172A" }}>
                  {g.title}
                </span>
                {g.priority === "urgent" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#FEF2F2", color: "#EF4444" }}>
                    우선
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-tight truncate" style={{ color: "#94A3B8" }}>
                {g.reason}
              </p>
            </div>
            <ChevronRight size={13} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
              style={{ color: "#CBD5E1" }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
