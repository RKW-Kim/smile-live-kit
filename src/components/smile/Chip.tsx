"use client";

/**
 * Chip — pill-shaped label (smile.co.ke design language)
 * ─────────────────────────────────────────────────────────────
 * Three variants:
 *  • dark   — panel bg, hairline border, paper text (default)
 *  • ghost  — translucent yellow tint + yellow border + yellow text
 *  • solid  — yellow fill, ink text
 *
 * Used everywhere: header pills, ticker chips, scene status tags,
 * alert boxes. Manrope 700, uppercase, letter-spaced.
 */

import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChipVariant = "dark" | "ghost" | "solid";

export interface ChipProps {
  variant?: ChipVariant;
  children: ReactNode;
  className?: string;
  /** Optional icon node rendered before the text. */
  icon?: ReactNode;
  /** Override the accent color (rare — usually token-driven). */
  accent?: string;
  style?: CSSProperties;
}

export function Chip({
  variant = "dark",
  children,
  className,
  icon,
  accent,
  style,
}: ChipProps) {
  const vars: Record<ChipVariant, CSSProperties> = {
    dark: {
      background: "var(--panel, #141414)",
      border: "1px solid var(--line, #2a2a2a)",
      color: "var(--paper, #ffffff)",
    },
    ghost: {
      background: "rgba(255,193,7,0.10)",
      border: `1px solid ${accent ?? "var(--yellow, #FFC107)"}`,
      color: accent ?? "var(--yellow, #FFC107)",
    },
    solid: {
      background: accent ?? "var(--yellow, #FFC107)",
      border: `1px solid ${accent ?? "var(--yellow, #FFC107)"}`,
      color: "var(--ink, #0a0a0a)",
    },
  };

  return (
    <span
      className={cn("chip", `chip--${variant}`, className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 999,
        fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        ...vars[variant],
        ...style,
      }}
    >
      {icon && <span className="chip__icon" aria-hidden style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
}

export default Chip;
