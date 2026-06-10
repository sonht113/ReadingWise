import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 36, text: "text-2xl" },
  lg: { icon: 56, text: "text-4xl" },
};

export function Logo({ size = "md", className }: LogoProps) {
  const { icon, text: textSize } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-grad-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="logo-grad-right" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d="M6 8C6 6.89543 6.89543 6 8 6H18C18 6 20 8 24 14M6 8V38C6 39.1046 6.89543 40 8 40H18L24 38.5M6 8L16 14L6 19.5V8Z"
          stroke="url(#logo-grad-left)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#logo-grad-left)"
          fillOpacity="0.12"
        />
        <path
          d="M42 8C42 6.89543 41.1046 6 40 6H30C30 6 28 8 24 14M42 8V38C42 39.1046 41.1046 40 40 40H30L24 38.5M42 8L32 14L42 19.5V8Z"
          stroke="url(#logo-grad-right)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#logo-grad-right)"
          fillOpacity="0.08"
        />
        <path
          d="M24 14V38.5"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
        <path
          d="M24 14C28 8 30 6 40 6"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        <path
          d="M24 14C20 8 18 6 8 6"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
      </svg>
      <span
        className={cn("font-heading font-semibold tracking-tight text-foreground", textSize)}
      >
        ReadingWise
      </span>
    </div>
  );
}
