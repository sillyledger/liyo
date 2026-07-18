/**
 * Fixed isometric desk scene for the Workspace card — same for every user,
 * not generated or seeded. Matches the "collectible shelf" line-icon
 * personality used elsewhere (see the homepage hero's shelf tiles).
 */
export function WorkspaceIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="220" height="100" className="fill-sea/15" />

      {/* desk */}
      <polygon points="10,78 210,78 190,60 30,60" className="fill-umber-light" />
      <polygon points="10,78 210,78 210,86 10,86" className="fill-umber-deep" />

      {/* monitor */}
      <rect x="70" y="28" width="66" height="42" rx="4" className="fill-umber-deep" />
      <rect x="76" y="34" width="54" height="30" rx="2" className="fill-sea-deep" />
      <rect x="100" y="68" width="6" height="10" className="fill-umber-deep" />
      <rect x="92" y="76" width="22" height="4" rx="2" className="fill-umber-deep" />

      {/* mug */}
      <rect
        x="28"
        y="52"
        width="16"
        height="16"
        rx="3"
        className="fill-sea stroke-umber-deep"
        strokeWidth="1.6"
      />
      <path
        d="M44 56q8 2 0 8"
        fill="none"
        className="stroke-umber-deep"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* plant */}
      <polygon points="176,70 200,70 196,84 180,84" className="fill-umber-deep" />
      <ellipse cx="188" cy="54" rx="14" ry="10" className="fill-sea-deep" />
      <ellipse cx="180" cy="61" rx="10" ry="8" className="fill-sea" />
      <ellipse cx="196" cy="61" rx="10" ry="7" className="fill-sea" />
    </svg>
  );
}
