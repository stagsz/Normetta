'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * MotionProvider — gives the app the landing page's motion language without
 * per-page edits:
 *
 *  1. Scroll reveal: card-like elements rise in as they enter the viewport
 *     (staggered). Targets <Card> ([data-motion-card]) plus any block that
 *     styles itself as a card via bg-[var(--surface-card)] + rounded-*.
 *  2. Cursor glow: [data-motion-card] elements get --mx/--my updated on
 *     mousemove; CSS paints a teal radial highlight under the pointer.
 *
 * All classes are added by JS, so nothing is ever hidden when JS is off.
 * Respects prefers-reduced-motion.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const main = document.querySelector('main');
    if (!main) return;

    const io = new IntersectionObserver(
      (entries) => {
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${(order % 5) * 60}ms`;
          el.classList.add('in');
          io.unobserve(el);
          order += 1;
        });
      },
      { threshold: 0.15 }
    );

    const isCardLike = (el: Element) => {
      if (el.hasAttribute('data-motion-card')) return true;
      const cls = el.getAttribute('class') ?? '';
      return (
        el.tagName === 'DIV' &&
        cls.includes('surface-card') &&
        cls.includes('rounded')
      );
    };

    const tag = (root: ParentNode) => {
      const candidates = [
        ...(root instanceof Element && isCardLike(root) ? [root] : []),
        ...Array.from(root.querySelectorAll('[data-motion-card], div[class*="surface-card"]')),
      ];
      candidates.forEach((el) => {
        // Re-observe tagged-but-unrevealed elements too: effects remount
        // (StrictMode, route changes) and the previous observer is gone
        if (!isCardLike(el) || el.classList.contains('in')) return;
        el.classList.add('af-reveal');
        el.setAttribute('data-motion-card', '');
        io.observe(el);
      });
    };

    tag(main);

    // Data-loaded content (tables, lists) appears after fetches — tag it too
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) tag(node);
        });
      });
    });
    mo.observe(main, { childList: true, subtree: true });

    // Cursor-tracking glow (delegated; only touches the hovered card)
    const onMove = (ev: MouseEvent) => {
      const card = (ev.target as Element | null)?.closest?.('[data-motion-card]');
      if (!(card instanceof HTMLElement)) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${ev.clientX - r.left}px`);
      card.style.setProperty('--my', `${ev.clientY - r.top}px`);
    };
    main.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      main.removeEventListener('mousemove', onMove);
    };
  }, [pathname]);

  return null;
}

export default MotionProvider;
