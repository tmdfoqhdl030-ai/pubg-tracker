"use client";

import { useState } from "react";
import { Share2, Check, Copy, MessageSquare } from "lucide-react";

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  const copyShareText = async () => {
    const url = window.location.href;
    const nick = decodeURIComponent(url.split("/player/")[1]?.split("?")[0] ?? "");
    const text = `🎮 ${nick} 배그 AI 전적 분석 결과\n► ${url}\n\nm249.kr — 무료 배틀그라운드 AI 전적검색`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: open ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.08)",
          color: open ? "#F97316" : "rgba(255,255,255,0.55)",
          border: open ? "1px solid rgba(249,115,22,0.3)" : "1px solid transparent",
        }}
      >
        <Share2 size={11} />
        공유
      </button>

      {open && (
        <>
          {/* 배경 클릭으로 닫기 */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-9 z-20 rounded-xl overflow-hidden w-52 shadow-xl"
            style={{ backgroundColor: "#0F2A40", border: "1px solid #1E3A5F" }}
          >
            {/* 링크 복사 */}
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-left hover:bg-[#162f49] transition-colors"
              style={{ color: copied ? "#22C55E" : "#CBD5E1" }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "복사됨!" : "링크 복사"}
            </button>

            {/* 커뮤니티 공유용 텍스트 복사 */}
            <button
              onClick={copyShareText}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-left hover:bg-[#162f49] transition-colors"
              style={{
                color: "#CBD5E1",
                borderTop: "1px solid #1E3A5F",
              }}
            >
              <MessageSquare size={13} />
              <div className="text-left">
                <div>커뮤니티 공유용 복사</div>
                <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>에브리타임·디시 바로 붙여넣기</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
