import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Focusable, Tooltip, TooltipTrigger } from "react-aria-components";

type FocusableChild = ComponentProps<typeof Focusable>["children"];

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface AppTooltipProps {
  content: ReactNode;
  children: ReactElement;
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
      <Focusable>{children as FocusableChild}</Focusable>
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
