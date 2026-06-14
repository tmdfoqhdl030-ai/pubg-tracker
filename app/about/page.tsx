import Link from "next/link";
import { Shield, Zap, Users, BarChart2, Mail, Database, Clock, Target, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 소개 — 배틀그라운드 AI 전적검색 m249.kr",
  description:
    "m249.kr은 Krafton 공식 PUBG API를 기반으로 배틀그라운드 전적을 AI가 분석하는 서비스입니다. 플레이 스타일 진단, 약점 개선 공략 추천, 팀 시너지 분석 기능을 제공합니다.",
  alternates: { canonical: "https://m249.kr/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B2A", color: "#E8EDF2" }}>
      {/* 헤더 */}
      <header className="border-b" style={{ borderColor: "#1E3A5F" }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="m249 로고" width={32} height={32} style={{ borderRadius: 6 }} />
            <span className="font-bold text-base" style={{ color: "#E8EDF2" }}>m249.kr</span>
          </Link>
          <span style={{ color: "#475569" }}>/</span>
          <span className="text-sm" style={{ color: "#94A3B8" }}>서비스 소개</span>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-3xl mx-auto px-5 py-14 text-center">
        <div className="flex justify-center mb-5">
          <img src="/logo.svg" alt="m249 로고" width={72} height={72} style={{ borderRadius: 16 }} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: "#F1F5F9" }}>
          배틀그라운드 AI 전적검색 m249.kr
        </h1>
        <p className="text-sm sm:text-base leading-7 mb-6" style={{ color: "#94A3B8" }}>
          단순 전적 조회를 넘어, <strong style={{ color: "#CBD5E1" }}>AI가 내 플레이를 진단하고 약점을 짚어주는</strong> 배틀그라운드 분석 서비스입니다.<br />
          KDA·헤드샷율·탑10율 같은 지표를 바탕으로 개선 방향을 제시하고, 그에 맞는 공략까지 연결해드립니다.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["무료 서비스", "광고 없는 UI", "Krafton 공식 API"].map(tag => (
            <span key={tag} className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: "#F9731620", color: "#FB923C", border: "1px solid #F9731640" }}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* 만든 이유 */}
      <section className="max-w-3xl mx-auto px-5 pb-14">
        <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
          <h2 className="text-base font-bold mb-4" style={{ color: "#F1F5F9" }}>왜 만들었나요?</h2>
          <div className="space-y-3 text-sm leading-7" style={{ color: "#94A3B8" }}>
            <p>
              기존 전적 사이트들은 숫자를 보여주지만 <strong style={{ color: "#CBD5E1" }}>"그래서 내가 어떻게 해야 하는지"</strong>는 알려주지 않습니다.
              KDA 1.2가 좋은 건지 나쁜 건지, 헤드샷율 12%가 어떤 의미인지 해석해주는 곳이 없었습니다.
            </p>
            <p>
              m249.kr은 전적 수치를 <strong style={{ color: "#CBD5E1" }}>등급(S~D)으로 환산</strong>하고, 약한 지표에 대해 구체적인 개선 방향을 제시합니다.
              나아가 내 약점에 맞는 공략 글을 자동으로 연결해 "보고 끝"이 아니라 "보고 바로 실천"할 수 있도록 설계했습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="max-w-3xl mx-auto px-5 pb-14">
        <h2 className="text-lg font-bold mb-6" style={{ color: "#F1F5F9" }}>주요 기능</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: <BarChart2 size={20} style={{ color: "#F97316" }} />,
              title: "전적 검색 & 등급 분석",
              desc: "닉네임 검색으로 KDA·딜량·헤드샷율·승률·탑10율을 S~D 5단계 등급으로 즉시 환산. 내 지표가 전체 유저 중 어느 위치인지 바로 확인.",
            },
            {
              icon: <Zap size={20} style={{ color: "#F97316" }} />,
              title: "AI 플레이 스타일 진단",
              desc: "공격형·생존형·저격수·지휘관 등 21가지 유형 중 내 플레이 데이터와 가장 가까운 스타일을 AI가 분류. 강점과 개선점을 자동 생성.",
            },
            {
              icon: <Target size={20} style={{ color: "#F97316" }} />,
              title: "약점 기반 공략 자동 추천",
              desc: "헤드샷율이 낮으면 에임 훈련 공략, KDA가 낮으면 교전 가이드를 자동 연결. 전적 데이터와 공략 콘텐츠를 하나의 흐름으로 통합.",
            },
            {
              icon: <Users size={20} style={{ color: "#F97316" }} />,
              title: "스쿼드 시너지 분석",
              desc: "팀원 닉네임을 입력하면 4인 스쿼드의 플레이 스타일 궁합과 팀 밸런스 점수를 분석. 함께 뛰어야 할 조합인지 한눈에 파악.",
            },
            {
              icon: <Shield size={20} style={{ color: "#F97316" }} />,
              title: "핵 의심 감지",
              desc: "비정상적인 헤드샷율·킬/딜 비율·연속 킬 패턴을 종합해 핵 의심 점수(0~100)를 산출. 수상한 팀원이나 적을 확인할 때 유용.",
            },
            {
              icon: <TrendingUp size={20} style={{ color: "#F97316" }} />,
              title: "최근 트렌드 & 무기 분석",
              desc: "최근 5게임 KDA·딜량·승률 트렌드를 시즌 평균과 비교. 많이 사용한 무기와 텔레메트리 기반 하이라이트도 제공.",
            },
          ].map((f, i) => (
            <div key={i} className="rounded-xl p-5" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
              <div className="flex items-center gap-3 mb-3">
                {f.icon}
                <span className="font-semibold text-sm" style={{ color: "#F1F5F9" }}>{f.title}</span>
              </div>
              <p className="text-sm leading-6" style={{ color: "#94A3B8" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 & 기술 */}
      <section className="max-w-3xl mx-auto px-5 pb-14">
        <h2 className="text-lg font-bold mb-6" style={{ color: "#F1F5F9" }}>데이터 & 기술</h2>
        <div className="space-y-4">
          <div className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
            <Database size={20} className="flex-shrink-0 mt-0.5" style={{ color: "#60A5FA" }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "#F1F5F9" }}>Krafton 공식 PUBG API</p>
              <p className="text-sm leading-6" style={{ color: "#94A3B8" }}>
                모든 전적 데이터는 Krafton이 공식 제공하는 PUBG Developer API를 통해 실시간 수집합니다.
                데이터는 분산 캐시(Upstash Redis)에 저장되어 빠르게 제공되며, 본 서비스는 Krafton과 별도 제휴 관계가 없는 독립 서비스입니다.
              </p>
            </div>
          </div>
          <div className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
            <Clock size={20} className="flex-shrink-0 mt-0.5" style={{ color: "#34D399" }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "#F1F5F9" }}>캐싱 & 갱신 주기</p>
              <p className="text-sm leading-6" style={{ color: "#94A3B8" }}>
                전적 데이터는 최초 조회 후 10분간 캐시됩니다. "전적 갱신" 버튼을 누르면 최신 데이터를 다시 불러옵니다.
                인기 닉네임은 매일 새벽 4시(KST) 자동 갱신되어 검색 속도가 빠릅니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 pb-14">
        <h2 className="text-lg font-bold mb-6" style={{ color: "#F1F5F9" }}>자주 묻는 질문</h2>
        <div className="space-y-3">
          {[
            {
              q: "데이터가 안 나와요. 왜 그런가요?",
              a: "PUBG API는 최근 14일 내 매치 기록만 제공합니다. 오랫동안 게임을 하지 않았거나 닉네임·플랫폼 설정이 잘못된 경우 데이터가 없을 수 있습니다. 플랫폼(스팀/카카오)을 다시 확인해보세요.",
            },
            {
              q: "AI 분석 결과가 제 실력과 다른 것 같아요.",
              a: "AI 진단은 현재 시즌 누적 지표를 기준으로 합니다. 시즌 초반 게임 수가 적거나 테스트 게임이 섞여 있으면 실제 실력과 다를 수 있습니다. 50게임 이상 플레이 후 조회하면 더 정확합니다.",
            },
            {
              q: "핵 의심 점수는 신고 근거가 되나요?",
              a: "핵 의심 점수는 통계적 이상치를 탐지하는 참고 지표입니다. 실제 제재 여부는 Krafton의 Anti-Cheat 시스템이 결정하며, 본 점수는 공식 신고 근거로 사용할 수 없습니다.",
            },
            {
              q: "서비스 이용 요금이 있나요?",
              a: "m249.kr은 완전 무료입니다. 광고를 통해 서비스 운영 비용을 충당하고 있습니다.",
            },
          ].map((faq, i) => (
            <details key={i} className="rounded-xl overflow-hidden group"
              style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
              <summary className="px-5 py-4 text-sm font-semibold cursor-pointer list-none flex items-center justify-between"
                style={{ color: "#F1F5F9" }}>
                {faq.q}
                <span className="text-[10px] flex-shrink-0 ml-4" style={{ color: "#475569" }}>▼</span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-7" style={{ color: "#94A3B8" }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 문의 */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <div className="rounded-xl p-6 flex items-center gap-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
          <Mail size={20} style={{ color: "#F97316" }} />
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#F1F5F9" }}>문의 & 버그 제보</p>
            <a href="mailto:tmdfoqhdl030@gmail.com" className="text-sm hover:opacity-80 transition-opacity"
              style={{ color: "#F97316" }}>
              tmdfoqhdl030@gmail.com
            </a>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>
              잘못된 데이터, 오류, 기능 제안 등 언제든 연락주세요.
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t py-8" style={{ borderColor: "#1E3A5F" }}>
        <div className="max-w-3xl mx-auto px-5 text-center text-xs" style={{ color: "#475569" }}>
          <p>© 2026 m249.kr — PUBG Corporation과 무관한 비공식 배틀그라운드 전적검색 서비스</p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/" className="hover:opacity-80" style={{ color: "#64748B" }}>홈</Link>
            <Link href="/guide" className="hover:opacity-80" style={{ color: "#64748B" }}>공략 가이드</Link>
            <Link href="/about" className="hover:opacity-80" style={{ color: "#F97316" }}>서비스 소개</Link>
            <Link href="/privacy" className="hover:opacity-80" style={{ color: "#64748B" }}>개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
