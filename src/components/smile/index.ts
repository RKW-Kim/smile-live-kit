/**
 * Smile component barrel — single import surface for scenes & panels.
 *
 *   import { SmileMark, SmileLockup, SignalCard, Ticker, Chip } from "@/components/smile";
 */

export { SmileMark, default as SmileMarkDefault } from "./SmileMark";
export type { SmileMarkProps, SmileMood } from "./SmileMark";

export { SmileLockup, default as SmileLockupDefault } from "./SmileLockup";
export type { SmileLockupProps } from "./SmileLockup";

export { SignalCard, default as SignalCardDefault } from "./SignalCard";
export type { SignalCardProps, SignalDirection } from "./SignalCard";

export { Ticker, default as TickerDefault } from "./Ticker";
export type { TickerProps, TickerItem } from "./Ticker";

export { Chip, default as ChipDefault } from "./Chip";
export type { ChipProps, ChipVariant } from "./Chip";
