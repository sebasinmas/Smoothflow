import type { ReactNode } from "react";
import { Tooltip, TooltipTrigger } from "react-aria-components";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface AppTooltipProps {
  content: ReactNode;
  children: ReactNode;
  isDisabled?: boolean;
  placement?: TooltipPlacement;
  className?: string;
}

export function AppTooltip({
  content,
  children,
  isDisabled = false,
  placement = "top",
  className = "",
}: AppTooltipProps) {
  if (isDisabled) {
    return <>{children}</>;
  }

  return (
    <TooltipTrigger delay={400}>
      {children}
      <Tooltip
        offset={6}
        placement={placement}
        className={`z-popover max-w-xs rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-text shadow-lg entering:animate-in entering:fade-in ${className}`}
      >
        {content}
      </Tooltip>
    </TooltipTrigger>
  );
}
