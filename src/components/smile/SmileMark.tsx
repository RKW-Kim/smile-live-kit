"use client";

/**
 * SmileMark — the smiley face (SACRED · Rule 2)
 * ─────────────────────────────────────────────────────────────
 * A yellow disc with two eyes + a thick-stroke smile mouth.
 * It has PERSONALITY — moods animate the face (blink, wink,
 * smirk, look, nod, spin, bounce, celebrate, shake). Idle
 * auto-blinking runs every ~3s via a ref-based scheduler
 * (NEVER setInterval-in-render).
 *
 * Spec (viewBox 0 0 100 100):
 *  • Disc:   circle cx=50 cy=50 r=48 fill=#FFC107
 *  • Eyes:   two ellipses, rx=6.6 ry=8.6, cx=38 / cx=62, cy=40 (close together)
 *  • Mouth:  path M31 57 C 34 80, 66 80, 69 57 — stroke #0b0b0b,
 *            stroke-width 8-10.5, stroke-linecap round.
 *            The thick stroke is what reads as one smile;
 *            thinner splits into two ball ends (parody).
 *
 * The mark is sacred: shape, proportions, and color NEVER change
 * across channels. Channel theming affects accents ELSEWHERE
 * (chips, ticks, on-air glows) — the smiley stays yellow + smiling.
 */

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type SmileMood =
  | "idle"
  | "blink"
  | "wink"
  | "smirk"
  | "look"
  | "nod"
  | "spin"
  | "bounce"
  | "celebrate"
  | "shake";

export interface SmileMarkProps {
  /** Outer width/height of the mark, in pixels. Default 48. */
  size?: number;
  /** Lock to a single mood. If omitted, idle auto-blink runs. */
  mood?: SmileMood;
  /** Render a subtle yellow glow behind the disc. Default false. */
  pulse?: boolean;
  /** Disable the idle blink scheduler even if `mood` is omitted. */
  static?: boolean;
  /** Optional className passthrough. */
  className?: string;
  /** Optional ARIA label. Default "Smile mark". */
  label?: string;
}

export function SmileMark({
  size = 48,
  mood,
  pulse = false,
  static: isStatic = false,
  className,
  label = "Smile mark",
}: SmileMarkProps) {
  // When `mood` is locked via props, it wins — no internal state, no effect.
  // Otherwise we run an idle auto-blink scheduler (ref-based setTimeout).
  const lockedMood = mood;
  const [idleMood, setIdleMood] = useState<SmileMood>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = lockedMood ?? idleMood;

  // Ref-based idle scheduler — schedules the NEXT blink only after
  // the previous one finishes. No setInterval-in-render, ever.
  // Skipped entirely when `mood` is locked or `static` is set.
  useEffect(() => {
    if (isStatic) return;
    if (lockedMood !== undefined) return;

    let cancelled = false;

    function schedule() {
      if (cancelled) return;
      const delay = 2200 + Math.random() * 2200;
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        setIdleMood("blink");
        // hold the blink briefly, then return to idle + schedule next.
        timerRef.current = setTimeout(() => {
          if (cancelled) return;
          setIdleMood("idle");
          schedule();
        }, 160);
      }, delay);
    }

    schedule();

    return () => {
      cancelled = true;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [lockedMood, isStatic]);

  // Stable, unique ids so multiple marks on the page don't clash.
  const gid = useId().replace(/[:]/g, "");
  const discId = `smile-disc-${gid}`;
  const mouthMaskId = `smile-mouth-mask-${gid}`;

  const wrapperStyle: CSSProperties = {
    width: size,
    height: size,
    display: "inline-flex",
    flexShrink: 0,
    position: "relative",
    "--smile-size": `${size}px`,
  } as CSSProperties;

  return (
    <span
      className={cn(
        "smile-mark",
        `smile-mark--${active}`,
        pulse && "smile-mark--pulse",
        className,
      )}
      style={wrapperStyle}
      role="img"
      aria-label={label}
      data-mood={active}
    >
      {pulse && (
        <span
          aria-hidden
          className="smile-mark__glow"
          style={{
            position: "absolute",
            inset: `-${Math.max(2, size * 0.08)}px`,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,193,7,0.55) 0%, rgba(255,193,7,0) 70%)",
            filter: `blur(${Math.max(1, size * 0.04)}px)`,
            animation: "smile-pulse 2.4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="smile-mark__svg"
        style={{
          display: "block",
          overflow: "visible",
          transformOrigin: "50% 50%",
        }}
        aria-hidden
      >
        <defs>
          {/* Mask so the mouth's round end-caps stay flush against
              the disc edge when stroke is thick — keeps the smile
              reading as a single curved stroke, not two balls. */}
          <clipPath id={mouthMaskId}>
            <circle cx="50" cy="50" r="48" />
          </clipPath>
          <radialGradient id={discId} cx="42%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#FFD451" />
            <stop offset="55%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#F5A623" />
          </radialGradient>
        </defs>

        {/* Disc */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#${discId})`}
          stroke="#0b0b0b"
          strokeWidth="1.2"
        />

        {/* Eyes — group so a mood class can target both at once */}
        <g className="smile-mark__eyes">
          <ellipse
            className="smile-mark__eye smile-mark__eye--left"
            cx="38"
            cy="40"
            rx="6.6"
            ry="8.6"
            fill="#0b0b0b"
          />
          <ellipse
            className="smile-mark__eye smile-mark__eye--right"
            cx="62"
            cy="40"
            rx="6.6"
            ry="8.6"
            fill="#0b0b0b"
          />
        </g>

        {/* Mouth — thick stroke keeps it one smile, not two balls */}
        <g clipPath={`url(#${mouthMaskId})`}>
          <path
            className="smile-mark__mouth"
            d="M31 57 C 34 80, 66 80, 69 57"
            fill="none"
            stroke="#0b0b0b"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}

export default SmileMark;
