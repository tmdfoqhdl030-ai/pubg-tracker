"use client";

import { getRoleColor } from "@/lib/utils";

interface Member {
  nickname: string;
  role: string;
}

interface Props {
  members: Member[];
}

export default function RoleDonutChart({ members }: Props) {
  const total = members.length;
  const roleCount: Record<string, number> = {};
  members.forEach(m => { roleCount[m.role] = (roleCount[m.role] ?? 0) + 1; });

  const roles = Object.entries(roleCount);
  const cx = 72; const cy = 72;
  const outerR = 60; const innerR = 38;
  let cumulativeAngle = -Math.PI / 2;

  const slices = roles.map(([role, count]) => {
    const fraction = count / total;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + fraction * 2 * Math.PI;
    cumulativeAngle = endAngle;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");

    return { role, count, path, color: getRoleColor(role) };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={144} height={144} viewBox="0 0 144 144">
        {/* 도넛 슬라이스 */}
        {slices.map(({ role, path, color }) => (
          <path key={role} d={path} fill={color} stroke="#fff" strokeWidth={3} />
        ))}
        {/* 가운데 흰 원 */}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="#fff" />
        {/* 가운데 텍스트 */}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#0F172A" fontSize={18} fontWeight="900">
          {total}명
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#94A3B8" fontSize={10} fontWeight="600">
          팀원
        </text>
      </svg>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {slices.map(({ role, color, count }) => (
          <div key={role} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs font-semibold" style={{ color: "#374151" }}>{role}</span>
            <span className="text-xs" style={{ color: "#94A3B8" }}>({count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
