"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface HackData { suspicionScore: number; suspicionLevel: string; error?: string; }
interface HealData { style: string; totalHeals: number; error?: string; }
interface BulletData { efficiencyScore: number; bestWeapon: string; error?: string; }
interface FarmData { farmingStyle: string; hotZones: { name: string; pct: number }[]; error?: string; }
interface CareData { title: string; gamesWithLoot: number; gamesAnalyzed: number; error?: string; }

const HACK_COLOR: Record<string, string> = {
  정상: "#22C55E", 의심: "#F59E0B", 강한의심: "#F97316", 핵의심: "#EF4444",
};
// 생존 스타일 → 공격성 수치 (0~100)
const HEAL_AGGRESSION: Record<string, number> = {
  무모형: 95, 공격형: 78, 균형형: 50, 존버형: 25, 극생존형: 10,
};
const HEAL_COLOR: Record<string, string> = {
  공격형: "#EF4444", 존버형: "#3B82F6", 균형형: "#22C55E", 극생존형: "#22C55E", 무모형: "#F97316",
};
const FARM_CFG: Record<string, { emoji: string; color: string }> = {
  핫드랍형: { emoji: "🔥", color: "#EF4444" },
  외곽파밍형: { emoji: "🌿", color: "#22C55E" },
  중간지역형: { emoji: "⚡", color: "#3B82F6" },
};

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Row({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="text-sm w-5 flex-shrink-0 text-center">{icon}</span>
      <span
        className="text-[11px] font-medium flex-shrink-0 w-[72px]"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0">{children}</div>
    </div>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
      style={{ backgroundColor: `${color}25`, color }}
    >
      {children}
    </span>
  );
}

function Dim({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] flex-shrink-0 truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
      {children}
    </span>
  );
}

