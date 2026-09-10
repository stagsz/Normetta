import * as React from 'react';

export interface CarouselOptions {
  align?: 'start' | 'center';
}

/**
 * Accessible, headless carousel. Two variants:
 *  • "page" — one slide per view, transform-based, drag/keyboard/dots/arrows.
 *    All slides stay mounted (state-safe for forms). Use for question flows,
 *    onboarding, one-up galleries.
 *  • "row" — native scroll-snap card row, arrows + touch. Use for horizontally
 *    scrollable card lists (recent items, related cards).
 * Never autoplays. Respects prefers-reduced-motion (instant transitions).
 *
 * @startingPoint section="Navigation" subtitle="Swipe/keyboard carousel — page & row" viewport="700x300"
 */
export interface CarouselProps {
  /** Slides — one child per slide */
  children: React.ReactNode;
  /** @default "page" */
  variant?: 'page' | 'row';
  /** Controlled active index (page variant) */
  index?: number;
  /** Initial index when uncontrolled. @default 0 */
  defaultIndex?: number;
  /** Fires with the new index on slide change (page variant) */
  onSlideChange?: (index: number) => void;
  /** Show prev/next arrows. @default true */
  showArrows?: boolean;
  /** Show dot indicators (page variant). @default true */
  showDots?: boolean;
  /** Fixed slide width for the row variant (px or CSS length). @default 300 */
  slideWidth?: number | string;
  /** Gap between slides in the row variant (px). @default 16 */
  gap?: number;
  /** Accessible label for the carousel region */
  ariaLabel?: string;
}

export function Carousel(props: CarouselProps): JSX.Element;
