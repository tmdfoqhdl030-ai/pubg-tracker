"use client";

import { useEffect, useRef, useState } from "react";
import { X, Link2, Check, Download } from "lucide-react";
import type { PlayStyleDef } from "@/lib/play-style";

interface SeasonData {
  kda: number;
  avgDamage: number;
  winRate: number;
  headshotRate: number;
  topTenRate: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  styleDef: PlayStyleDef;
  season?: SeasonData | null;
  nickname?: string;
}

// ── 공유 카드 이미지 생성 (Canvas) ───────────────────────────────────────
function generateShareCardImage(
  styleDef: PlayStyleDef,
  season: SeasonData | null,
  nickname: string
): string {
  const W = 400, H = 560;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2; // HiDPI
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // ── 배경 그라디언트 ──
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, styleDef.gradientFrom);
  grd.addColorStop(1, styleDef.gradientTo);
  ctx.fillStyle = grd;
  ctx.roundRect(0, 0, W, H, 20);
  ctx.fill();

  // ── 반투명 오버레이 원 ──
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(W - 40, -40, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-20, H + 20, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── PUBG TRACKER 로고 ──
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 11px -apple-system, sans-serif";
  ctx.fillText("🎮  펍지고 (PubgGo)", 28, 42);

  // ── 이모지 ──
  ctx.font = "72px serif";
  ctx.fillText(styleDef.emoji, 28, 165);

  // ── 유형 이름 ──
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px -apple-system, sans-serif";
  ctx.fillText(styleDef.name, 28, 220);

  // ── 서브타이틀 ──
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "15px -apple-system, sans-serif";
  ctx.fillText(styleDef.subtitle, 30, 248);

  // ── 구분선 ──
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, 272);
  ctx.lineTo(W - 28, 272);
  ctx.stroke();

  // ── 요약 텍스트 (줄바꿈 처리) ──
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "13px -apple-system, sans-serif";
  const words = styleDef.summary.split(" ");
  let line = "";
  let y = 298;
  const maxW = W - 56;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, 28, y);
      line = w;
      y += 20;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, 28, y);

  // ── 스탯 박스들 ──
  if (season) {
    const stats = [
      { label: "KDA", value: season.kda.toFixed(2) },
      { label: "평균딜", value: Math.round(season.avgDamage).toLocaleString() },
      { label: "승률", value: `${season.winRate.toFixed(1)}%` },
    ];
    const boxW = (W - 56 - 12) / 3;
    const boxY = 380;
    stats.forEach((s, i) => {
      const bx = 28 + i * (boxW + 6);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.roundRect(bx, boxY, boxW, 64, 10);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "10px -apple-system, sans-serif";
      ctx.fillText(s.label, bx + boxW / 2 - ctx.measureText(s.label).width / 2, boxY + 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px -apple-system, sans-serif";
      ctx.fillText(s.value, bx + boxW / 2 - ctx.measureText(s.value).width / 2, boxY + 46);
    });
  }

  // ── 닉네임 ──
  if (nickname) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "12px -apple-system, sans-serif";
    ctx.fillText(`📌 ${nickname}의 플레이 유형`, 28, H - 50);
  }

  // ── 하단 URL ──
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "11px -apple-system, sans-serif";
  ctx.fillText("pubg-tracker.vercel.app", 28, H - 28);

  canvas.width = W * 2;
  canvas.height = H * 2;
  return canvas.toDataURL("image/png");
}

// ── 메인 ─────────────────────────────────────────────────────────────────
export default function DiagnosisShareModal({
  open, onClose, styleDef, season, nickname = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 카드 이미지 생성
  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      setImgLoading(true);
    }, 0);
    // 약간 딜레이 후 canvas 생성 (모달 열린 뒤)
    const t = setTimeout(() => {
      try {
        const src = generateShareCardImage(styleDef, season ?? null, nickname);
        setImgSrc(src);
      } catch (e) {
        console.error("share card gen failed", e);
      }
      setImgLoading(false);
    }, 60);
    return () => clearTimeout(t);
  }, [open, styleDef, season, nickname]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;

  // ── 링크 복사 ──
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const inp = document.createElement("input");
      inp.value = window.location.href;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand("copy");
      document.body.removeChild(inp);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── X(트위터) 공유 ──
  const shareToX = () => {
    const text = `나의 PUBG 플레이 유형은 "${styleDef.emoji} ${styleDef.name}" — ${styleDef.subtitle}\n\n전적 분석 → `;
    const url = encodeURIComponent(window.location.href);
    const tweet = encodeURIComponent(text);
    window.open(`https://x.com/intent/post?text=${tweet}&url=${url}`, "_blank");
  };

  // ── 이미지 저장 ──
  const downloadImage = () => {
    if (!imgSrc) return;
    const a = document.createElement("a");
    a.href = imgSrc;
    a.download = `pubg-${styleDef.name}-${nickname || "player"}.png`;
    a.click();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0F172A", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <div className="text-sm font-black text-white">내 플레이 유형 공유</div>
            <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              친구에게 자랑해보세요!
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <X size={13} color="rgba(255,255,255,0.5)" />
          </button>
        </div>

        {/* ── 공유 카드 미리보기 ── */}
        <div className="px-5 pt-4 pb-3">
          <div className="rounded-xl overflow-hidden"
            style={{ aspectRatio: "400/280", position: "relative" }}>
            {/* 그라디언트 배경 (미리보기) */}
            <div className="absolute inset-0 rounded-xl"
              style={{ background: styleDef.gradient }} />
            <div className="absolute inset-0 rounded-xl"
              style={{ background: "rgba(0,0,0,0.15)" }} />

            {/* 카드 컨텐츠 */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <div className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                🎮 펍지고 (PubgGo)
              </div>
              <div>
                <div className="text-4xl mb-1">{styleDef.emoji}</div>
                <div className="text-2xl font-black text-white leading-none">{styleDef.name}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {styleDef.subtitle}
                </div>
                {season && (
                  <div className="flex gap-2 mt-3">
                    {[
                      { label: "KDA", value: season.kda.toFixed(2) },
                      { label: "딜", value: Math.round(season.avgDamage).toLocaleString() },
                      { label: "승률", value: `${season.winRate.toFixed(1)}%` },
                    ].map((s) => (
                      <div key={s.label} className="px-2 py-1 rounded-lg text-center"
                        style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                        <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
                        <div className="text-[11px] font-black text-white">{s.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                pubg-tracker.vercel.app
              </div>
            </div>
          </div>
        </div>

        {/* ── 공유 버튼들 ── */}
        <div className="px-5 pb-5 space-y-2">
          {/* 링크 복사 */}
          <button onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
              color: copied ? "#22C55E" : "rgba(255,255,255,0.8)",
              border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
            }}>
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            {copied ? "링크 복사됨!" : "링크 복사"}
          </button>

          {/* X(트위터) 공유 */}
          <button onClick={shareToX}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: "#1A1A1A", color: "#ffffff", border: "1px solid #333" }}>
            <span className="text-sm font-black leading-none">𝕏</span>
            X에 공유하기
          </button>

          {/* 이미지 저장 */}
          <button onClick={downloadImage}
            disabled={imgLoading || !imgSrc}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: imgLoading || !imgSrc
                ? "rgba(255,255,255,0.04)"
                : `linear-gradient(135deg, ${styleDef.gradientFrom}, ${styleDef.gradientTo})`,
              color: imgLoading || !imgSrc ? "rgba(255,255,255,0.3)" : "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            <Download size={14} />
            {imgLoading ? "카드 생성 중..." : "이미지로 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
