const { useState, useRef, useEffect, useCallback } = React;

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
  }, []);
  return reduce;
}

function Arrow({ dir, onClick, disabled, style }) {
  return (
    <button type="button" aria-label={dir === 'next' ? 'Next slide' : 'Previous slide'} onClick={onClick} disabled={disabled}
      style={{
        width: 36, height: 36, display: 'grid', placeItems: 'center', flex: 'none',
        borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
        color: disabled ? 'var(--text-subtle)' : 'var(--text-body)',
        boxShadow: 'var(--shadow-sm)', opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast), opacity var(--dur-fast)', ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--stone-50)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-card)'; }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'next' ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
      </svg>
    </button>
  );
}

function Dots({ count, active, onDot }) {
  return (
    <div role="tablist" aria-label="Slides" style={{ display: 'flex', gap: 7, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => {
        const on = i === active;
        return (
          <button key={i} role="tab" aria-selected={on} aria-label={`Go to slide ${i + 1}`} onClick={() => onDot(i)}
            style={{
              width: on ? 22 : 8, height: 8, padding: 0, border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-pill)',
              background: on ? 'var(--brand)' : 'var(--stone-300)',
              transition: 'width var(--dur-medium) var(--ease-standard), background var(--dur-fast)',
            }} />
        );
      })}
    </div>
  );
}

/* ---------------- Row variant: native scroll-snap card rows ---------------- */
function RowCarousel({ slides, slideWidth, gap, showArrows, ariaLabel }) {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const step = (typeof slideWidth === 'number' ? slideWidth : 300) + gap;

  const update = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);
  useEffect(() => { update(); }, [update, slides.length]);

  const scrollByCards = (dir) => {
    const el = scrollRef.current; if (!el) return;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={ariaLabel} style={{ position: 'relative' }}>
      <div ref={scrollRef} onScroll={update}
        style={{
          display: 'flex', gap, overflowX: 'auto', scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '2px 2px 10px',
        }}>
        {slides.map((s, i) => (
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}
            style={{ flex: 'none', width: slideWidth, scrollSnapAlign: 'start' }}>{s}</div>
        ))}
      </div>
      {showArrows && !atStart && (
        <Arrow dir="prev" onClick={() => scrollByCards(-1)} style={{ position: 'absolute', left: -14, top: 'calc(50% - 24px)' }} />
      )}
      {showArrows && !atEnd && (
        <Arrow dir="next" onClick={() => scrollByCards(1)} style={{ position: 'absolute', right: -14, top: 'calc(50% - 24px)' }} />
      )}
    </div>
  );
}

/* ---------------- Page variant: one slide per view, transform-based --------- */
export function Carousel({
  children,
  index,
  defaultIndex = 0,
  onSlideChange,
  variant = 'page',
  showArrows = true,
  showDots = true,
  slideWidth = 300,
  gap = 16,
  ariaLabel = 'Carousel',
}) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const controlled = index !== undefined;
  const [internal, setInternal] = useState(defaultIndex);
  const active = Math.max(0, Math.min(count - 1, controlled ? index : internal));
  const reduce = useReducedMotion();

  const go = useCallback((next) => {
    const clamped = Math.max(0, Math.min(count - 1, next));
    if (!controlled) setInternal(clamped);
    onSlideChange && onSlideChange(clamped);
  }, [count, controlled, onSlideChange]);

  if (variant === 'row') {
    return <RowCarousel slides={slides} slideWidth={slideWidth} gap={gap} showArrows={showArrows} ariaLabel={ariaLabel} />;
  }

  const wrapRef = useRef(null);
  const startX = useRef(null);
  const widthRef = useRef(1);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e) => {
    if (e.target.closest('input,textarea,select,button,a')) { startX.current = null; return; }
    startX.current = e.clientX;
    widthRef.current = wrapRef.current ? wrapRef.current.offsetWidth : 1;
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  };
  const endDrag = () => {
    if (startX.current === null) { setDragging(false); return; }
    const threshold = Math.min(80, widthRef.current * 0.18);
    if (drag <= -threshold) go(active + 1);
    else if (drag >= threshold) go(active - 1);
    startX.current = null;
    setDrag(0);
    setDragging(false);
  };
  const onKeyDown = (e) => {
    const t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={ariaLabel}
      tabIndex={0} onKeyDown={onKeyDown}
      style={{ outline: 'none' }}
      onFocus={(e) => { if (e.target === e.currentTarget) e.currentTarget.style.boxShadow = 'var(--ring)'; e.currentTarget.style.borderRadius = 'var(--radius-lg)'; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showArrows && <Arrow dir="prev" onClick={() => go(active - 1)} disabled={active === 0} />}
        <div ref={wrapRef} style={{ flex: 1, overflow: 'hidden', minWidth: 0, touchAction: 'pan-y' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerLeave={endDrag} onPointerCancel={endDrag}>
          <div style={{
            display: 'flex', alignItems: 'stretch',
            transform: `translateX(calc(${-active * 100}% + ${drag}px))`,
            transition: dragging || reduce ? 'none' : 'transform var(--dur-medium) var(--ease-emphasized)',
            cursor: dragging ? 'grabbing' : 'grab',
          }}>
            {slides.map((s, i) => (
              <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={i !== active}
                style={{ flex: '0 0 100%', minWidth: 0, boxSizing: 'border-box', userSelect: dragging ? 'none' : 'auto' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
        {showArrows && <Arrow dir="next" onClick={() => go(active + 1)} disabled={active === count - 1} />}
      </div>
      {showDots && count > 1 && (
        <div style={{ marginTop: 14 }}><Dots count={count} active={active} onDot={go} /></div>
      )}
    </div>
  );
}
