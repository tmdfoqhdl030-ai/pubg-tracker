import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { GUIDES, getGuide } from "@/lib/guides";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "공략을 찾을 수 없습니다 — m249.kr" };
  return {
    title: `${guide.title} — m249.kr 배그 공략`,
    description: guide.description,
    alternates: { canonical: `https://m249.kr/guide/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      publishedTime: guide.publishedAt,
    },
  };
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  // JSON-LD (구조화 데이터 — SEO/검색 노출)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    author: { "@type": "Organization", name: "m249.kr" },
    publisher: { "@type": "Organization", name: "m249.kr" },
    mainEntityOfPage: `https://m249.kr/guide/${guide.slug}`,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B2A", color: "#E8EDF2" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 헤더 */}
      <header className="border-b" style={{ borderColor: "#1E3A5F" }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-2 text-sm">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="m249 로고" width={28} height={28} style={{ borderRadius: 6 }} />
            <span className="font-bold" style={{ color: "#E8EDF2" }}>m249.kr</span>
          </Link>
          <span style={{ color: "#475569" }}>/</span>
          <Link href="/guide" className="hover:opacity-80" style={{ color: "#94A3B8" }}>공략 가이드</Link>
        </div>
      </header>

      {/* 본문 */}
      <article className="max-w-3xl mx-auto px-5 pt-10 pb-12">
        {/* 카테고리 / 메타 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{guide.emoji}</span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#F9731620", color: "#FB923C", border: "1px solid #F9731640" }}
          >
            {guide.category}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-4" style={{ color: "#F1F5F9" }}>
          {guide.title}
        </h1>

        <div className="flex items-center gap-1.5 text-xs mb-8" style={{ color: "#64748B" }}>
          <Clock size={12} />
          <span>약 {guide.readMinutes}분</span>
          <span>·</span>
          <span>{guide.publishedAt}</span>
        </div>

        {/* 인트로 */}
        <p
          className="text-sm sm:text-base leading-8 mb-10 pb-8"
          style={{ color: "#CBD5E1", borderBottom: "1px solid #1E3A5F" }}
        >
          {guide.intro}
        </p>

        {/* 섹션 */}
        <div className="space-y-9">
          {guide.sections.map((sec, i) => (
            <Fragment key={i}>
              <section>
                {sec.heading && (
                  <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: "#F1F5F9" }}>
                    {sec.heading}
                  </h2>
                )}
                {sec.paragraphs?.map((p, j) => (
                  <p key={j} className="text-sm sm:text-[15px] leading-8 mb-4" style={{ color: "#B6C2D1" }}>
                    {p}
                  </p>
                ))}
                {sec.list && (
                  <ul className="space-y-2.5 mt-3">
                    {sec.list.map((item, k) => (
                      <li key={k} className="flex gap-2.5 text-sm leading-7" style={{ color: "#B6C2D1" }}>
                        <ChevronRight size={16} className="flex-shrink-0 mt-1" style={{ color: "#F97316" }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {/* 2번째 섹션 이후 인라인 CTA */}
              {i === 1 && guide.sections.length > 3 && (
                <div
                  className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
                  style={{ backgroundColor: "#0F2A40", border: "1px solid #F97316AA" }}
                >
                  <p className="text-sm font-medium leading-6" style={{ color: "#CBD5E1" }}>
                    📊 내 실제 수치가 궁금하다면?
                  </p>
                  <Link
                    href="/"
                    className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap"
                    style={{ backgroundColor: "#F97316", color: "#fff" }}
                  >
                    전적 바로 확인
                  </Link>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* CTA — 전적 검색 유도 */}
        <div
          className="mt-12 rounded-2xl p-6 text-center"
          style={{ background: "linear-gradient(135deg, #F9731618, #0F2A40)", border: "1px solid #1E3A5F" }}
        >
          <p className="text-base font-bold mb-2" style={{ color: "#F1F5F9" }}>
            내 전적을 데이터로 점검해보세요
          </p>
          <p className="text-sm leading-6 mb-4" style={{ color: "#94A3B8" }}>
            닉네임 하나로 KDA·딜량·헤드샷률·플레이 스타일을 AI가 분석해드립니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: "#F97316" }}
          >
            전적 검색하러 가기
            <ChevronRight size={15} />
          </Link>
        </div>
      </article>

      {/* 관련 글 */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <h2 className="text-sm font-bold mb-4" style={{ color: "#94A3B8" }}>다른 공략 더 보기</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {related.map((g) => (
            <Link
              key={g.slug}
              href={`/guide/${g.slug}`}
              className="rounded-xl p-4 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}
            >
              <span className="text-xl">{g.emoji}</span>
              <h3 className="text-xs font-bold mt-2 leading-snug" style={{ color: "#E8EDF2" }}>{g.title}</h3>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/guide" className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80" style={{ color: "#F97316" }}>
            <ArrowLeft size={14} />공략 가이드 전체 보기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t py-8" style={{ borderColor: "#1E3A5F" }}>
        <div className="max-w-3xl mx-auto px-5 text-center text-xs" style={{ color: "#475569" }}>
          <p>© 2025 m249.kr. 본 서비스는 Krafton의 공식 서비스가 아닙니다.</p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/" className="hover:opacity-80" style={{ color: "#64748B" }}>홈</Link>
            <Link href="/guide" className="hover:opacity-80" style={{ color: "#F97316" }}>공략 가이드</Link>
            <Link href="/about" className="hover:opacity-80" style={{ color: "#64748B" }}>서비스 소개</Link>
            <Link href="/privacy" className="hover:opacity-80" style={{ color: "#64748B" }}>개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
