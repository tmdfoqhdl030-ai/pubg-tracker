"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, X, TrendingUp } from "lucide-react";

const POPULAR_NICKS = [
  "WakaQ", "StrangeR", "S1mple_KR", "ProGamers", "배그장인",
  "chicken_master", "TopFragger", "BattleKing"
];

export default function SearchBar() {
  const router = useRouter();
  const [soloNick, setSoloNick] = useState("");
  const [platform, setPlatform] = useState<"steam" | "kakao">("steam");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pubg-recent-searches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function saveRecent(nick: string) {
    const updated = [nick, ...recentSearches.filter(n => n !== nick)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("pubg-recent-searches", JSON.stringify(updated));
  }

  function go(nick: string) {
    saveRecent(nick);
    setFocused(false);
    router.push(`/player/${encodeURIComponent(nick.trim())}?platform=${platform}`);
  }

  function handleSoloSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!soloNick.trim()) return;
    go(soloNick.trim());
  }

  const showDropdown = focused && soloNick.length === 0 &&
    (recentSearches.length > 0 || POPULAR_NICKS.length > 0);

  return (
    <div ref={wrapRef} className="w-full max-w-xl mx-auto relative">
      <form onSubmit={handleSoloSearch} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value as "steam" | "kakao")}
            className="px-3 py-2.5 text-sm rounded-xl bg-white outline-none cursor-pointer flex-shrink-0"
            style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
          >
            <option value="steam">스팀</option>
            <option value="kakao">카카오</option>
          </select>
          <input
            ref={inputRef}
            type="text"
            value={soloNick}
            onChange={e => setSoloNick(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all bg-white placeholder-[#94A3B8]"
            style={{ border: `1px solid ${focused ? "#F97316" : "#E2E8F0"}`, color: "#0F172A" }}
            onFocus={() => setFocused(true)}
            autoComplete="off"
          />
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors flex-shrink-0"
            style={{ backgroundColor: "#F97316" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#EA6C10")}
            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#F97316")}
          >
            검색
          </button>
        </div>
      </form>

      {/* 드롭다운 */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-xl z-50"
          style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}
        >
          {/* 최근 검색 */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                <Clock size={11} style={{ color: "#94A3B8" }} />
                <span className="text-[10px] font-semibold" style={{ color: "#94A3B8" }}>최근 검색</span>
              </div>
              {recentSearches.map(nick => (
                <div key={nick} className="flex items-center gap-2 px-4 py-2 hover:bg-[#F8FAFC] transition-colors group">
                  <button
                    type="button"
                    className="flex-1 text-sm text-left font-medium"
                    style={{ color: "#0F172A" }}
                    onClick={() => go(nick)}
                  >
                    {nick}
                  </button>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const updated = recentSearches.filter(n => n !== nick);
                      setRecentSearches(updated);
                      localStorage.setItem("pubg-recent-searches", JSON.stringify(updated));
                    }}
                  >
                    <X size={12} style={{ color: "#94A3B8" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 인기 닉네임 */}
          <div style={{ borderTop: recentSearches.length > 0 ? "1px solid #F1F5F9" : "none" }}>
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
              <TrendingUp size={11} style={{ color: "#F97316" }} />
              <span className="text-[10px] font-semibold" style={{ color: "#94A3B8" }}>인기 검색</span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {POPULAR_NICKS.map(nick => (
                <button
                  key={nick}
                  type="button"
                  onClick={() => go(nick)}
                  className="text-xs px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: "#FFF7ED", color: "#F97316", border: "1px solid #FFEDD5" }}
                >
                  {nick}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
