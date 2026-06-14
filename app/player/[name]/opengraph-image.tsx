import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const nickname = decodeURIComponent(name);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0D1117 0%, #161B27 60%, #0F172A 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 배경 글로우 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
          }}
        />

        {/* 로고 + 브랜드 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "#F97316",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "#fff", fontWeight: 900,
          }}>M</div>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>m249.kr</span>
        </div>

        {/* 닉네임 */}
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: "#F1F5F9",
          letterSpacing: -2,
          marginBottom: 16,
          textAlign: "center",
          maxWidth: 900,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {nickname}
        </div>

        {/* 서브 라벨 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 40,
        }}>
          <div style={{
            background: "rgba(249,115,22,0.15)",
            border: "1px solid rgba(249,115,22,0.4)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 18,
            color: "#FB923C",
            fontWeight: 700,
          }}>
            ✨ AI 플레이 진단
          </div>
          <div style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
          }}>
            배틀그라운드 전적검색
          </div>
        </div>

        {/* CTA */}
        <div style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 1,
        }}>
          m249.kr 에서 내 전적도 분석해보세요
        </div>
      </div>
    ),
    { ...size }
  );
}
