"use client";

/**
 * W21Mark — The Universal Mark  (SACRED · Rule 1)
 * ─────────────────────────────────────────────────────────────
 * A rounded square containing "W21" + a status dot. The mark is
 * sacred: proportions, border, type, and dot position NEVER change.
 * The ONLY variable across channels is COLOR (the dot + glow).
 *
 * Spec (relative to `size`, the square's outer width):
 *  • Square:            size × size, radius ≈ 11% of width
 *  • Border:            Grid White #F5F5F5, ~2.5px, ~65% opacity
 *  • Fill:              Terminal Black #0A0A0A
 *  • "W21" text:        JetBrains Mono Bold, ~62% of size, centered,
 *                       nudged slightly right of geometric center
 *  • Status dot:        ~6% of size, sits LEFT of "W", vertically centered,
 *                       filled with the channel color + soft radial glow
 *
 * Pixel values are computed from `size` so the mark scales perfectly
 * from 24px (ticker chips) to 96px+ (watermarks).
 */

import { type CSSProperties } from "react";
import { getChannel, type ChannelKey } from "@/lib/w21/channels";
import { cn } from "@/lib/utils";

export interface W21MarkProps {
  channel: ChannelKey;
  /** Outer width/height of the square, in pixels. Default 48. */
  size?: number;
  /** Render a soft pulsing LED glow around the status dot. Default true. */
  pulse?: boolean;
  /** Optional className passthrough. */
  className?: string;
  /** Override the channel color (rare — used for ghost / disabled states). */
  colorOverride?: string;
}

export function W21Mark({
  channel,
  size = 48,
  pulse = true,
  className,
  colorOverride,
}: W21MarkProps) {
  const { color } = getChannel(channel);
  const accent = colorOverride ?? color;

  // ── Derived pixel metrics ───────────────────────────────────
  const s = size;
  const radius = Math.max(2, s * 0.11);
  const borderWeight = Math.max(1.5, s * 0.045);
  const fontSize = s * 0.42; // visual height of the glyphs ≈ 62% of interior
  const dotSize = Math.max(3, s * 0.06);
  // The "W21" sits slightly right of center so the dot has breathing room on the left.
  const textLeftPad = s * 0.30;
  const glowRadius = s * 0.16;

  const squareStyle: CSSProperties = {
    width: s,
    height: s,
    borderRadius: radius,
    background: "#0A0A0A",
    border: `${borderWeight}px solid rgba(245, 245, 245, 0.65)`,
    boxSizing: "border-box",
    position: "relative",
    flexShrink: 0,
  };

  const textStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: textLeftPad,
    paddingRight: s * 0.08,
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
    fontWeight: 800,
    fontSize,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "#F5F5F5",
    pointerEvents: "none",
    // Optical baseline nudge so the W21 visually centers.
    transform: "translateY(-1.5%)",
  };

  const dotStyle: CSSProperties = {
    position: "absolute",
    width: dotSize,
    height: dotSize,
    borderRadius: "50%",
    background: accent,
    color: accent, // currentColor feeds the LED animation shadow
    left: s * 0.13,
    top: "50%",
    transform: "translateY(-50%)",
    boxShadow: `0 0 ${glowRadius}px ${glowRadius * 0.45}px ${accent}`,
  };

  return (
    <div
      className={cn("w21-mark", pulse && "is-pulsing", className)}
      style={squareStyle}
      aria-label={`W21 ${channel} mark`}
      role="img"
      data-channel={channel}
    >
      <span className={cn("w21-mark__dot", pulse && "w21-led")} style={dotStyle} />
      <span className="w21-mark__text" style={textStyle}>
        W21
      </span>
    </div>
  );
}

export default W21Mark;
