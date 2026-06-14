import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 — m249.kr",
  description: "요청하신 페이지가 존재하지 않습니다. m249.kr 배틀그라운드 AI 전적검색으로 이동하세요.",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ backgroundColor: "#0D1B2A", color: "#E8EDF2" }}
    >
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="m249 로고" width={36} height={36} style={{ borderRadius: 8 }} />
        <span className="font-bold text-base" style={{ color: "#E8EDF2" }}>m249.kr</span>
      </Link>

      {/* 숫자 */}
      <div className="text-8xl font-black mb-4 leading-none" style={{ color: "#F97316" }}>
        404
      </div>

      <h1 className="text-xl font-bold mb-3" style={{ color: "#F1F5F9" }}>
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm leading-7 mb-8 max-w-sm" style={{ color: "#64748B" }}>
        주소가 잘못됐거나 삭제된 페이지입니다.<br />
        닉네임을 검색하거나 홈으로 돌아가세요.
      </p>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/guide"
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#0F2A40", color: "#94A3B8", border: "1px solid #1E3A5F" }}
        >
          공략 가이드 보기
        </Link>
      </div>

      {/* 바로가기 링크 */}
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs" style={{ color: "#475569" }}>
        <Link href="/" className="hover:opacity-80">전적 검색</Link>
        <Link href="/guide" className="hover:opacity-80">배그 공략</Link>
        <Link href="/about" className="hover:opacity-80">서비스 소개</Link>
        <Link href="/privacy" className="hover:opacity-80">개인정보처리방침</Link>
      </div>
    </div>
  );
}
