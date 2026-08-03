/**
 * W21 component barrel — single import surface for scenes & panels.
 *
 *   import { W21Mark, W21Lockup, SignalCard, Ticker } from "@/components/w21";
 */

export { W21Mark, default as W21MarkDefault } from "./W21Mark";
export type { W21MarkProps } from "./W21Mark";

export { W21Lockup, default as W21LockupDefault } from "./W21Lockup";
export type { W21LockupProps } from "./W21Lockup";

export { SignalCard, default as SignalCardDefault } from "./SignalCard";
export type { SignalCardProps, SignalDirection } from "./SignalCard";

export { Ticker, default as TickerDefault } from "./Ticker";
export type { TickerProps, TickerItem } from "./Ticker";