export default function TelemetryHighlightBar({
  nickname,
  platform,
}: {
  nickname: string;
  platform: string;
}) {
  const [hack, setHack] = useState<HackData | null>(null);
  const [heal, setHeal] = useState<HealData | null>(null);
  const [bullet, setBullet] = useState<BulletData | null>(null);
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [care, setCare] = useState<CareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [noMatches, setNoMatches] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const enc = encodeURIComponent(nickname);
    const p = platform;

    Promise.allSettled([
      fetch(`${base}/api/v1/hack-score?nickname=${enc}&platform=${p}`).then(r => r.ok ? r.json() : { error: "FAILED" }).catch(() => ({ error: "FAILED" })),
      fetch(`${base}/api/v1/heal-pattern?nickname=${enc}&platform=${p}`).then(r => r.ok ? r.json() : { error: "FAILED" }).catch(() => ({ error: "FAILED" })),
      fetch(`${base}/api/v1/bullet-efficiency?nickname=${enc}&platform=${p}`).then(r => r.ok ? r.json() : { error: "FAILED" }).catch(() => ({ error: "FAILED" })),
      fetch(`${base}/api/v1/farming-heatmap?nickname=${enc}&platform=${p}`).then(r => r.ok ? r.json() : { error: "FAILED" }).catch(() => ({ error: "FAILED" })),
      fetch(`${base}/api/v1/carepackage?nickname=${enc}&platform=${p}`).then(r => r.ok ? r.json() : { error: "FAILED" }).catch(() => ({ error: "FAILED" })),
    ]).then(([h, he, b, f, c]) => {
      if (cancelled) return;
      const hv = h.status === "fulfilled" ? h.value : null;
      const hev = he.status === "fulfilled" ? he.value : null;
      const bv = b.status === "fulfilled" ? b.value : null;
      const fv = f.status === "fulfilled" ? f.value : null;
      const cv = c.status === "fulfilled" ? c.value : null;

      setHack(hv);
      setHeal(hev);
      setBullet(bv);
      setFarm(fv);
      setCare(cv);

      const hasNoMatches = [hv, hev, bv, fv, cv].some(x => x?.error === "NO_RECENT_MATCHES");
      setNoMatches(hasNoMatches);
      setFailed(!hv && !hev && !bv && !fv && !cv);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [nickname, platform]);

  const statsUrl = `/player/${encodeURIComponent(nickname)}?platform=${platform}&tab=stats`;
  const hasValidHack = hack && !hack.error;
  const hasValidHeal = heal && !heal.error;
  const hasValidBullet = bullet && !bullet.error;
  const hasValidFarm = farm && !farm.error;
  const hasValidCare = care && !care.error;

  const hackColor = hasValidHack ? (HACK_COLOR[hack.suspicionLevel] ?? "#22C55E") : "#64748B";
  const healColor = hasValidHeal ? (HEAL_COLOR[heal.style] ?? "#64748B") : "#64748B";
  const healAggression = hasValidHeal ? (HEAL_AGGRESSION[heal.style] ?? 50) : 0;
  const farmCfg = hasValidFarm ? (FARM_CFG[farm.farmingStyle] ?? { emoji: "⚡", color: "#3B82F6" }) : null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0D1117 0%, #1A1F2E 100%)",
        border: "1px solid rgba(249,115,22,0.25)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🔬</span>
          <span className="text-sm font-bold text-white">심층 분석 요약</span>
          {!loading && !failed && !noMatches && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#22C55E", color: "#fff" }}>
              LIVE
            </span>
          )}
          {(failed || noMatches) && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>
              {noMatches ? "분석 불가" : "API 미연결"}
            </span>
          )}
        </div>
        <Link
          href={statsUrl}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
          style={{ backgroundColor: "#F97316", color: "#fff" }}
        >
          전체 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="px-4 py-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-5 h-4 rounded bg-white/10" />
              <div className="w-16 h-3 rounded bg-white/10" />
              <div className="flex-1 h-1.5 rounded-full bg-white/10" />
              <div className="w-10 h-4 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : failed || noMatches ? (
        <div className="px-4 py-6 text-center space-y-2">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.4" }}>
            {noMatches
              ? "최근 14일간 게임 플레이 기록이 없어 실시간 심층 분석을 제공할 수 없습니다."
              : "서버가 혼잡하거나 PUBG API 한도를 초과하여 심층 분석을 불러올 수 없습니다."}
          </p>
          {!noMatches && (
            <Link href={statsUrl} className="text-xs underline" style={{ color: "#F97316" }}>
              전체 분석 탭에서 확인하기
            </Link>
          )}
        </div>
      ) : (
        <div>
          <Row icon="🔍" label="핵 의심 지수">
            {hasValidHack ? (
              <>
                <MiniBar pct={hack.suspicionScore} color={hackColor} />
                <span className="text-xs font-bold flex-shrink-0" style={{ color: hackColor }}>
                  {hack.suspicionScore}점
                </span>
                <Pill color={hackColor}>{hack.suspicionLevel}</Pill>
              </>
            ) : (
              <Dim>데이터 없음</Dim>
            )}
          </Row>

          <Row icon="💊" label="생존 스타일">
            {hasValidHeal ? (
              <>
                <MiniBar pct={healAggression} color={healColor} />
                <span className="text-xs font-bold flex-shrink-0" style={{ color: healColor }}>
                  {heal.style}
                </span>
                <Dim>힐 {heal.totalHeals}회</Dim>
              </>
            ) : (
              <Dim>데이터 없음</Dim>
            )}
          </Row>

          <Row icon="🎯" label="탄약 효율">
            {hasValidBullet ? (
              <>
                <MiniBar pct={bullet.efficiencyScore} color="#3B82F6" />
                <span className="text-xs font-bold flex-shrink-0" style={{ color: "#3B82F6" }}>
                  {bullet.efficiencyScore}점
                </span>
                <Dim>{bullet.bestWeapon}</Dim>
              </>
            ) : (
              <Dim>데이터 없음</Dim>
            )}
          </Row>

          <Row icon="🗺" label="파밍 스타일">
            {hasValidFarm && farmCfg ? (
              <>
                <span className="text-sm flex-shrink-0">{farmCfg.emoji}</span>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: farmCfg.color }}>
                  {farm.farmingStyle}
                </span>
                {farm.hotZones.length > 0 && (
                  <Dim>주요: {farm.hotZones[0].name}</Dim>
                )}
              </>
            ) : (
              <Dim>데이터 없음</Dim>
            )}
          </Row>

          <Row icon="📦" label="케어패키지">
            {hasValidCare ? (
              <>
                <MiniBar
                  pct={care.gamesAnalyzed > 0 ? (care.gamesWithLoot / care.gamesAnalyzed) * 100 : 0}
                  color="#F97316"
                />
                <span className="text-xs font-bold flex-shrink-0" style={{ color: "#F97316" }}>
                  {care.gamesWithLoot}회
                </span>
                <Dim>{care.title}</Dim>
              </>
            ) : (
              <Dim>데이터 없음</Dim>
            )}
          </Row>
        </div>
      )}
    </div>
  );
}
