"use client";

/**
 * W21Lockup — Full horizontal identity lockup
 * ─────────────────────────────────────────────────────────────
 *   `[● W21 square]  |  CHANNEL NAME`
 *
 *  • Mark:        W21Mark (sacred)
 *  • Pipe:        thin vertical line in the channel color,
 *                 height ≈ 65% of the square, vertically centered
 *  • Channel name: JetBrains Mono Medium, Grid White #F5F5F5,
 *                 wide letter-spacing, vertically centered.
 *                 (Rule 3: the name is ALWAYS white.)
 */

import { type CSSProperties } from "react";
import { getChannel, type ChannelKey } from "@/lib/w21/channels";
import { cn } from "@/lib/utils";
import { W21Mark } from "./W21Mark";

export interface W21LockupProps {
  channel: ChannelKey;
  /** Outer width/height of the W21Mark square, in pixels. Default 48. */
  size?: number;
  /** Pulsing LED on the status dot. Default true. */
  pulse?: boolean;
  /** Letter-spacing for the channel name, in em. Default 0.18. */
  tracking?: number;
  /** Optional className passthrough. */
  className?: string;
  /** Hide the channel name (mark + pipe only). Default false. */
  nameHidden?: boolean;
}

export function W21Lockup({
  channel,
  size = 48,
  pulse = true,
  tracking = 0.18,
  className,
  nameHidden = false,
}: W21LockupProps) {
  const { color, name } = getChannel(channel);

  // Pipe sits between mark and name; height ≈ 65% of the square.
  const pipeHeight = size * 0.65;
  const pipeWidth = Math.max(1.5, size * 0.04);
  const gap = size * 0.22;
  const nameSize = size * 0.34;

  const pipeStyle: CSSProperties = {
    width: pipeWidth,
    height: pipeHeight,
    background: color,
    boxShadow: `0 0 8px ${color}55`,
    flexShrink: 0,
  };

  const nameStyle: CSSProperties = {
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
    fontWeight: 500,
    fontSize: nameSize,
    letterSpacing: `${tracking}em`,
    color: "#F5F5F5",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <div
      className={cn("w21-lockup inline-flex items-center", className)}
      style={{ gap }}
      aria-label={`W21 ${name}`}
    >
      <W21Mark channel={channel} size={size} pulse={pulse} />
      <div className="w21-lockup__pipe" style={pipeStyle} aria-hidden />
      {!nameHidden && (
        <span className="w21-lockup__name" style={nameStyle}>
          {name}
        </span>
      )}
    </div>
  );
}

export default W21Lockup;
