import type { ReactNode } from "react";
import { Tooltip, TooltipTrigger } from "react-aria-components";

interface AppTooltipProps {
  content: string;
  children: ReactNode;
}

export function AppTooltip({ content, children }: AppTooltipProps) {
  return (
    <TooltipTrigger delay={400}>
      {children}
      <Tooltip
        offset={6}
        className="z-popover max-w-xs rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-text shadow-lg entering:animate-in entering:fade-in"
      >
        {content}
      </Tooltip>
    </TooltipTrigger>
  );
}
