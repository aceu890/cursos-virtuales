"use client";

export function LiveRing({ active }: { active?: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <svg
      className="node-live-ring"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect
        x="2.4"
        y="2.4"
        width="95.2"
        height="95.2"
        rx="6"
        fill="none"
        stroke="#f6d15e"
        strokeWidth="3.2"
        strokeDasharray="8 6"
        pathLength="100"
        vectorEffect="non-scaling-stroke"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="14"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}
