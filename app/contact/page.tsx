import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의 — 배틀그라운드 AI 전적검색 m249.kr",
  description: "m249.kr 서비스 문의 페이지입니다.",
  alternates: { canonical: "https://m249.kr/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B2A", color: "#E8EDF2" }}>
      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#F1F5F9" }}>문의</h1>
        <p className="text-sm mb-8" style={{ color: "#64748B" }}>서비스 오류, 제휴, 정책 문의는 아래 이메일로 보내주세요.</p>
        <div className="rounded-xl p-5" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
          <p className="text-sm mb-2" style={{ color: "#CBD5E1" }}>이메일</p>
          <a href="mailto:tmdfoqhdl030@gmail.com" className="text-sm underline hover:opacity-80" style={{ color: "#F97316" }}>
            tmdfoqhdl030@gmail.com
          </a>
        </div>
        <footer className="border-t mt-12 pt-6 text-xs" style={{ borderColor: "#1E3A5F", color: "#64748B" }}>
          <div className="flex gap-4 flex-wrap">
            <Link href="/" className="hover:opacity-80">홈</Link>
            <Link href="/about" className="hover:opacity-80">서비스 소개</Link>
            <Link href="/privacy" className="hover:opacity-80">개인정보처리방침</Link>
            <Link href="/terms" className="hover:opacity-80">이용약관</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
