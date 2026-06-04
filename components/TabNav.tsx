// 기능하는 탭 네비게이션 — 서버 컴포넌트, Link 기반 라우팅

import Link from "next/link";

const TABS = [
  { id: "overview",  label: "개요",      emoji: "📊" },
  { id: "matches",   label: "매치 기록", emoji: "⚔️" },
  { id: "stats",     label: "심층 분석", emoji: "🔬", highlight: true },
];

interface Props {
  activeTab: string;
  nickname: string;
  platform: string;
}

export default function TabNav({ activeTab, nickname, platform }: Props) {
  const base = `/player/${encodeURIComponent(nickname)}?platform=${platform}`;

  return (
    <div className="flex items-center gap-1">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={`${base}&tab=${tab.id}`}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
            style={
              isActive
                ? { backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }
                : tab.highlight && !isActive
                ? {
                    color: "#F97316",
                    backgroundColor: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.25)",
                  }
                : { color: "rgba(255,255,255,0.38)" }
            }
          >
            <span className="text-sm leading-none">{tab.emoji}</span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
