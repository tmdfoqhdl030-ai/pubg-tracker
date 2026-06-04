import SearchBar from "@/components/SearchBar";
import { Shield, Zap, Users, Target } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      {/* nav */}
      <header className="bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: "#F97316" }} />
            <span className="font-bold text-base" style={{ color: "#0F172A" }}>PUBG Tracker</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium" style={{ color: "#64748B" }}>
            <Link href="/" className="hover:text-[#0F172A] transition-colors">홈</Link>
            <Link href="/squad" className="hover:text-[#0F172A] transition-colors">팀 분석</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* hero */}
        <div className="text-center mb-12 max-w-xl">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 mb-6"
            style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FFEDD5" }}
          >
            <Zap size={11} />
            AI 분석 · 위험도 · 팀 시너지
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: "#0F172A" }}>
            배틀그라운드
            <br />
            <span style={{ color: "#F97316" }}>전적 분석</span>
          </h1>

          <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
            AI가 플레이 약점을 진단하고, 팀 시너지까지 한눈에 파악하세요.
          </p>
        </div>

        <SearchBar />

        {/* feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-2xl w-full">
          {[
            { icon: Zap, title: "AI 플레이 진단", desc: "최근 게임 분석으로 약점과 개선 포인트를 제공합니다", color: "#F97316" },
            { icon: Target, title: "위험도 측정", desc: "상대 닉네임 검색으로 즉시 위험도와 플레이 성향 분석", color: "#EAB308" },
            { icon: Users, title: "팀 시너지", desc: "4인 닉네임 입력으로 역할 분포와 시너지 점수 확인", color: "#22C55E" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-white rounded-xl p-5"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <div className="font-semibold text-sm mb-1.5" style={{ color: "#0F172A" }}>{title}</div>
              <div className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 text-center text-xs" style={{ color: "#94A3B8" }}>
          PUBG Tracker — PUBG Corporation과 무관한 비공식 서비스입니다.
        </div>
      </footer>
    </div>
  );
}
