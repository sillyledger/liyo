interface LogoProps {
  className?: string;
}

/** The Liyo mark — a shaded isometric cube ("a box of your things"). */
export function Logo({ className = "h-[30px] w-[30px]" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 L34 14 L20 22 L6 14 Z" fill="#5EC97A" />
      <path d="M6 14 L20 22 L20 36 L6 28 Z" fill="#2C7B45" />
      <path d="M34 14 L20 22 L20 36 L34 28 Z" fill="#3E9F5B" />
      <path
        d="M20 6 L34 14 L20 22 L6 14 Z"
        stroke="#0F1509"
        strokeWidth={1}
        strokeLinejoin="round"
        opacity={0.35}
      />
    </svg>
  );
}