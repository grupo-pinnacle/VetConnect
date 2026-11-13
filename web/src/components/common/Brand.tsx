import type { CSSProperties, MouseEvent, ReactNode } from "react";

export type IconName =
  | "arrow"
  | "calendar"
  | "camera"
  | "check"
  | "clock"
  | "close"
  | "heart"
  | "home"
  | "history"
  | "location"
  | "menu"
  | "message"
  | "bell"
  | "paw"
  | "plus"
  | "profile"
  | "shield"
  | "search"
  | "spark"
  | "star";

export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4m8-4v4M3 10h18m-13 4h3m2 0h3m-8 3h3" />
      </>
    ),
    camera: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="4" />
        <path d="m9 6 1.2-2h3.6L15 6m-6 6.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    heart: <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 8.5Z" />,
    home: <path d="m3 11 9-8 9 8m-2-2v12h-5v-6h-4v6H5V9" />,
    history: (
      <>
        <path d="M4 12a8 8 0 1 0 2-5.3L4 9" />
        <path d="M4 4v5h5m3-2v5l3 2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    menu: <path d="M4 8h16M4 16h16" />,
    message: (
      <>
        <path d="M4 5h16v12H9l-5 4V5Z" />
        <path d="M8 10h8m-8 3h5" />
      </>
    ),
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Zm-8 11h4" />,
    paw: (
      <>
        <ellipse cx="12" cy="15" rx="5" ry="4" />
        <circle cx="6.5" cy="10" r="2" />
        <circle cx="10" cy="6.5" r="2" />
        <circle cx="14" cy="6.5" r="2" />
        <circle cx="17.5" cy="10" r="2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.5-5 3-7 8-7s7.5 2 8 7" />
      </>
    ),
    shield: <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-5" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    spark: (
      <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Zm6 13 .8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16Z" />
    ),
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? "logo--light" : ""}`} aria-label="HuelliCam">
      <span className={`brand-mark ${light ? "brand-mark-light" : ""}`} aria-hidden="true" />
      <span className={light ? "brand-name brand-name-light" : "brand-name"}>
        Huelli<span>Cam</span>
      </span>
    </span>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`logo brand-link ${light ? "logo--light" : ""}`} href="/#inicio" aria-label="Huellicam, inicio">
      <Brand light={light} />
    </a>
  );
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  style,
}: {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "cream" | "ghost";
  className?: string;
  style?: CSSProperties;
}) {
  if (onClick && !href) {
    return (
      <button
        type="button"
        className={`button button--${variant} ${className}`}
        onClick={onClick}
        style={style}
      >
        <span>{children}</span>
        {variant !== "ghost" && <Icon name="arrow" />}
      </button>
    );
  }
  return (
    <a
      className={`button button--${variant} ${className}`}
      href={href || "#"}
      onClick={onClick}
      style={style}
    >
      <span>{children}</span>
      {variant !== "ghost" && <Icon name="arrow" />}
    </a>
  );
}
