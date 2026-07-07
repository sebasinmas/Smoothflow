import logoMark from "@/assets/favicon.svg";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
}

const markSizes: Record<LogoSize, string> = {
  sm: "size-9",
  md: "size-12",
  lg: "size-16",
};

const wordmarkSizes: Record<LogoSize, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ size = "md", showWordmark = false, className = "" }: LogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      role="img"
      aria-label="Smooth Flow"
    >
      <img
        src={logoMark}
        alt=""
        aria-hidden="true"
        className={`shrink-0 transition-transform duration-200 motion-safe:hover:scale-[1.02] ${markSizes[size]}`}
      />
      {showWordmark && (
        <span className={`font-bold text-brand-mark ${wordmarkSizes[size]}`}>Smooth Flow</span>
      )}
    </div>
  );
}
