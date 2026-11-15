import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "blue" | "green" | "danger" | "warning";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={["ui-badge", tone !== "neutral" ? `ui-badge--${tone}` : "", className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
