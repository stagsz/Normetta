'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getLocale, Locale } from '@/lib/locale';
import { useLocaleMessages } from '@/lib/i18n/landing-messages';
import LocaleSwitcher from '@/components/locale/LocaleSwitcher';
// NOTE: This import keeps getting dropped during rebrand/merge resolutions
// (see commits d512c89, 6c813ed, 16e084f). Without it the landing page renders
// completely unstyled. Do not remove.
import './landing.css';


const BAR_HEIGHTS = ['38%', '52%', '46%', '61%', '57%', '70%', '66%', '78%', '84%', '92%'];

function handleCardGlow(e: React.MouseEvent<HTMLDivElement>) {
  const card = e.currentTarget;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export function LandingPage() {
  const t = useLocaleMessages();
  const locale = getLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tourVideoRef = useRef<HTMLVideoElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    let ticking = false;
    const mobile = window.matchMedia('(max-width: 900px)');
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (progressRef.current) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          progressRef.current.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
        }
        if (storyRef.current && !mobile.matches) {
          const rect = storyRef.current.getBoundingClientRect();
          const total = storyRef.current.offsetHeight - window.innerHeight;
          const p = Math.min(Math.max(-rect.top / total, 0), 0.999);
          setStoryIndex(Math.floor(p * t.story.steps.length));
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [t.story.steps.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const countUp = (el: HTMLElement) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = parseInt(el.dataset.count ?? '0', 10);
      if (reduced || target === 0) {
        el.textContent = String(target);
        return;
      }
      let start: number | null = null;
      const dur = 1400;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    root.querySelectorAll('.reveal, .bars').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = tourVideoRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.controls = true;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (ev: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 6}deg) translateZ(0)`;
    };
    const onLeave = () => {
      tilt.style.transform = '';
    };
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    return () => {
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="lp" ref={rootRef}>
      <div className="lp-progress" ref={progressRef} />
      <div className="grain" />
      <div className="lp-bg" aria-hidden="true">
        <span className="lp-bg-word">ISO 9001</span>
      </div>

      <nav className={scrolled ? 'scrolled' : undefined}>
        <Link className="logo" href="/">
          Nor<b>metta</b>
        </Link>
        <div className="nav-links">
          <a href="#features">{t.nav.platform}</a>
          <a href="#story">{t.nav.howItWorks}</a>
          <a href="#pricing">{t.nav.pricing}</a>
          <Link href="/blog">{t.nav.blog}</Link>
          <Link className="btn-quiet" href="/login">
            {t.nav.signIn}
          </Link>
          <Link className="btn" href="/register">
            {t.nav.start}
          </Link>
          <LocaleSwitcher />
        </div>
      </nav>

      <header className="hero">
        <div className="aurora" />
        <div>
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 dangerouslySetInnerHTML={{ __html: t.hero.h1 }} />
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-actions">
            <Link className="btn" href="/register">
              {t.hero.actions.primary}
            </Link>
            <a className="btn-quiet" href="#story">
              {t.hero.actions.secondary}
            </a>
          </div>
          <p className="hero-note">
            <span className="seal">✓</span> {t.hero.note}
          </p>
        </div>

        <div className="stage" ref={stageRef}>
          <div className="lp-glass" ref={tiltRef} aria-hidden="true">
            <span className="float-chip chip-a">
              Clause <b>8.5.1</b> — Control of production
            </span>
            <span className="float-chip chip-b">
              NCR <b>−32%</b> this quarter
            </span>
            <div className="gc-head">
              <div className="gc-title">
                {t.hero.mockup.title}
                <small>{t.hero.mockup.status}</small>
              </div>
              <span className="gc-live">{t.hero.mockup.live}</span>
            </div>
            <div className="kpis">
              <div className="kpi">
                <b className="up">87%</b>
                <span>{t.hero.mockup.readiness}</span>
              </div>
              <div className="kpi">
                <b>3</b>
                <span>{t.hero.mockup.openNcrs}</span>
              </div>
              <div className="kpi">
                <b className="warn">2</b>
                <span>{t.hero.mockup.overdue}</span>
              </div>
            </div>
            <div className="bars">
              {BAR_HEIGHTS.map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </div>
            <div className="ncr-row">
              <code>NCR-041</code>
              <span className="grow">Calibration records missing for torque tools</span>
              <span className={`pill ${t.common.openNcr.toLowerCase() === 'open' ? 'major' : 'major'}`}>
                {t.common.major}
              </span>
            </div>
            <div className="ncr-row">
              <code>NCR-039</code>
              <span className="grow">Supplier evaluation overdue</span>
              <span className={`pill ${t.common.minor.toLowerCase() === 'minor' ? 'minor' : 'minor'}`}>
                {t.common.minor}
              </span>
            </div>
            <div className="ncr-row">
              <code>NCR-036</code>
              <span className="grow">Management review minutes — approved &amp; closed</span>
              <span className={`pill ${t.common.closed.toLowerCase() === 'closed' ? 'ok' : 'ok'}`}>
                {t.common.closed}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="stats">
        <div className="wrap stats-grid">
          <div className="stat reveal">
            <b>
              <span data-count={String(t.stats.clauses.count)}>0</span>
              <i>{t.stats.clauses.label}</i>
            </b>
            <span>{t.stats.clauses.detail}</span>
          </div>
          <div className="stat reveal" data-d="1">
            <b>
              <span data-count={String(t.stats.auditTypes.count)}>0</span>
              <i>{t.stats.auditTypes.label}</i>
            </b>
            <span>{t.stats.auditTypes.detail}</span>
          </div>
          <div className="stat reveal" data-d="2">
            <b>
              <span data-count={String(t.stats.spreadsheets.count)}>0</span>
              <i>{t.stats.spreadsheets.label}</i>
            </b>
            <span>{t.stats.spreadsheets.detail}</span>
          </div>
        </div>
      </section>

      <section className="sec-pad" id="features">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{t.features.eyebrow}</span>
            <h2>{t.features.heading}</h2>
            <p>{t.features.sub}</p>
          </div>
          <div className="feat-grid">
            {t.features.items.map((f, i) => (
              <div key={f.title} className="lp-feat reveal" data-d={i % 3 || undefined} onMouseMove={handleCardGlow}>
                <div className="feat-icon">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="story" id="story" ref={storyRef}>
        <div className="story-sticky">
          <div className="story-copy">
            <span className="eyebrow">{t.story.eyebrow}</span>
            <h2>{t.story.heading}</h2>
            {t.story.steps.map((s, i) => (
              <div key={s.title} className={`story-step${i === storyIndex ? ' active' : ''}`}>
                <span className="story-num">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="story-panels">
            {t.story.panels.map((panel, i) => (
              <div key={panel.label} className={`story-panel${storyIndex === i ? ' active' : ''}`}>
                <div className="sp-label">{panel.label}</div>
                {panel.rows
                  ? panel.rows.map((row) => (
                      <div key={row.text} className="sp-row">
                        <span>{row.text}</span>
                        <span className="sp-check">✓ {row.status}</span>
                      </div>
                    ))
                  : panel.clauses?.map((clause) => (
                      <div key={clause.name} className="sp-clause">
                        {clause.name}
                        <div className="sp-bar">
                          <i style={{ width: `${clause.pct}%` }} />
                        </div>
                      </div>
                    ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-pad" id="tour">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{t.tour.eyebrow}</span>
            <h2>{t.tour.heading}</h2>
            <p>{t.tour.sub}</p>
          </div>
          <div className="tour-frame reveal" data-d="1">
            <div className="tour-chrome" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <video
              ref={tourVideoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/promo/auditflow-tour-poster.jpg"
              aria-label={t.tour.videoAria}
            >
              <source src="/promo/auditflow-tour.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="sec-pad">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{t.coverage.eyebrow}</span>
            <h2>{t.coverage.heading}</h2>
            <p>{t.coverage.sub}</p>
          </div>
          <div className="clause-grid reveal">
            {[
              ['Clause 4', locale === 'sv' ? 'Organisationskontext' : 'Context of the Organization'],
              ['Clause 5', locale === 'sv' ? 'Ledarskap' : 'Leadership'],
              ['Clause 6', locale === 'sv' ? 'Planering' : 'Planning'],
              ['Clause 7', locale === 'sv' ? 'Stöd' : 'Support'],
              ['Clause 8', locale === 'sv' ? 'Verksamhet' : 'Operation'],
              ['Clause 9', locale === 'sv' ? 'Prestationsutvärdering' : 'Performance Evaluation'],
              ['Clause 9.2', locale === 'sv' ? 'Intern revision' : 'Internal Audit'],
              ['Clause 9.3', locale === 'sv' ? 'Management review' : 'Management Review'],
              ['Clause 10', locale === 'sv' ? 'Förbättring & CAPA' : 'Improvement & CAPA'],
              ['10.2', locale === 'sv' ? 'Nonconformity & korrigerande åtgärd' : 'Nonconformity & Corrective Action'],
            ].map(([id, name]) => (
              <div key={id} className="clause">
                <div className="clause-id">{id}</div>
                <div className="clause-name">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="paper-sec sec-pad" id="pricing">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{t.pricing.eyebrow}</span>
            <h2>{t.pricing.heading}</h2>
            <p>{t.pricing.sub}</p>
          </div>
          <div className="pricing-grid">
            <div className="plan featured reveal">
              <div className="plan-name">{t.pricing.free.name}</div>
              <div className="plan-price">{t.pricing.free.price}</div>
              <div className="plan-per">{t.pricing.free.per}</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {t.pricing.free.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link href="/register" className="plan-btn plan-btn-glow">
                {t.pricing.free.cta}
              </Link>
            </div>
            <div className="plan reveal" data-d="1">
              <div className="plan-name">{t.pricing.pro.name}</div>
              <div className="plan-price">{t.pricing.pro.price}</div>
              <div className="plan-per">{t.pricing.pro.per}</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {t.pricing.pro.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link href="/register" className="plan-btn plan-btn-dark">
                {t.pricing.pro.cta}
              </Link>
            </div>
            <div className="plan reveal" data-d="2">
              <div className="plan-name">{t.pricing.enterprise.name}</div>
              <div className="plan-price">{t.pricing.enterprise.price}</div>
              <div className="plan-per">{t.pricing.enterprise.per}</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {t.pricing.enterprise.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={`mailto:hello@normetta.com`} className="plan-btn plan-btn-outline">
                {t.pricing.enterprise.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2 dangerouslySetInnerHTML={{ __html: t.cta.heading }} />
        <p>{t.cta.sub}</p>
        <Link className="btn" href="/register">
          {t.cta.cta}
        </Link>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-logo">
                Nor<span>metta</span>
              </div>
              <div className="footer-tagline">{t.footer.tagline}</div>
            </div>
            <div className="footer-links-group">
              <div className="footer-links-title">{t.footer.product}</div>
              <a href="#features">{t.footer.links.features}</a>
              <a href="#pricing">{t.footer.links.pricing}</a>
              <Link href="/blog">{t.footer.links.blog}</Link>
            </div>
            <div className="footer-links-group">
              <div className="footer-links-title">{t.footer.useCases}</div>
              <a href="#features">{t.footer.links.internalAudits}</a>
              <a href="#features">{t.footer.links.selfAssessments}</a>
              <a href="#story">{t.footer.links.managementReview}</a>
            </div>
            <div className="footer-links-group">
              <div className="footer-links-title">{t.footer.company}</div>
              <a href={`mailto:hello@normetta.com`}>{t.footer.links.contact}</a>
              <a href="#">{t.footer.links.privacy}</a>
              <a href="#">{t.footer.links.terms}</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Normetta. {t.footer.bottom.split('Normetta. ')[1]}</span>
            <span>{t.footer.isoLabel}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
