"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { type PlayStyleKey, PLAY_STYLES } from "@/lib/play-style";
import DiagnosisShareModal from "./DiagnosisShareModal";

interface SeasonData {
  kda: number; winRate: number; avgDamage: number;
  headshotRate: number; topTenRate: number; gamesPlayed: number;
}

interface Props {
  styleKey: PlayStyleKey;
  season?: SeasonData | null;
  nickname?: string;
}

// ── 특성 바 계산 ───────────────────────────────────────────────────────
function computeTraits(season?: SeasonData | null) {
  if (!season) return { aggression: 60, survival: 50, precision: 45 };
  return {
    aggression: Math.min(100, Math.round(season.kda * 20)),
    survival:   Math.min(100, Math.round(season.topTenRate * 2)),
    precision:  Math.min(100, Math.round(season.headshotRate * 2.5)),
  };
}

// ── 특성 게이지 바 ────────────────────────────────────────────────────
function TraitBar({ emoji, label, value, color }: { emoji: string; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm flex-shrink-0 w-5">{emoji}</span>
      <span className="text-xs font-semibold flex-shrink-0 w-10" style={{ color: "#374151" }}>{label}</span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <span className="text-xs font-black flex-shrink-0 w-9 text-right" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

// ── 개선 포인트 카드 ──────────────────────────────────────────────────
const TIP_EMOJIS = ["🎯", "🛡️", "👥"];
function TipCard({ idx, text, color }: { idx: number; text: string; color: string }) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-xl"
      style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
      <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-sm font-black"
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
        <span style={{ fontSize: "13px" }}>{TIP_EMOJIS[idx] ?? "💡"}</span>
      </div>
      <span className="text-xs leading-snug" style={{ color: "#64748B" }}>{text}</span>
    </div>
  );
}

// ── 유형 선택 버튼 (배지 형태) ───────────────────────────────────────
const ALL_KEYS: PlayStyleKey[] = [
  "eagle","reaper","destroyer","commander","spy","chicken","sniper","breaker",
  "shadow","charger","maniac","faker","ghost","minefield","joker","driver",
  "turtle","assault","allrounder","survivor","rookie",
];

// ── 메인 ─────────────────────────────────────────────────────────────
export default function AIDiagnosisCard({ styleKey, season, nickname = "" }: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState<PlayStyleKey | null>(null);

  const cfg = PLAY_STYLES[previewKey ?? styleKey] ?? PLAY_STYLES["rookie"];
  const traits = computeTraits(season);
  const isPreview = previewKey !== null;

  return (
    <>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>

        {/* ══ 플레이 스타일 배너 ═══════════════════════════════════════ */}
        <div className="relative overflow-hidden px-5 py-4"
          style={{ background: cfg.gradient, boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.1)" }}>
          {/* 배경 글로우 원 */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* AI 배지 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span className="text-[10px]">✨</span>
                <span className="text-[10px] font-black text-white tracking-wide">AI 플레이 진단</span>
              </div>
              {isPreview && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
                  미리보기
                </span>
              )}
            </div>
            {/* 공유 버튼 */}
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:bg-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <Share2 size={9} />
              공유
            </button>
          </div>

          {/* 플레이 스타일 타이틀 */}
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-4xl leading-none">{cfg.emoji}</span>
              <div>
                <div className="text-2xl font-black text-white leading-none">{cfg.name}</div>
                <div className="text-xs font-medium mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {cfg.subtitle}
                </div>
              </div>
            </div>
            {/* 우측 스탯 미니 뱃지 */}
            {season && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-black text-white bg-white/20 px-2 py-0.5 rounded-full">
                  KDA {season.kda.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold text-white/70">
                  딜량 {Math.round(season.avgDamage).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ══ 요약 멘트 ══════════════════════════════════════════════════ */}
        <div className="px-4 py-3" style={{ backgroundColor: cfg.bgColor, borderBottom: "1px solid #F1F5F9" }}>
          <p className="text-xs leading-relaxed font-medium" style={{ color: "#374151" }}>
            <span className="text-lg leading-none mr-1" style={{ color: cfg.color }}>&ldquo;</span>
            {cfg.summary}
            <span className="text-lg leading-none ml-1" style={{ color: cfg.color }}>&rdquo;</span>
          </p>
        </div>

        {/* ══ 플레이 특성 게이지 ═════════════════════════════════════════ */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-1 h-3.5 rounded-full" style={{ backgroundColor: cfg.color }} />
            <span className="text-xs font-bold" style={{ color: "#0F172A" }}>플레이 특성 분석</span>
          </div>
          <div className="space-y-2">
            <TraitBar emoji="🔥" label="공격성" value={traits.aggression} color="#F97316" />
            <TraitBar emoji="🛡️"  label="생존력" value={traits.survival}   color="#22C55E" />
            <TraitBar emoji="🎯" label="정밀도" value={traits.precision}  color="#8B5CF6" />
          </div>
        </div>

        {/* ══ 개선 포인트 ════════════════════════════════════════════════ */}
        {cfg.improvements.length > 0 && (
          <div className="px-4 pt-2 pb-3" style={{ borderTop: "1px solid #F1F5F9" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1 h-3.5 rounded-full" style={{ backgroundColor: "#94A3B8" }} />
              <span className="text-xs font-bold" style={{ color: "#0F172A" }}>개선 포인트</span>
            </div>
            <div className="space-y-1.5">
              {cfg.improvements.slice(0, 3).map((tip, i) => (
                <TipCard key={i} idx={i} text={tip} color={cfg.color} />
              ))}
            </div>
          </div>
        )}

        {/* ══ 다른 유형 탐색 (아코디언) ═══════════════════════════════════ */}
        <div style={{ borderTop: "1px solid #F1F5F9" }}>
          <details className="group">
            <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none list-none"
              style={{ color: "#64748B" }}>
              <span className="text-[11px] font-semibold">🔍 다른 유형 둘러보기 (21종)</span>
              <span className="text-[10px] group-open:rotate-180 transition-transform" style={{ color: "#94A3B8" }}>▼</span>
            </summary>
            <div className="px-3 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {ALL_KEYS.map((k) => {
                  const s = PLAY_STYLES[k];
                  const active = (previewKey ?? styleKey) === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setPreviewKey(active ? null : k)}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all"
                      style={{
                        backgroundColor: active ? s.color : "#F1F5F9",
                        color: active ? "#fff" : "#374151",
                        border: active ? `1px solid ${s.color}` : "1px solid transparent",
                      }}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>
              {isPreview && (
                <button
                  onClick={() => setPreviewKey(null)}
                  className="mt-2 text-[10px] font-semibold px-2 py-1 rounded-full w-full"
                  style={{ backgroundColor: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                >
                  ← 내 실제 유형으로 돌아가기
                </button>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* ══ 공유 모달 ══════════════════════════════════════════════════ */}
      <DiagnosisShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        styleDef={PLAY_STYLES[styleKey]}
        season={season}
        nickname={nickname}
      />
    </>
  );
}
