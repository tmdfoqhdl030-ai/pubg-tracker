import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 배틀그라운드 AI 전적검색 m249",
  description: "m249.kr 서비스의 개인정보처리방침입니다.",
};

export default function PrivacyPage() {
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
          <span className="text-sm" style={{ color: "#94A3B8" }}>개인정보처리방침</span>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#F1F5F9" }}>개인정보처리방침</h1>
        <p className="text-sm mb-10" style={{ color: "#64748B" }}>최종 수정일: 2025년 6월 1일</p>

        <div className="space-y-8 text-sm leading-7" style={{ color: "#CBD5E1" }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>1. 수집하는 정보</h2>
            <p>m249.kr(이하 "서비스")은 다음과 같은 정보를 수집합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1" style={{ color: "#94A3B8" }}>
              <li>검색한 게임 닉네임 (서버 로그)</li>
              <li>접속 IP, 브라우저 정보, 방문 페이지 (서버 로그)</li>
              <li>Google Analytics를 통한 익명 방문 통계</li>
              <li>Google AdSense를 통한 광고 쿠키 (맞춤 광고 제공 목적)</li>
            </ul>
            <p className="mt-2">회원가입, 이메일, 전화번호 등 개인 식별 정보는 수집하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>2. 정보 수집 목적</h2>
            <ul className="list-disc list-inside space-y-1" style={{ color: "#94A3B8" }}>
              <li>배틀그라운드 전적 및 통계 제공</li>
              <li>서비스 품질 개선 및 오류 분석</li>
              <li>맞춤 광고 제공 (Google AdSense)</li>
              <li>서비스 이용 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>3. 제3자 서비스</h2>
            <p>본 서비스는 아래의 제3자 서비스를 이용합니다.</p>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg p-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
                <div className="font-medium mb-1" style={{ color: "#F1F5F9" }}>PUBG API (Krafton)</div>
                <p style={{ color: "#94A3B8" }}>게임 전적 데이터를 제공받기 위해 Krafton의 공식 PUBG API를 사용합니다. 수집된 닉네임은 PUBG API 호출에만 사용되며 별도로 저장하지 않습니다.</p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
                <div className="font-medium mb-1" style={{ color: "#F1F5F9" }}>Google AdSense</div>
                <p style={{ color: "#94A3B8" }}>본 서비스는 Google AdSense를 통해 광고를 게재합니다. Google은 쿠키를 사용하여 맞춤 광고를 제공할 수 있습니다. 광고 쿠키는 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "#F97316" }}>Google 개인정보처리방침</a>에 따라 처리됩니다.</p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
                <div className="font-medium mb-1" style={{ color: "#F1F5F9" }}>Google Analytics</div>
                <p style={{ color: "#94A3B8" }}>서비스 이용 통계 분석을 위해 Google Analytics를 사용합니다. 수집된 데이터는 익명으로 처리됩니다.</p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
                <div className="font-medium mb-1" style={{ color: "#F1F5F9" }}>Vercel</div>
                <p style={{ color: "#94A3B8" }}>본 서비스는 Vercel 플랫폼에서 운영됩니다. 서버 로그는 Vercel의 정책에 따라 처리됩니다.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>4. 쿠키 사용</h2>
            <p>본 서비스는 Google AdSense 광고 제공을 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 기능이 제한될 수 있습니다. Google의 광고 개인화를 거부하려면 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "#F97316" }}>Google 광고 설정</a>을 방문하세요.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>5. 정보 보유 기간</h2>
            <p>서버 로그는 최대 30일간 보관 후 자동 삭제됩니다. 별도의 사용자 데이터베이스를 운영하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>6. 이용자 권리</h2>
            <p>이용자는 언제든지 개인정보 관련 문의 및 삭제 요청을 할 수 있습니다. 문의는 하단의 이메일로 연락해주세요.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>7. 문의</h2>
            <p>개인정보처리방침에 관한 문의사항은 아래로 연락해주세요.</p>
            <div className="mt-3 rounded-lg p-4" style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}>
              <p style={{ color: "#94A3B8" }}>이메일: <a href="mailto:tmdfoqhdl030@gmail.com" className="underline hover:opacity-80" style={{ color: "#F97316" }}>tmdfoqhdl030@gmail.com</a></p>
              <p className="mt-1" style={{ color: "#94A3B8" }}>서비스명: 배틀그라운드 AI 전적검색 m249</p>
              <p className="mt-1" style={{ color: "#94A3B8" }}>운영 URL: https://m249.kr</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#F1F5F9" }}>8. 방침 변경</h2>
            <p>본 개인정보처리방침은 법령 또는 서비스 변경에 따라 업데이트될 수 있습니다. 변경 시 본 페이지 상단의 수정일을 통해 확인하실 수 있습니다.</p>
          </section>

        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t mt-16 py-8" style={{ borderColor: "#1E3A5F" }}>
        <div className="max-w-3xl mx-auto px-5 text-center text-xs" style={{ color: "#475569" }}>
          <p>© 2025 m249.kr. 본 서비스는 Krafton의 공식 서비스가 아닙니다.</p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/" className="hover:opacity-80" style={{ color: "#64748B" }}>홈</Link>
            <Link href="/about" className="hover:opacity-80" style={{ color: "#64748B" }}>서비스 소개</Link>
            <Link href="/privacy" className="hover:opacity-80" style={{ color: "#F97316" }}>개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
