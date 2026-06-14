"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [soloNick, setSoloNick] = useState("");
  const [platform, setPlatform] = useState<"steam" | "kakao">("steam");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pubg-recent-searches");
    if (stored) {
      setTimeout(() => {
        setRecentSearches(JSON.parse(stored));
      }, 0);
    }
  }, []);

  function saveRecent(nick: string) {
    const updated = [nick, ...recentSearches.filter((n) => n !== nick)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("pubg-recent-searches", JSON.stringify(updated));
  }

  function handleSoloSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!soloNick.trim()) return;
    saveRecent(soloNick.trim());
    router.push(`/player/${encodeURIComponent(soloNick.trim())}?platform=${platform}`);
  }

  const inputCls = "w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all bg-white placeholder-[#94A3B8]";
  const inputStyle = { border: "1px solid #E2E8F0", color: "#0F172A" };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSoloSearch} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as "steam" | "kakao")}
            className="px-3 py-2.5 text-sm rounded-xl bg-white outline-none cursor-pointer"
            style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
          >
            <option value="steam">스팀</option>
            <option value="kakao">카카오</option>
          </select>
          <input
            ref={inputRef}
            type="text"
            value={soloNick}
            onChange={(e) => setSoloNick(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className={inputCls + " flex-1"}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#F97316")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
            style={{ backgroundColor: "#F97316" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#EA6C10")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "#F97316")}
          >
            검색
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Clock size={11} style={{ color: "#94A3B8" }} />
            <span className="text-xs" style={{ color: "#94A3B8" }}>최근:</span>
            {recentSearches.map((nick) => (
              <button
                key={nick}
                type="button"
                onClick={() => setSoloNick(nick)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white transition-colors"
                style={{ color: "#64748B", border: "1px solid #E2E8F0" }}
              >
                {nick}
                <X
                  size={10}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    const updated = recentSearches.filter((n) => n !== nick);
                    setRecentSearches(updated);
                    localStorage.setItem("pubg-recent-searches", JSON.stringify(updated));
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
