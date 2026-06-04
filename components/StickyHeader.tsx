"use client";
// 프로필 배너가 뷰포트를 벗어나면 슬라이드 인되는 고정 미니 헤더

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

interface Props {
  nickname: string;
  platform: string;
  activeTab: string;
  kda?: number;
  winRate?: number;
  tierColor?: string;
  tierLabel?: string;
}

export default function StickyHeader({
  nickname,
  platform,
  activeTab,
  kda,
  winRate,
  tierColor,
  tierLabel,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const banner = document.getElementById("profile-banner");
    if (!banner) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  const base = `/player/${encodeURIComponent(nickname)}?platform=${platform}`;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        backgroundColor: "rgba(13,17,23,0.96)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-11 flex items-center justify-between">
        {/* 왼쪽: 플레이어 정보 */}
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
            style={{
              backgroundColor: tierColor ? `${tierColor}25` : "#1E293B",
              border: `1px solid ${tierColor ?? "rgba(255,255,255,0.12)"}`,
            }}
          >
            {nickname[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-bold text-white">{nickname}</span>
          {tierLabel && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded hidden sm:inline"
              style={{
                backgroundColor: `${tierColor}18`,
                color: tierColor,
                border: `1px solid ${tierColor}35`,
              }}
            >
              {tierLabel}
            </span>
          )}
          {kda !== undefined && (
            <span className="text-xs font-bold hidden sm:inline" style={{ color: tierColor ?? "#fff" }}>
              KDA {kda.toFixed(2)}
            </span>
          )}
          {winRate !== undefined && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              승률 <span className="font-semibold text-white">{winRate.toFixed(1)}%</span>
            </span>
          )}
        </div>

        {/* 오른쪽: 탭 + 버튼 */}
        <div className="flex items-center gap-2">
          {[
            { id: "overview", label: "개요" },
            { id: "matches",  label: "매치" },
            { id: "stats",    label: "심층분석" },
          ].map((t) => (
            <Link
              key={t.id}
              href={`${base}&tab=${t.id}`}
              className="text-[11px] font-medium px-2.5 py-1 rounded transition-all"
              style={
                activeTab === t.id
                  ? { backgroundColor: "rgba(255,255,255,0.12)", color: "#fff" }
                  : { color: "rgba(255,255,255,0.35)" }
              }
            >
              {t.label}
            </Link>
          ))}
          <Link
            href={`${base}&tab=${activeTab}`}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
            style={{ backgroundColor: "#0EA5E9", color: "#fff" }}
          >
            <RotateCcw size={10} />갱신
          </Link>
        </div>
      </div>
    </div>
  );
}
