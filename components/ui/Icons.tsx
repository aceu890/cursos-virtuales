import { useId, type ReactNode } from "react";

type IconProps = {
  className?: string;
};

type Tone = "clay" | "teal" | "sun" | "moon";

const TONES: Record<
  Tone,
  { body: [string, string, string]; deep: [string, string] }
> = {
  clay: {
    body: ["var(--icon-body-from)", "var(--icon-body-mid)", "var(--icon-body-to)"],
    deep: ["var(--icon-deep-from)", "var(--icon-deep-to)"],
  },
  teal: {
    body: ["#e8fffb", "#5ed9cf", "#1d8c85"],
    deep: ["#1a746d", "#0f4d48"],
  },
  sun: {
    body: ["#fff4b8", "#f5b42a", "#d47a0c"],
    deep: ["#c56a08", "#8a4306"],
  },
  moon: {
    body: ["#d7e4f2", "#6f86a0", "#2a3d52"],
    deep: ["#1d2d3d", "#121c28"],
  },
};

function ClayMark({
  className,
  tone = "clay",
  children,
}: IconProps & {
  tone?: Tone;
  children: (ids: { body: string; deep: string; shine: string }) => ReactNode;
}) {
  const raw = useId().replace(/:/g, "");
  const body = `${raw}-b`;
  const deep = `${raw}-d`;
  const shine = `${raw}-s`;
  const colors = TONES[tone];

  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-5 w-5"} aria-hidden>
      <defs>
        <linearGradient id={body} x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.body[0]} />
          <stop offset="42%" stopColor={colors.body[1]} />
          <stop offset="100%" stopColor={colors.body[2]} />
        </linearGradient>
        <linearGradient id={deep} x1="6" y1="6" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.deep[0]} />
          <stop offset="100%" stopColor={colors.deep[1]} />
        </linearGradient>
        <linearGradient id={shine} x1="7" y1="3" x2="14" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>{children({ body, deep, shine })}</g>
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <ClayMark className={className}>
      {({ body, deep, shine }) => (
        <>
          <path
            d="M12 3.8 21 11.2v7.3A2.2 2.2 0 0 1 18.8 20.7h-3.4v-5.1h-6.8v5.1H5.2A2.2 2.2 0 0 1 3 18.5v-7.3Z"
            fill={`url(#${deep})`}
            transform="translate(1.1 1.3)"
          />
          <path
            d="M12 3.8 21 11.2v7.3A2.2 2.2 0 0 1 18.8 20.7h-3.4v-5.1h-6.8v5.1H5.2A2.2 2.2 0 0 1 3 18.5v-7.3Z"
            fill={`url(#${body})`}
          />
          <path
            d="M12 5.2 19.2 11V12L12 6.4 4.8 12v-1Z"
            fill={`url(#${shine})`}
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconCatalog({ className }: IconProps) {
  return (
    <ClayMark className={className}>
      {({ body, deep, shine }) => (
        <>
          <path
            d="M6.2 3.8h11.6A2.3 2.3 0 0 1 20.1 6.1v13.2l-8.1-2.7-8.1 2.7V6.1A2.3 2.3 0 0 1 6.2 3.8Z"
            fill={`url(#${deep})`}
            transform="translate(1.1 1.3)"
          />
          <path
            d="M6.2 3.8h11.6A2.3 2.3 0 0 1 20.1 6.1v13.2l-8.1-2.7-8.1 2.7V6.1A2.3 2.3 0 0 1 6.2 3.8Z"
            fill={`url(#${body})`}
          />
          <path d="M7.4 5.4h9.2a.9.9 0 0 1 .9.9v2.2H6.5V6.3a.9.9 0 0 1 .9-.9Z" fill={`url(#${shine})`} />
        </>
      )}
    </ClayMark>
  );
}

export function IconBolt({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="teal">
      {({ body, deep, shine }) => (
        <>
          <path
            d="M13.2 2.8 5.6 13.2h5.1l-1.2 8 8.4-11.2h-5.1Z"
            fill={`url(#${deep})`}
            transform="translate(1.1 1.25)"
          />
          <path d="M13.2 2.8 5.6 13.2h5.1l-1.2 8 8.4-11.2h-5.1Z" fill={`url(#${body})`} />
          <path d="M12.6 4.4 8.2 12.2h2.4l-.3 1.6 2.2-5.4h-1.6Z" fill={`url(#${shine})`} />
        </>
      )}
    </ClayMark>
  );
}

export function IconOffline({ className }: IconProps) {
  return (
    <ClayMark className={className}>
      {({ body, deep }) => (
        <>
          <path
            d="M4.4 9.2a10.4 10.4 0 0 1 15.2 0"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            transform="translate(1 1.15)"
          />
          <path
            d="M4.4 9.2a10.4 10.4 0 0 1 15.2 0"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M7.6 12.6a6.4 6.4 0 0 1 8.8 0"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="12.6" cy="19" r="1.5" fill={`url(#${deep})`} />
          <circle cx="12" cy="18.3" r="1.5" fill={`url(#${body})`} />
          <path
            d="M5.4 18.8 18.6 5.4"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            transform="translate(0.9 1.05)"
          />
          <path
            d="M5.4 18.8 18.6 5.4"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="teal">
      {({ body, deep, shine }) => (
        <>
          <path
            d="M8.2 5.2v13.6l11-6.8Z"
            fill={`url(#${deep})`}
            transform="translate(1.05 1.2)"
          />
          <path d="M8.2 5.2v13.6l11-6.8Z" fill={`url(#${body})`} />
          <path d="M9.4 7.2v4.6l3.8-2.3Z" fill={`url(#${shine})`} />
        </>
      )}
    </ClayMark>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <ClayMark className={className}>
      {({ body, deep, shine }) => (
        <>
          <circle cx="12.6" cy="8.2" r="3.5" fill={`url(#${deep})`} />
          <path
            d="M5.4 19.8c1.5-3.4 4.4-5 6.6-5s5.1 1.6 6.6 5"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <circle cx="12" cy="7.6" r="3.5" fill={`url(#${body})`} />
          <path
            d="M5.4 19.8c1.5-3.4 4.4-5 6.6-5s5.1 1.6 6.6 5"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <circle cx="10.8" cy="6.6" r="1.2" fill={`url(#${shine})`} />
        </>
      )}
    </ClayMark>
  );
}

export function IconInstall({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="teal">
      {({ body, deep }) => (
        <>
          <path
            d="M12 3.6v9.4"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.8"
            strokeLinecap="round"
            transform="translate(1 1.15)"
          />
          <path
            d="M8 10.2 12 14.4 16 10.2"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(1 1.15)"
          />
          <path
            d="M5.2 19.4h13.6"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.8"
            strokeLinecap="round"
            transform="translate(1 1.15)"
          />
          <path d="M12 3.6v9.4" fill="none" stroke={`url(#${body})`} strokeWidth="2.8" strokeLinecap="round" />
          <path
            d="M8 10.2 12 14.4 16 10.2"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.2 19.4h13.6"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconLessons({ className }: IconProps) {
  return (
    <ClayMark className={className}>
      {({ body, deep, shine }) => (
        <>
          <path
            d="M6.4 4h11.2A2.2 2.2 0 0 1 19.8 6.2v12.6L12 16.2 4.2 18.8V6.2A2.2 2.2 0 0 1 6.4 4Z"
            fill={`url(#${deep})`}
            transform="translate(1.1 1.25)"
          />
          <path
            d="M6.4 4h11.2A2.2 2.2 0 0 1 19.8 6.2v12.6L12 16.2 4.2 18.8V6.2A2.2 2.2 0 0 1 6.4 4Z"
            fill={`url(#${body})`}
          />
          <path d="M7.6 5.6h8.8a.8.8 0 0 1 .8.8v2H6.8v-2a.8.8 0 0 1 .8-.8Z" fill={`url(#${shine})`} />
        </>
      )}
    </ClayMark>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <ClayMark className={className}>
      {({ body, deep, shine }) => (
        <>
          <circle cx="12.7" cy="12.8" r="8" fill={`url(#${deep})`} />
          <circle cx="12" cy="12" r="8" fill={`url(#${body})`} />
          <circle cx="10.6" cy="9.8" r="3.2" fill={`url(#${shine})`} />
          <path
            d="M12 7.4V12l3.1 2.1"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="sun">
      {({ body, deep, shine }) => (
        <>
          <circle cx="12.7" cy="12.8" r="4.1" fill={`url(#${deep})`} />
          <circle cx="12" cy="12" r="4.1" fill={`url(#${body})`} />
          <circle cx="10.8" cy="10.6" r="1.4" fill={`url(#${shine})`} />
          <path
            d="M12 3.6v1.8M12 18.6v1.8M3.6 12h1.8M18.6 12h1.8M6.1 6.1l1.3 1.3M16.6 16.6l1.3 1.3M6.1 17.9l1.3-1.3M16.6 7.4l1.3-1.3"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconMoon({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="moon">
      {({ body, deep, shine }) => (
        <>
          <path
            d="M14.2 4.4A7.6 7.6 0 1 0 19.4 14 6.2 6.2 0 0 1 14.2 4.4Z"
            fill={`url(#${deep})`}
            transform="translate(1.05 1.2)"
          />
          <path
            d="M14.2 4.4A7.6 7.6 0 1 0 19.4 14 6.2 6.2 0 0 1 14.2 4.4Z"
            fill={`url(#${body})`}
          />
          <circle cx="11.2" cy="9.4" r="1.5" fill={`url(#${shine})`} />
        </>
      )}
    </ClayMark>
  );
}

export function IconExpand({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="moon">
      {({ body, deep, shine }) => (
        <>
          <path
            d="M5 10.2V5.4H9.8M14.2 5.4H19V10.2M19 13.8V18.6H14.2M9.8 18.6H5V13.8"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0.9 1)"
          />
          <path
            d="M5 10.2V5.4H9.8M14.2 5.4H19V10.2M19 13.8V18.6H14.2M9.8 18.6H5V13.8"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.4 6.2h3.2V5.6"
            fill="none"
            stroke={`url(#${shine})`}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconCompress({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="moon">
      {({ body, deep, shine }) => (
        <>
          <path
            d="M9.6 5.2v4.6H5M19 9.8h-4.6V5.2M14.4 18.8v-4.6H19M5 14.2h4.6v4.6"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0.9 1)"
          />
          <path
            d="M9.6 5.2v4.6H5M19 9.8h-4.6V5.2M14.4 18.8v-4.6H19M5 14.2h4.6v4.6"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.2 9.2h2.6"
            fill="none"
            stroke={`url(#${shine})`}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconLab({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="teal">
      {({ body, deep, shine }) => (
        <>
          <path
            d="M9.2 3.4h5.6v2.2l3.6 11.2A2.6 2.6 0 0 1 15.9 20.4H8.1A2.6 2.6 0 0 1 5.6 16.8L9.2 5.6Z"
            fill={`url(#${deep})`}
            transform="translate(0.7 0.9)"
          />
          <path
            d="M9.2 3.4h5.6v2.2l3.6 11.2A2.6 2.6 0 0 1 15.9 20.4H8.1A2.6 2.6 0 0 1 5.6 16.8L9.2 5.6Z"
            fill={`url(#${body})`}
          />
          <path d="M8.4 14.2h7.2l.7 2.2H7.7Z" fill={`url(#${shine})`} />
          <path
            d="M9.6 4.6h4.8v1.4H9.6Z"
            fill={`url(#${deep})`}
            opacity="0.45"
          />
        </>
      )}
    </ClayMark>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <ClayMark className={className}>
      {({ body, deep }) => (
        <>
          <path
            d="M10.1 3.5h3.8l.4 2.2 2-.8 2.7 2.7-.8 2 2.2.4v3.8l-2.2.4.8 2-2.7 2.7-2-.8-.4 2.2h-3.8l-.4-2.2-2 .8-2.7-2.7.8-2-2.2-.4V10l2.2-.4-.8-2 2.7-2.7 2 .8.4-2.2Z"
            fill={`url(#${deep})`}
            transform="translate(0.7 0.85)"
          />
          <path
            d="M10.1 3.5h3.8l.4 2.2 2-.8 2.7 2.7-.8 2 2.2.4v3.8l-2.2.4.8 2-2.7 2.7-2-.8-.4 2.2h-3.8l-.4-2.2-2 .8-2.7-2.7.8-2-2.2-.4V10l2.2-.4-.8-2 2.7-2.7 2 .8.4-2.2Z"
            fill={`url(#${body})`}
          />
          <circle cx="12.6" cy="12.7" r="2.35" fill={`url(#${deep})`} />
          <circle cx="12" cy="12" r="2.35" fill="var(--sidebar)" />
        </>
      )}
    </ClayMark>
  );
}

export function IconProgress({ className }: IconProps) {
  return (
    <ClayMark className={className} tone="teal">
      {({ body, deep, shine }) => (
        <>
          <circle
            cx="12.6"
            cy="12.7"
            r="7.2"
            fill="none"
            stroke={`url(#${deep})`}
            strokeWidth="3.1"
          />
          <circle
            cx="12"
            cy="12"
            r="7.2"
            fill="none"
            stroke={`url(#${body})`}
            strokeWidth="3.1"
            strokeDasharray="32 14"
            strokeLinecap="round"
            transform="rotate(-90 12 12)"
          />
          <circle cx="12" cy="4.8" r="1.35" fill={`url(#${shine})`} />
        </>
      )}
    </ClayMark>
  );
}
