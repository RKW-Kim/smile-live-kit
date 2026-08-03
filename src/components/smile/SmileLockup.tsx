"use client";

/**
 * SmileLockup — SmileMark + wordmark
 * ─────────────────────────────────────────────────────────────
 *   `[smile face]  wordmark`
 *
 *  • Mark:        SmileMark (sacred, always yellow)
 *  • Wordmark:    Manrope 800, lowercase by convention,
 *                 rendered in --paper (white).
 *  • Optional     `accent` stripe under the wordmark (small yellow
 *                 bar) for emphasis in headers / scene lower-bars.
 */

import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { SmileMark } from "./SmileMark";
import { getBrand, type SmileBrandId } from "@/lib/smile/channels";

export interface SmileLockupProps {
  /** Channel/brand id — drives the wordmark text + accent. */
  brand?: SmileBrandId;
  /** Override the wordmark text (rare — usually brand-driven). */
  wordmark?: string;
  /** Outer width/height of the SmileMark, in pixels. Default 48. */
  size?: number;
  /** Wordmark font-size override. Default = size × 0.55. */
  fontSize?: number;
  /** Show a small accent stripe under the wordmark. Default false. */
  accent?: boolean;
  /** Soft yellow pulse glow behind the mark. Default false. */
  pulse?: boolean;
  /** Optional className passthrough. */
  className?: string;
  /** Lock to a SmileMark mood. */
  mood?: "idle" | "blink" | "wink" | "smirk" | "look" | "nod" | "spin" | "bounce" | "celebrate" | "shake";
}

export function SmileLockup({
  brand = "smile",
  wordmark,
  size = 48,
  fontSize,
  accent = false,
  pulse = false,
  className,
  mood,
}: SmileLockupProps) {
  const b = getBrand(brand);
  const text = wordmark ?? b.wordmark;
  const fs = fontSize ?? Math.max(11, size * 0.55);
  const gap = Math.max(6, size * 0.18);

  const wordmarkStyle: CSSProperties = {
    fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
    fontWeight: 800,
    fontSize: fs,
    letterSpacing: "-0.01em",
    color: "var(--paper, #ffffff)",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <span
      className={cn("smile-lockup inline-flex items-center", className)}
      style={{ gap }}
      aria-label={`Smile ${text} lockup`}
    >
      <SmileMark size={size} mood={mood} pulse={pulse} />
      <span className="smile-lockup__text inline-flex flex-col" style={{ gap: fs * 0.18 }}>
        <span className="smile-lockup__word" style={wordmarkStyle}>
          {text}
        </span>
        {accent && (
          <span
            aria-hidden
            className="smile-lockup__accent"
            style={{
              display: "block",
              width: "100%",
              height: Math.max(2, fs * 0.16),
              borderRadius: 999,
              background: "var(--yellow, #FFC107)",
              boxShadow: "0 0 8px var(--yellow, #FFC107)",
            }}
          />
        )}
      </span>
    </span>
  );
}

export default SmileLockup;
