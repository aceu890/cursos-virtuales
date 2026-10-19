import { useId } from "react";

export const CHART_PALETTES = [
  { light: "#b8fff4", mid: "#2fb8ae", deep: "#1a7a74", side: "#0d4541" },
  { light: "#e4e8f6", mid: "#7d8bb8", deep: "#4a5678", side: "#2c3348" },
  { light: "#d5e6f2", mid: "#5d7d9a", deep: "#355268", side: "#1f3140" },
] as const;

type Slice = {
  id: string;
  title: string;
  value: number;
};

const CX = 80;
const CY = 78;
const INNER = 38;
const OUTER = 60;
const CAP = 27;
const DX = 5;
const DY = 7;
const LAYERS = 6;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function fmt(n: number) {
  return n.toFixed(2);
}

function donutPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  sweep: number,
) {
  if (sweep <= 0) return "";
  const clamped = Math.min(sweep, 359.999);
  const large = clamped > 180 ? 1 : 0;
  const a0 = polar(cx, cy, outer, start);
  const a1 = polar(cx, cy, outer, start + clamped);
  const b1 = polar(cx, cy, inner, start + clamped);
  const b0 = polar(cx, cy, inner, start);
  return `M${fmt(a0.x)} ${fmt(a0.y)} A${outer} ${outer} 0 ${large} 1 ${fmt(a1.x)} ${fmt(a1.y)} L${fmt(b1.x)} ${fmt(b1.y)} A${inner} ${inner} 0 ${large} 0 ${fmt(b0.x)} ${fmt(b0.y)} Z`;
}

function arcBand(
  cx: number,
  cy: number,
  r: number,
  start: number,
  sweep: number,
  dx: number,
  dy: number,
) {
  if (sweep <= 0) return "";
  const clamped = Math.min(sweep, 359.999);
  const large = clamped > 180 ? 1 : 0;
  const a0 = polar(cx, cy, r, start);
  const a1 = polar(cx, cy, r, start + clamped);
  return `M${fmt(a0.x)} ${fmt(a0.y)} A${r} ${r} 0 ${large} 1 ${fmt(a1.x)} ${fmt(a1.y)} L${fmt(a1.x + dx)} ${fmt(a1.y + dy)} A${r} ${r} 0 ${large} 0 ${fmt(a0.x + dx)} ${fmt(a0.y + dy)} Z`;
}

function cutFace(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  deg: number,
  dx: number,
  dy: number,
) {
  const a = polar(cx, cy, inner, deg);
  const b = polar(cx, cy, outer, deg);
  return `M${fmt(a.x)} ${fmt(a.y)} L${fmt(b.x)} ${fmt(b.y)} L${fmt(b.x + dx)} ${fmt(b.y + dy)} L${fmt(a.x + dx)} ${fmt(a.y + dy)} Z`;
}

