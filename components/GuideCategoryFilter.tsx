"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Guide } from "@/lib/guides";

const ALL = "전체";

export default function GuideCategoryFilter({ guides }: { guides: Guide[] }) {
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = [ALL];
    guides.forEach((g) => {
      if (!seen.has(g.category)) { seen.add(g.category); cats.push(g.category); }
    });
    return cats;
  }, [guides]);

  const [active, setActive] = useState(ALL);

  const filtered = active === ALL ? guides : guides.filter((g) => g.category === active);

  return (
    <>
      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={
              active === cat
                ? { backgroundColor: "#F97316", color: "#fff" }
                : { backgroundColor: "#0F2A40", color: "#94A3B8", border: "1px solid #1E3A5F" }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 글 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}`}
            className="rounded-xl p-5 transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{g.emoji}</span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#F9731620", color: "#FB923C", border: "1px solid #F9731640" }}
              >
                {g.category}
              </span>
            </div>
            <h2 className="text-base font-bold mb-2 leading-snug" style={{ color: "#F1F5F9" }}>
              {g.title}
            </h2>
            <p className="text-xs leading-6 mb-3" style={{ color: "#94A3B8" }}>
              {g.description}
            </p>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#64748B" }}>
              <Clock size={11} />
              <span>약 {g.readMinutes}분</span>
              <span>·</span>
              <span>{g.publishedAt}</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm py-12" style={{ color: "#475569" }}>
          해당 카테고리의 공략이 없습니다.
        </p>
      )}
    </>
  );
}
