export function SparkMascot({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 176"
      className={className}
      role="img"
      aria-label="Chispa, la mascota de electricidad"
    >
      <ellipse cx="80" cy="166" rx="38" ry="7" fill="rgb(36 49 64 / 0.16)" />
      <path
        d="M92 18 48 86h32l-10 62 56-78H96l14-52Z"
        fill="#c56a08"
        transform="translate(3 5)"
      />
      <path
        d="M92 18 48 86h32l-10 62 56-78H96l14-52Z"
        fill="url(#spark-body)"
      />
      <path
        d="M92 18 70 52c8 6 22 8 34-2L96 18Z"
        fill="url(#spark-shine)"
      />
      <circle cx="68" cy="78" r="7.5" fill="#243140" />
      <circle cx="96" cy="74" r="7.5" fill="#243140" />
      <circle cx="70.5" cy="75.5" r="2.4" fill="#fff" />
      <circle cx="98.5" cy="71.5" r="2.4" fill="#fff" />
      <circle cx="62" cy="88" r="4" fill="#ff8aa0" opacity="0.85" />
      <circle cx="104" cy="84" r="4" fill="#ff8aa0" opacity="0.85" />
      <path
        d="M74 96c6 8 18 8 24-1"
        fill="none"
        stroke="#243140"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M28 70 18 58M24 86 10 86M30 102 18 112"
        fill="none"
        stroke="#2fb8ae"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M132 62 144 50M136 80 150 80M130 98 144 110"
        fill="none"
        stroke="#f5b42a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="spark-body" x1="48" y1="18" x2="126" y2="148">
          <stop offset="0%" stopColor="#fff4b8" />
          <stop offset="42%" stopColor="#f5b42a" />
          <stop offset="100%" stopColor="#d47a0c" />
        </linearGradient>
        <linearGradient id="spark-shine" x1="70" y1="18" x2="100" y2="56">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
