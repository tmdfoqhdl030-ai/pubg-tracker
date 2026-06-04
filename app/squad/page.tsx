import Link from "next/link";
import { Shield, ArrowLeft, Users, ChevronDown } from "lucide-react";
import { mockSquad } from "@/lib/mock-data";
import SquadDashboard from "@/components/SquadDashboard";

interface Props {
  searchParams: Promise<{ members?: string | string[]; platform?: string }>;
}

export default async function SquadPage({ searchParams }: Props) {
  const { members, platform = "steam" } = await searchParams;
  const memberList = Array.isArray(members) ? members : members ? [members] : [];
  const hasSearch = memberList.length >= 2;

  const squad = hasSearch
    ? { ...mockSquad, members: mockSquad.members.map((m, i) => ({ ...m, nickname: memberList[i] ?? m.nickname })) }
    : mockSquad;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F1F5F9" }}>

      {/* ── 헤더 (플레이어 페이지와 동일 스타일) ── */}
      <header style={{ backgroundColor: "#0D1117", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-4xl mx-auto px-5 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={16} style={{ color: "#F97316" }} />
            <span className="font-black text-sm tracking-tight text-white">펍지고 (PubgGo)</span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            <ArrowLeft size={12} />전적 검색
          </Link>
        </div>
      </header>

      {/* ── 배너 ── */}
      <div style={{ background: "linear-gradient(160deg, #0D1117 0%, #161B27 60%, #0F172A 100%)" }}>
        <div className="max-w-4xl mx-auto px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #F9731635, #F9731610)", border: "1.5px solid #F9731640" }}>
              <Users size={18} style={{ color: "#F97316" }} />
            </div>
            <div>
              <h1 className="text-base font-black text-white">스쿼드 팀 분석</h1>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                {hasSearch ? `${memberList.length}명 팀원 시너지 분석` : "함께 플레이한 팀원을 분석해보세요"}
              </p>
            </div>
            {/* 멤버 pills */}
            {hasSearch && (
              <div className="flex items-center gap-1.5 flex-wrap ml-2">
                {memberList.map((m, i) => (
                  <Link key={i} href={`/player/${encodeURIComponent(m)}?platform=${platform}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                    style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)" }}>
                    {m}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 py-5 space-y-4">

        {/* ── 검색 안내 (멤버 없을 때) ── */}
        {!hasSearch && (
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFF7ED", border: "1px solid #FDBA74" }}>
                <Users size={18} style={{ color: "#F97316" }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold mb-1" style={{ color: "#0F172A" }}>자동 팀원 인식 사용하기</div>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                  닉네임 하나만 검색하면 자주 함께 플레이한 팀원을 자동으로 인식해 분석합니다.
                </p>
                <p className="text-xs mt-1.5" style={{ color: "#F97316" }}>
                  전적 페이지 → 우측 &quot;자주 함께한 팀원&quot; → 상위 4명으로 스쿼드 분석
                </p>
                <Link href="/"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-semibold px-4 py-2 rounded-xl text-white"
                  style={{ backgroundColor: "#F97316" }}>
                  <ArrowLeft size={13} />닉네임 검색하러 가기
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── 팀 대시보드 ── */}
        <SquadDashboard
          members={squad.members}
          synergyScore={squad.synergyScore}
          synergyComment={squad.synergyComment}
          strengths={squad.strengths}
          weaknesses={squad.weaknesses}
          platform={platform}
        />

        {/* ── 직접 닉네임 입력 ── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <details className="group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <Users size={14} style={{ color: "#94A3B8" }} />
                <span className="text-sm font-semibold" style={{ color: "#374151" }}>직접 닉네임 입력</span>
              </div>
              <ChevronDown size={14} className="group-open:rotate-180 transition-transform" style={{ color: "#94A3B8" }} />
            </summary>

            <div style={{ borderTop: "1px solid #F1F5F9" }}>
              <form action="/squad" method="GET" className="p-5 flex flex-col gap-3">
                <p className="text-xs" style={{ color: "#94A3B8" }}>2~4명의 닉네임을 직접 입력해 분석합니다</p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <input key={i} type="text" name="members"
                      placeholder={`팀원 ${i}${i <= 2 ? " (필수)" : " (선택)"}`}
                      defaultValue={memberList[i - 1] ?? ""}
                      className="px-3 py-2.5 text-sm rounded-lg outline-none focus:ring-2"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        color: "#0F172A",
                      }}
                    />
                  ))}
                </div>
                <select name="platform" defaultValue={platform}
                  className="px-3 py-2.5 text-sm rounded-lg w-full"
                  style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#374151" }}>
                  <option value="steam">스팀</option>
                  <option value="kakao">카카오</option>
                </select>
                <button type="submit"
                  className="py-2.5 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#F97316" }}>
                  <Users size={14} />스쿼드 분석하기
                </button>
              </form>
            </div>
          </details>
        </div>
      </main>

      <footer className="mt-6" style={{ borderTop: "1px solid #E2E8F0", backgroundColor: "#fff" }}>
        <div className="max-w-4xl mx-auto px-5 py-4 text-center text-xs" style={{ color: "#94A3B8" }}>
          펍지고 (PubgGo) — PUBG Corporation과 무관한 비공식 서비스입니다.
        </div>
      </footer>
    </div>
  );
}
