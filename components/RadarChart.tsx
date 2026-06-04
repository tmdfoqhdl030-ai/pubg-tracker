interface RadarAxis { label: string; value: number; }
interface Props { axes: RadarAxis[]; size?: number; color?: string; }

export default function RadarChart({ axes, size = 200, color = "#F97316" }: Props) {
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.35, labelR = maxR * 1.32;
  const n = axes.length;

  const angle = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;
  const pt = (i: number, frac: number) => ({
    x: cx + maxR * frac * Math.cos(angle(i)),
    y: cy + maxR * frac * Math.sin(angle(i)),
  });
  const polyStr = (frac: number) =>
    Array.from({ length: n }, (_, i) => { const p = pt(i, frac); return `${p.x.toFixed(2)},${p.y.toFixed(2)}`; }).join(" ");

  const dataFracs = axes.map((a) => Math.max(0.05, a.value / 100));
  const dataStr = dataFracs.map((frac, i) => { const p = pt(i, frac); return `${p.x.toFixed(2)},${p.y.toFixed(2)}`; }).join(" ");

  const textAnchor = (i: number) => {
    const x = cx + labelR * Math.cos(angle(i));
    if (Math.abs(x - cx) < 10) return "middle";
    return x > cx ? "start" : "end";
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[1, 2, 3, 4].map((l) => (
        <polygon key={l} points={polyStr(l / 4)} fill="none" stroke="#E2E8F0" strokeWidth={l === 4 ? 1 : 0.7} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const end = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E2E8F0" strokeWidth="0.7" />;
      })}
      <polygon points={dataStr} fill={`${color}20`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {dataFracs.map((frac, i) => {
        const p = pt(i, frac);
        return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />;
      })}
      {axes.map((axis, i) => {
        const a = angle(i);
        const lx = (cx + labelR * Math.cos(a)).toFixed(2);
        const ly1 = (cy + labelR * Math.sin(a) - 4).toFixed(2);
        const ly2 = (cy + labelR * Math.sin(a) + 7).toFixed(2);
        const anchor = textAnchor(i);
        return (
          <g key={i}>
            <text x={lx} y={ly1} textAnchor={anchor} fontSize="9" fill="#64748B" fontFamily="system-ui, sans-serif" fontWeight="500">{axis.label}</text>
            <text x={lx} y={ly2} textAnchor={anchor} fontSize="8.5" fill={color} fontFamily="system-ui, sans-serif" fontWeight="600">{Math.round(axis.value)}</text>
          </g>
        );
      })}
    </svg>
  );
}