function mixHex(a: string, b: string, t: number) {
  const pa = a.slice(1);
  const pb = b.slice(1);
  const ch = (i: number) => {
    const va = Number.parseInt(pa.slice(i, i + 2), 16);
    const vb = Number.parseInt(pb.slice(i, i + 2), 16);
    return Math.round(va + (vb - va) * t)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

export function DonutChart3D({
  slices,
  center,
}: {
  slices: Slice[];
  center: number | string;
}) {
  const raw = useId().replace(/:/g, "");
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const active = slices.filter((slice) => slice.value > 0);
  const gap = active.length > 1 ? 8 : 0;
  let cursor = gap / 2;

  const prepared = slices.map((slice, index) => {
    const palette = CHART_PALETTES[index % CHART_PALETTES.length];
    const sweep =
      total === 0 ? 0 : (slice.value / total) * (360 - gap * slices.length);
    const start = cursor;
    cursor += sweep + gap;
    return { ...slice, start, sweep, palette };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="donut-3d">
        <svg viewBox="0 0 160 160" className="donut-3d-svg" aria-hidden>
          <defs>
            {prepared.map((slice) => (
              <linearGradient
                key={`${slice.id}-g`}
                id={`${raw}-${slice.id}`}
                x1="28"
                y1="18"
                x2="128"
                y2="138"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={slice.palette.light} />
                <stop offset="38%" stopColor={slice.palette.mid} />
                <stop offset="100%" stopColor={slice.palette.deep} />
              </linearGradient>
            ))}
            <linearGradient
              id={`${raw}-shine`}
              x1="36"
              y1="16"
              x2="100"
              y2="88"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={`${raw}-cap`}
              x1={CX - 10}
              y1={CY - 12}
              x2={CX + 10}
              y2={CY + 12}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="var(--icon-body-from)" />
              <stop offset="48%" stopColor="var(--chart-cap)" />
              <stop offset="100%" stopColor="var(--chart-cap-deep)" />
            </linearGradient>
          </defs>

          {prepared.map((slice) =>
            slice.sweep > 0 ? (
              <g key={`${slice.id}-wall`}>
                <path
                  d={arcBand(CX, CY, OUTER, slice.start, slice.sweep, DX, DY)}
                  fill={slice.palette.side}
                />
                <path
                  d={arcBand(CX, CY, INNER, slice.start, slice.sweep, DX, DY)}
                  fill={mixHex(slice.palette.side, slice.palette.deep, 0.35)}
                />
                {gap > 0 ? (
                  <>
                    <path
                      d={cutFace(CX, CY, INNER, OUTER, slice.start, DX, DY)}
                      fill={mixHex(slice.palette.side, slice.palette.deep, 0.2)}
                    />
                    <path
                      d={cutFace(
                        CX,
                        CY,
                        INNER,
                        OUTER,
                        slice.start + slice.sweep,
                        DX,
                        DY,
                      )}
                      fill={mixHex(slice.palette.deep, slice.palette.mid, 0.25)}
                    />
                  </>
                ) : null}
              </g>
            ) : null,
          )}

          {prepared.map((slice) =>
            slice.sweep > 0
              ? Array.from({ length: LAYERS }, (_, layer) => {
                  const t = (layer + 1) / LAYERS;
                  return (
                    <path
                      key={`${slice.id}-l${layer}`}
                      d={donutPath(
                        CX,
                        CY,
                        INNER,
                        OUTER,
                        slice.start,
                        slice.sweep,
                      )}
                      fill={mixHex(slice.palette.side, slice.palette.mid, t)}
                      transform={`translate(${DX * (1 - t)} ${DY * (1 - t)})`}
                    />
                  );
                })
              : null,
          )}

          {prepared.map((slice) =>
            slice.sweep > 0 ? (
              <g key={`${slice.id}-top`}>
                <path
                  d={donutPath(CX, CY, INNER, OUTER, slice.start, slice.sweep)}
                  fill={`url(#${raw}-${slice.id})`}
                />
                <path
                  d={donutPath(
                    CX,
                    CY,
                    INNER + 3,
                    OUTER - 3,
                    slice.start,
                    slice.sweep,
                  )}
                  fill={`url(#${raw}-shine)`}
                />
                <path
                  d={donutPath(CX, CY, INNER, OUTER, slice.start, slice.sweep)}
                  fill="none"
                  stroke="rgb(255 255 255 / 0.45)"
                  strokeWidth="1.5"
                />
              </g>
            ) : null,
          )}
          <circle cx={CX + 1.2} cy={CY + 1.8} r={CAP} fill="var(--chart-cap-deep)" />
          <circle cx={CX} cy={CY} r={CAP} fill={`url(#${raw}-cap)`} />
          <circle
            cx={CX - 7}
            cy={CY - 8}
            r="8"
            fill="#ffffff"
            fillOpacity="0.5"
          />
          <text
            x={CX}
            y={CY + 6}
            textAnchor="middle"
            className="fill-foreground text-[18px] font-semibold"
          >
            {center}
          </text>
        </svg>
      </div>
      <ul className="space-y-3 text-sm">
        {prepared.map((slice) => (
          <li key={slice.id} className="flex items-center gap-3">
            <span
              className="legend-3d"
              style={{
                background: `linear-gradient(160deg, ${slice.palette.light} 0%, ${slice.palette.mid} 48%, ${slice.palette.deep} 100%)`,
              }}
              aria-hidden
            />
            <span>
              {slice.title}: {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressBar3D({
  value,
  max,
  label,
  now,
}: {
  value: number;
  max: number;
  label?: string;
  now?: number;
}) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="bar-track-3d"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={now ?? value}
      aria-label={label}
    >
      {pct > 0 ? (
        <div className="bar-fill-3d" style={{ width: `${pct}%` }} />
      ) : null}
    </div>
  );
}
