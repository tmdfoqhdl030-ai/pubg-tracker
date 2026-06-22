import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 배틀그라운드 AI 전적검색 m249.kr",
  description: "m249.kr 서비스의 이용약관입니다.",
  alternates: { canonical: "https://m249.kr/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B2A", color: "#E8EDF2" }}>
      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#F1F5F9" }}>이용약관</h1>
        <p className="text-sm mb-10" style={{ color: "#64748B" }}>최종 수정일: 2026년 6월 22일</p>
        <div className="space-y-6 text-sm leading-7" style={{ color: "#CBD5E1" }}>
          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#F1F5F9" }}>1. 목적</h2>
            <p>본 약관은 m249.kr 서비스 이용에 관한 기본 사항을 정합니다.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#F1F5F9" }}>2. 서비스 내용</h2>
            <p>m249.kr은 PUBG 전적 조회, AI 분석, 공략 추천, 시너지 분석 기능을 제공합니다.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#F1F5F9" }}>3. 이용자의 의무</h2>
            <p>이용자는 서비스에 부정한 방식으로 접근하거나, 다른 이용자 및 제3자의 권리를 침해해서는 안 됩니다.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#F1F5F9" }}>4. 면책</h2>
            <p>전적 데이터는 외부 API와 게임 서버 상태에 따라 달라질 수 있으며, 서비스는 참고용 정보 제공을 목적으로 합니다.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#F1F5F9" }}>5. 문의</h2>
            <p>문의는 <a href="mailto:tmdfoqhdl030@gmail.com" className="underline hover:opacity-80" style={{ color: "#F97316" }}>tmdfoqhdl030@gmail.com</a> 으로 보내주세요.</p>
          </section>
        </div>
        <footer className="border-t mt-12 pt-6 text-xs" style={{ borderColor: "#1E3A5F", color: "#64748B" }}>
          <div className="flex gap-4 flex-wrap">
            <Link href="/" className="hover:opacity-80">홈</Link>
            <Link href="/about" className="hover:opacity-80">서비스 소개</Link>
            <Link href="/privacy" className="hover:opacity-80">개인정보처리방침</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
