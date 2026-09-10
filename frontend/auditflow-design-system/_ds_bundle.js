/* @ds-bundle: {"format":3,"namespace":"AuditFlowDesignSystem_900961","components":[{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"ClauseStrip","sourcePath":"components/display/ClauseStrip.jsx"},{"name":"ConformanceBadge","sourcePath":"components/display/ConformanceBadge.jsx"},{"name":"ProgressBar","sourcePath":"components/display/ProgressBar.jsx"},{"name":"Callout","sourcePath":"components/feedback/Callout.jsx"},{"name":"ScoreGauge","sourcePath":"components/feedback/ScoreGauge.jsx"},{"name":"Tabs","sourcePath":"components/feedback/Tabs.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Carousel","sourcePath":"components/navigation/Carousel.jsx"}],"sourceHashes":{"components/display/Avatar.jsx":"9f3ac13f9acc","components/display/Badge.jsx":"77228625c0b7","components/display/Card.jsx":"de262b7bcac0","components/display/ClauseStrip.jsx":"2859f1a5484c","components/display/ConformanceBadge.jsx":"5519541146c4","components/display/ProgressBar.jsx":"398d613c564c","components/feedback/Callout.jsx":"b52dc5308e4b","components/feedback/ScoreGauge.jsx":"1a4c2acb6e70","components/feedback/Tabs.jsx":"4ea4a662f07e","components/forms/Button.jsx":"1dbca615935d","components/forms/Checkbox.jsx":"126628f552e3","components/forms/IconButton.jsx":"84c5c7abda33","components/forms/Input.jsx":"4c9a6f678d31","components/forms/Select.jsx":"008c2d399dad","components/forms/Switch.jsx":"edc3fd6848c2","components/navigation/Carousel.jsx":"e27b202101aa","ui_kits/app/Assessment.jsx":"376c0c581759","ui_kits/app/Dashboard.jsx":"0c190c58616d","ui_kits/app/Findings.jsx":"3ab08c2906ee","ui_kits/app/Login.jsx":"7ad8a3faada1","ui_kits/app/Sidebar.jsx":"18adf25da679","ui_kits/app/TopBar.jsx":"1863a46ba7f5","ui_kits/app/data.jsx":"a560bc593b88","ui_kits/app/icons.jsx":"d2a47ab0891a","ui_kits/app/tweaks-panel.jsx":"6591467622ed"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AuditFlowDesignSystem_900961 = window.AuditFlowDesignSystem_900961 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/display/Avatar.jsx
try { (() => {
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}
function Avatar({
  name = '',
  src,
  size = 'md',
  tone = 'brand'
}) {
  const dims = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 44
  };
  const fonts = {
    xs: 9,
    sm: 11,
    md: 13,
    lg: 16
  };
  const d = dims[size] || dims.md;
  const tones = {
    brand: ['var(--brand-soft)', 'var(--brand-strong)'],
    slate: ['var(--stone-100)', 'var(--stone-600)'],
    pass: ['var(--status-pass-bg)', 'var(--status-pass-fg)']
  };
  const [bg, fg] = tones[tone] || tones.brand;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d,
      height: d,
      flex: 'none',
      borderRadius: '50%',
      background: bg,
      color: fg,
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: fonts[size] || 13,
      border: '1px solid var(--border-subtle)'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false
}) {
  const tones = {
    neutral: {
      soft: ['var(--stone-100)', 'var(--stone-600)', 'var(--stone-200)'],
      solid: ['var(--stone-600)', '#fff']
    },
    brand: {
      soft: ['var(--brand-soft)', 'var(--brand-strong)', 'var(--clay-200)'],
      solid: ['var(--brand)', '#fff']
    },
    pass: {
      soft: ['var(--status-pass-bg)', 'var(--status-pass-fg)', 'var(--status-pass-line)'],
      solid: ['var(--status-pass-solid)', '#fff']
    },
    obs: {
      soft: ['var(--status-obs-bg)', 'var(--status-obs-fg)', 'var(--status-obs-line)'],
      solid: ['var(--status-obs-solid)', '#fff']
    },
    fail: {
      soft: ['var(--status-fail-bg)', 'var(--status-fail-fg)', 'var(--status-fail-line)'],
      solid: ['var(--status-fail-solid)', '#fff']
    },
    info: {
      soft: ['var(--blue-50)', 'var(--blue-600)', 'var(--blue-100)'],
      solid: ['var(--blue-500)', '#fff']
    }
  };
  const cfg = tones[tone] || tones.neutral;
  const sizes = {
    sm: {
      fs: 'var(--text-2xs)',
      pad: '2px 7px'
    },
    md: {
      fs: 'var(--text-xs)',
      pad: '3px 9px'
    }
  };
  const sz = sizes[size] || sizes.md;
  const isSolid = variant === 'solid';
  const [bg, fg, line] = isSolid ? [cfg.solid[0], cfg.solid[1], cfg.solid[0]] : cfg.soft;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'var(--font-sans)',
      fontSize: sz.fs,
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1,
      padding: sz.pad,
      color: fg,
      background: bg,
      border: `1px solid ${isSolid ? 'transparent' : line}`,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap'
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: isSolid ? '#fff' : cfg.solid[0],
      flex: 'none'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  title,
  subtitle,
  action,
  padding = 'md',
  elevation = 'md',
  as = 'div',
  ...rest
}) {
  const pads = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)'
  };
  const shadows = {
    none: 'none',
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)'
  };
  const Tag = as;
  const hasHeader = title || subtitle || action;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: shadows[elevation] ?? shadows.sm,
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      ...rest.style
    }
  }, rest), hasHeader && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      padding: `${pads[padding]} ${pads[padding]} 0`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      margin: 0,
      letterSpacing: '-0.01em'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, subtitle)), action && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none'
    }
  }, action)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pads[padding]
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/ClauseStrip.jsx
try { (() => {
const {
  useState
} = React;
const CS_TONES = {
  pass: 'var(--status-pass-solid)',
  obs: 'var(--status-obs-solid)',
  fail: 'var(--status-fail-solid)',
  pending: 'var(--stone-300)'
};
const CS_TRACK = 'var(--stone-200)';

/**
 * ClauseStrip — the signature readiness texture. A single horizontal bar
 * segmented per clause, each segment colored by status and (optionally) sized
 * by weight. Calm and flat by design; the gauge carries the depth.
 */
function ClauseStrip({
  clauses = [],
  height = 14,
  showTicks = true,
  showLegend = false,
  rounded = true
}) {
  const [hover, setHover] = useState(-1);
  const total = clauses.reduce((s, c) => s + (c.weight ?? 1), 0) || 1;
  const radius = rounded ? 'var(--radius-pill)' : 'var(--radius-xs)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      width: '100%',
      height,
      gap: 2,
      padding: 2,
      borderRadius: radius,
      background: CS_TRACK,
      boxShadow: 'inset 0 1px 2px rgba(33,29,24,0.10)'
    }
  }, clauses.map((c, i) => {
    const pct = (c.weight ?? 1) / total * 100;
    const fill = CS_TONES[c.status] || CS_TONES.pending;
    const isEnd = i === 0 || i === clauses.length - 1;
    const segR = rounded && isEnd ? 'var(--radius-pill)' : 2;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      title: `${c.label || `Clause ${i + 1}`} — ${c.status || 'pending'}`,
      onMouseEnter: () => setHover(i),
      onMouseLeave: () => setHover(-1),
      style: {
        width: `${pct}%`,
        height: '100%',
        background: fill,
        borderTopLeftRadius: i === 0 ? segR : 2,
        borderBottomLeftRadius: i === 0 ? segR : 2,
        borderTopRightRadius: i === clauses.length - 1 ? segR : 2,
        borderBottomRightRadius: i === clauses.length - 1 ? segR : 2,
        opacity: hover === -1 || hover === i ? 1 : 0.5,
        transform: hover === i ? 'scaleY(1.18)' : 'scaleY(1)',
        transition: 'opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)'
      }
    });
  })), showTicks && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      width: '100%',
      gap: 2,
      padding: '6px 2px 0',
      marginTop: 0
    }
  }, clauses.map((c, i) => {
    const pct = (c.weight ?? 1) / total * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: `${pct}%`,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: hover === i ? 'var(--text-strong)' : 'var(--text-subtle)',
        fontWeight: hover === i ? 600 : 500,
        fontVariantNumeric: 'tabular-nums',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transition: 'color var(--dur-fast)'
      }
    }, c.tick ?? c.label ?? i + 1);
  })), showLegend && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px 18px',
      marginTop: 12
    }
  }, [['pass', 'Conformant'], ['obs', 'Observation'], ['fail', 'Nonconformity'], ['pending', 'Not assessed']].map(([k, lbl]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: CS_TONES[k]
    }
  }), lbl))));
}
Object.assign(__ds_scope, { ClauseStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ClauseStrip.jsx", error: String((e && e.message) || e) }); }

// components/display/ConformanceBadge.jsx
try { (() => {
const CONFORMANCE = {
  conformant: {
    label: 'Conformant',
    bg: 'var(--status-pass-bg)',
    fg: 'var(--status-pass-fg)',
    line: 'var(--status-pass-line)',
    solid: 'var(--status-pass-solid)'
  },
  observation: {
    label: 'Observation',
    bg: 'var(--status-obs-bg)',
    fg: 'var(--status-obs-fg)',
    line: 'var(--status-obs-line)',
    solid: 'var(--status-obs-solid)'
  },
  nonconformity: {
    label: 'Nonconformity',
    bg: 'var(--status-fail-bg)',
    fg: 'var(--status-fail-fg)',
    line: 'var(--status-fail-line)',
    solid: 'var(--status-fail-solid)'
  },
  notassessed: {
    label: 'Not assessed',
    bg: 'var(--status-na-bg)',
    fg: 'var(--status-na-fg)',
    line: 'var(--status-na-line)',
    solid: 'var(--status-na-solid)'
  }
};
function Glyph({
  status
}) {
  const c = 'currentColor';
  if (status === 'conformant') return /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.5l3 3 6-7",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
  if (status === 'observation') return /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 3v6",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "12.5",
    r: "1.1",
    fill: c
  }));
  if (status === 'nonconformity') return /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round"
  }));
  return /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "5",
    stroke: c,
    strokeWidth: "1.6",
    strokeDasharray: "2 2"
  }));
}
function ConformanceBadge({
  status = 'notassessed',
  variant = 'soft',
  showIcon = true,
  label
}) {
  const cfg = CONFORMANCE[status] || CONFORMANCE.notassessed;
  const isSolid = variant === 'solid';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1,
      padding: '4px 10px',
      color: isSolid ? '#fff' : cfg.fg,
      background: isSolid ? cfg.solid : cfg.bg,
      border: `1px solid ${isSolid ? 'transparent' : cfg.line}`,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap'
    }
  }, showIcon && /*#__PURE__*/React.createElement(Glyph, {
    status: status
  }), label || cfg.label);
}
Object.assign(__ds_scope, { ConformanceBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ConformanceBadge.jsx", error: String((e && e.message) || e) }); }

// components/display/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  segments,
  tone = 'brand',
  size = 'md',
  label,
  showValue = false
}) {
  const heights = {
    sm: 6,
    md: 9,
    lg: 12
  };
  const h = heights[size] || heights.md;
  const tones = {
    brand: 'var(--brand)',
    pass: 'var(--status-pass-solid)',
    obs: 'var(--status-obs-solid)',
    fail: 'var(--status-fail-solid)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 6
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)',
      fontWeight: 'var(--fw-medium)'
    }
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-strong)',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, Math.round(value), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      width: '100%',
      height: h,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--stone-200)',
      overflow: 'hidden',
      gap: segments ? 2 : 0
    }
  }, segments ? segments.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: `${s.label || ''} ${s.value}%`,
    style: {
      width: `${s.value}%`,
      height: '100%',
      background: tones[s.tone] || tones.brand,
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--dur-slow) var(--ease-standard)'
    }
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.max(0, Math.min(100, value))}%`,
      height: '100%',
      background: tones[tone] || tones.brand,
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--dur-slow) var(--ease-standard)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Callout.jsx
try { (() => {
function CalloutIcon({
  tone
}) {
  const c = 'currentColor';
  if (tone === 'pass') return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "9",
    stroke: c,
    strokeWidth: "1.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 10.5l2.5 2.5 5-6",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
  if (tone === 'fail') return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "9",
    stroke: c,
    strokeWidth: "1.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 7l6 6M13 7l-6 6",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }));
  if (tone === 'obs') return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2.5L18.5 17H1.5L10 2.5Z",
    stroke: c,
    strokeWidth: "1.6",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 8v4",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "14.5",
    r: "1",
    fill: c
  }));
  return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "9",
    stroke: c,
    strokeWidth: "1.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 9v5",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "6",
    r: "1.1",
    fill: c
  }));
}
function Callout({
  tone = 'info',
  title,
  children,
  action,
  onDismiss
}) {
  const map = {
    info: {
      bg: 'var(--blue-50)',
      line: 'var(--blue-100)',
      fg: 'var(--blue-600)',
      text: 'var(--stone-700)'
    },
    pass: {
      bg: 'var(--status-pass-bg)',
      line: 'var(--status-pass-line)',
      fg: 'var(--status-pass-fg)',
      text: 'var(--stone-700)'
    },
    obs: {
      bg: 'var(--status-obs-bg)',
      line: 'var(--status-obs-line)',
      fg: 'var(--status-obs-fg)',
      text: 'var(--stone-700)'
    },
    fail: {
      bg: 'var(--status-fail-bg)',
      line: 'var(--status-fail-line)',
      fg: 'var(--status-fail-fg)',
      text: 'var(--stone-700)'
    }
  };
  const c = map[tone] || map.info;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      background: c.bg,
      border: `1px solid ${c.line}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: c.fg,
      flex: 'none',
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement(CalloutIcon, {
    tone: tone
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      marginBottom: children ? 3 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: c.text,
      lineHeight: 1.5
    }
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, action)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      flex: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-subtle)',
      padding: 2,
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }))));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Callout.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ScoreGauge.jsx
try { (() => {
const {
  useState,
  useEffect,
  useRef,
  useId
} = React;
const EASE = t => 1 - Math.pow(1 - t, 3); // easeOutCubic — calm, decisive

function useCountUp(target, run, ms = 900) {
  const [n, setN] = useState(run ? 0 : target);
  const raf = useRef(0);
  useEffect(() => {
    if (!run) {
      setN(target);
      return;
    }
    const from = 0,
      start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / ms);
      setN(from + (target - from) * EASE(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, run, ms]);
  return n;
}
const TONE_STOPS = {
  brand: ['var(--clay-400)', 'var(--brand)', 'var(--brand-strong)'],
  pass: ['#5BAE6E', 'var(--status-pass-solid)', '#2F7B45'],
  obs: ['#E0A53D', 'var(--status-obs-solid)', '#B97914'],
  fail: ['#D2566A', 'var(--status-fail-solid)', '#A12E43']
};
const TONE_CAPTION = {
  pass: 'Audit-ready',
  obs: 'In progress',
  fail: 'Needs work',
  brand: 'Readiness'
};
function ScoreGauge({
  value = 0,
  label,
  size = 132,
  thickness = 12,
  tone,
  animate = true,
  caption
}) {
  const v = Math.max(0, Math.min(100, value));
  const auto = v >= 85 ? 'pass' : v >= 60 ? 'obs' : 'fail';
  const key = tone || auto;
  const [solid, mid, deep] = TONE_STOPS[key] || TONE_STOPS.brand;
  const uid = useId().replace(/:/g, '');
  const gradId = `gauge-grad-${uid}`;
  const glowId = `gauge-glow-${uid}`;
  const n = useCountUp(v, animate);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = n / 100 * circ;
  const cap = caption ?? TONE_CAPTION[key];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gradId,
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: solid
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.55",
    stopColor: mid
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: deep
  })), /*#__PURE__*/React.createElement("filter", {
    id: glowId,
    x: "-30%",
    y: "-30%",
    width: "160%",
    height: "160%"
  }, /*#__PURE__*/React.createElement("feDropShadow", {
    dx: "0",
    dy: "1.5",
    stdDeviation: "2",
    floodColor: deep,
    floodOpacity: "0.35"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cx,
    r: r,
    fill: "none",
    stroke: "var(--stone-200)",
    strokeWidth: thickness
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cx,
    r: r,
    fill: "none",
    stroke: "rgba(33,29,24,0.06)",
    strokeWidth: thickness,
    strokeDasharray: `0.5 ${circ}`,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cx,
    r: r,
    fill: "none",
    stroke: `url(#${gradId})`,
    strokeWidth: thickness,
    strokeLinecap: "round",
    strokeDasharray: `${dash} ${circ - dash}`,
    filter: `url(#${glowId})`
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cx,
    r: r,
    fill: "none",
    stroke: "rgba(255,255,255,0.28)",
    strokeWidth: thickness * 0.34,
    strokeLinecap: "round",
    strokeDasharray: `${dash} ${circ - dash}`,
    style: {
      transform: `translateY(${-thickness * 0.16}px)`,
      transformBox: 'fill-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: size * 0.30,
      fontWeight: 700,
      color: 'var(--text-strong)',
      lineHeight: 1,
      letterSpacing: '-0.03em',
      fontVariantNumeric: 'tabular-nums'
    }
  }, Math.round(n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.14,
      color: 'var(--text-subtle)'
    }
  }, "%")), cap && /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: size * 0.04,
      fontSize: size * 0.085,
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: deep
    }
  }, cap))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-medium)'
    }
  }, label));
}
Object.assign(__ds_scope, { ScoreGauge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ScoreGauge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tabs.jsx
try { (() => {
const {
  useState
} = React;
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange
}) {
  const isControlled = value !== undefined;
  const first = defaultValue ?? (tabs[0] && tabs[0].id);
  const [internal, setInternal] = useState(first);
  const active = isControlled ? value : internal;
  const select = id => {
    if (!isControlled) setInternal(id);
    onChange && onChange(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'inline-flex',
      gap: 2,
      alignItems: 'center',
      padding: 3,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)'
    }
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      role: "tab",
      "aria-selected": on,
      onClick: () => select(t.id),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 14px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--fw-medium)',
        color: on ? 'var(--text-strong)' : 'var(--text-muted)',
        background: on ? 'var(--surface-card)' : 'transparent',
        boxShadow: on ? 'var(--shadow-xs)' : 'none',
        transition: 'background var(--dur-fast), color var(--dur-fast)'
      }
    }, t.label, t.count !== undefined && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--brand-soft)' : 'var(--stone-200)',
        color: on ? 'var(--brand-strong)' : 'var(--text-muted)'
      }
    }, t.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const SIZES = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 12px',
    font: 'var(--text-sm)',
    gap: '6px'
  },
  md: {
    height: 'var(--control-h-md)',
    padding: '0 16px',
    font: 'var(--text-md)',
    gap: '8px'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 22px',
    font: 'var(--text-lg)',
    gap: '8px'
  }
};

// Skeuomorphic depth recipe: a top-lit vertical gradient, a bright inner
// highlight along the top edge, a darker grounding edge at the bottom, and a
// soft drop shadow. On press, the gradient flips, the highlight gives way to an
// inset shadow, and the drop shadow collapses — the cap physically sinks in.
function raised({
  top,
  mid,
  bottom,
  edge,
  highlight,
  drop
}) {
  return {
    rest: {
      backgroundImage: `linear-gradient(180deg, ${top} 0%, ${mid} 48%, ${bottom} 100%)`,
      border: `1px solid ${edge}`,
      boxShadow: `inset 0 1px 0 ${highlight}, inset 0 -1px 1px rgba(33,29,24,0.14), 0 1px 1px rgba(33,29,24,0.10), ${drop}`
    },
    active: {
      backgroundImage: `linear-gradient(180deg, ${bottom} 0%, ${mid} 60%, ${top} 100%)`,
      border: `1px solid ${edge}`,
      boxShadow: `inset 0 2px 4px rgba(33,29,24,0.30), inset 0 1px 1px rgba(33,29,24,0.20)`
    }
  };
}
function variantStyle(variant, hover, active) {
  switch (variant) {
    case 'secondary':
      {
        const r = raised({
          top: hover ? '#FFFFFF' : '#FFFFFF',
          mid: hover ? 'var(--stone-50)' : '#FCFAF6',
          bottom: hover ? 'var(--stone-100)' : 'var(--stone-50)',
          edge: 'var(--border-default)',
          highlight: 'rgba(255,255,255,0.9)',
          drop: '0 2px 3px rgba(33,29,24,0.07)'
        });
        return {
          color: 'var(--text-strong)',
          ...(active ? r.active : r.rest)
        };
      }
    case 'ghost':
      return {
        background: hover ? 'var(--stone-100)' : 'transparent',
        color: 'var(--text-body)',
        border: '1px solid transparent',
        boxShadow: active ? 'inset 0 1px 3px rgba(33,29,24,0.14)' : 'none'
      };
    case 'danger':
      {
        const r = raised({
          top: hover ? 'var(--red-500)' : '#C9485B',
          mid: hover ? 'var(--red-600)' : 'var(--red-500)',
          bottom: hover ? 'var(--red-700)' : 'var(--red-600)',
          edge: 'var(--red-700)',
          highlight: 'rgba(255,255,255,0.28)',
          drop: '0 2px 4px rgba(122,32,48,0.30)'
        });
        return {
          color: '#fff',
          ...(active ? r.active : r.rest)
        };
      }
    case 'primary':
    default:
      {
        // Brushed-metal treatment: a multi-stop gradient with a hard reflection
        // break near the middle and reflected light brightening the bottom edge,
        // wrapped in a crisp bevel (bright top line + dark inner base).
        if (active) {
          return {
            color: 'var(--brand-on)',
            backgroundImage: 'linear-gradient(180deg, var(--clay-800) 0%, var(--clay-700) 46%, var(--clay-600) 54%, var(--clay-500) 100%)',
            border: '1px solid var(--clay-900)',
            boxShadow: 'inset 0 2px 5px rgba(33,29,24,0.45), inset 0 1px 1px rgba(33,29,24,0.30)'
          };
        }
        const top = hover ? 'color-mix(in srgb, var(--clay-200) 70%, #fff)' : 'color-mix(in srgb, var(--clay-300) 72%, #fff)';
        const up = hover ? 'var(--clay-300)' : 'var(--clay-400)';
        const upMid = hover ? 'var(--clay-400)' : 'var(--clay-500)';
        const loMid = hover ? 'var(--clay-600)' : 'var(--clay-700)';
        const lo = hover ? 'var(--clay-500)' : 'var(--clay-600)';
        const foot = hover ? 'var(--clay-400)' : 'var(--clay-500)';
        return {
          color: 'var(--brand-on)',
          backgroundImage: `linear-gradient(180deg, ${top} 0%, ${up} 5%, ${upMid} 45%, ${loMid} 52%, ${lo} 94%, ${foot} 100%)`,
          border: '1px solid var(--clay-800)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 -1px 1px rgba(33,29,24,0.32), 0 1px 1px rgba(33,29,24,0.10), 0 2px 6px rgba(74,37,23,0.34)'
        };
      }
  }
}
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  style: styleOverride,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = variantStyle(variant, hover && !disabled, active && !disabled);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      fontFamily: 'var(--font-sans)',
      fontSize: s.font,
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1,
      letterSpacing: '0.005em',
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transform: active && !disabled ? 'translateY(1px)' : 'none',
      transition: 'background-image var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast), transform var(--dur-fast)',
      whiteSpace: 'nowrap',
      ...v,
      ...styleOverride
    }
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flex: 'none'
    }
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
const {
  useState
} = React;
function Checkbox({
  label,
  description,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  id
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const fid = id || (label ? `cb-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const handle = e => {
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: description ? 'flex-start' : 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      flex: 'none',
      marginTop: description ? 1 : 0
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: handle,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 18,
      height: 18,
      margin: 0,
      cursor: 'inherit'
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 18,
      height: 18,
      display: 'grid',
      placeItems: 'center',
      border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-xs)',
      background: on ? 'var(--brand)' : 'var(--surface-card)',
      transition: 'background var(--dur-fast), border-color var(--dur-fast)'
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.5l3 3 6-7",
    stroke: "#fff",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))), (label || description) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-md)',
      color: 'var(--text-strong)',
      fontWeight: 'var(--fw-medium)',
      lineHeight: 1.3
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      lineHeight: 1.4
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const IB_SIZES = {
  sm: 30,
  md: 38,
  lg: 46
};
function IconButton({
  children,
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  onClick,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const dim = IB_SIZES[size] || IB_SIZES.md;

  // Raised (skeuomorphic) styling for the solid variants; ghost/danger stay flat.
  const raised = {
    primary: {
      rest: {
        color: '#fff',
        backgroundImage: 'linear-gradient(180deg, color-mix(in srgb, var(--clay-300) 72%, #fff) 0%, var(--clay-400) 5%, var(--clay-500) 45%, var(--clay-700) 52%, var(--clay-600) 94%, var(--clay-500) 100%)',
        border: '1px solid var(--clay-800)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 -1px 1px rgba(33,29,24,0.32), 0 1px 1px rgba(33,29,24,0.10), 0 2px 6px rgba(74,37,23,0.34)'
      },
      active: {
        color: '#fff',
        backgroundImage: 'linear-gradient(180deg, var(--clay-800) 0%, var(--clay-700) 46%, var(--clay-600) 54%, var(--clay-500) 100%)',
        border: '1px solid var(--clay-900)',
        boxShadow: 'inset 0 2px 5px rgba(33,29,24,0.45), inset 0 1px 1px rgba(33,29,24,0.30)'
      }
    },
    secondary: {
      rest: {
        color: 'var(--text-body)',
        backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #FCFAF6 48%, var(--stone-50) 100%)',
        border: '1px solid var(--border-default)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 1px rgba(33,29,24,0.14), 0 1px 1px rgba(33,29,24,0.10), 0 2px 3px rgba(33,29,24,0.07)'
      },
      active: {
        color: 'var(--text-body)',
        backgroundImage: 'linear-gradient(180deg, var(--stone-100) 0%, #FCFAF6 60%, #FFFFFF 100%)',
        border: '1px solid var(--border-default)',
        boxShadow: 'inset 0 2px 4px rgba(33,29,24,0.30), inset 0 1px 1px rgba(33,29,24,0.20)'
      }
    }
  };
  const flat = {
    ghost: {
      bg: hover ? 'var(--stone-100)' : 'transparent',
      fg: 'var(--text-body)',
      bd: 'transparent'
    },
    danger: {
      bg: hover ? 'var(--red-50)' : 'transparent',
      fg: 'var(--red-600)',
      bd: 'transparent'
    }
  };
  const isRaised = raised[variant];
  const r = isRaised && (active && !disabled ? isRaised.active : isRaised.rest);
  const f = !isRaised && (flat[variant] || flat.ghost);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transform: isRaised && active && !disabled ? 'translateY(1px)' : 'none',
      transition: 'background-image var(--dur-fast) var(--ease-standard), background var(--dur-fast), box-shadow var(--dur-fast), transform var(--dur-fast)',
      ...(isRaised ? r : {
        color: f.fg,
        background: f.bg,
        border: `1px solid ${f.bd}`,
        boxShadow: active && !disabled ? 'inset 0 1px 3px rgba(33,29,24,0.14)' : 'none'
      }),
      ...rest.style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function Input({
  label,
  hint,
  error,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  size = 'md',
  iconLeft,
  disabled = false,
  required = false,
  onChange,
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const heights = {
    sm: 'var(--control-h-sm)',
    md: 'var(--control-h-md)',
    lg: 'var(--control-h-lg)'
  };
  const fid = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const borderColor = error ? 'var(--status-fail-solid)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-strong)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--red-500)',
      marginLeft: 2
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: heights[size] || heights.md,
      padding: '0 12px',
      background: disabled ? 'var(--stone-50)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'var(--shadow-inset)',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
      opacity: disabled ? 0.6 : 1
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-subtle)',
      flex: 'none'
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    required: required,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-md)',
      color: 'var(--text-strong)'
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--status-fail-fg)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function Select({
  label,
  hint,
  value,
  defaultValue,
  options = [],
  placeholder,
  size = 'md',
  disabled = false,
  onChange,
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const heights = {
    sm: 'var(--control-h-sm)',
    md: 'var(--control-h-md)',
    lg: 'var(--control-h-lg)'
  };
  const fid = id || (label ? `sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      width: '100%',
      height: heights[size] || heights.md,
      padding: '0 36px 0 12px',
      background: disabled ? 'var(--stone-50)' : 'var(--surface-card)',
      border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'var(--shadow-xs)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-md)',
      color: 'var(--text-strong)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      outline: 'none',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)'
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      position: 'absolute',
      right: 12,
      pointerEvents: 'none',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
const {
  useState
} = React;
function Switch({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  id
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const fid = id || (label ? `sw-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (!isControlled) setInternal(next);
    onChange && onChange(next);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    id: fid,
    type: "button",
    role: "switch",
    "aria-checked": on,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: 'relative',
      width: 38,
      height: 22,
      flex: 'none',
      padding: 0,
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: 'inherit',
      background: on ? 'var(--brand)' : 'var(--stone-300)',
      transition: 'background var(--dur-medium) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-medium) var(--ease-emphasized)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-md)',
      color: 'var(--text-strong)',
      fontWeight: 'var(--fw-medium)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Carousel.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect,
  useCallback
} = React;
function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on);
    };
  }, []);
  return reduce;
}
function Arrow({
  dir,
  onClick,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": dir === 'next' ? 'Next slide' : 'Previous slide',
    onClick: onClick,
    disabled: disabled,
    style: {
      width: 36,
      height: 36,
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      borderRadius: '50%',
      cursor: disabled ? 'default' : 'pointer',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      color: disabled ? 'var(--text-subtle)' : 'var(--text-body)',
      boxShadow: 'var(--shadow-sm)',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--dur-fast), opacity var(--dur-fast)',
      ...style
    },
    onMouseEnter: e => {
      if (!disabled) e.currentTarget.style.background = 'var(--stone-50)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'var(--surface-card)';
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, dir === 'next' ? /*#__PURE__*/React.createElement("path", {
    d: "m9 18 6-6-6-6"
  }) : /*#__PURE__*/React.createElement("path", {
    d: "m15 18-6-6 6-6"
  })));
}
function Dots({
  count,
  active,
  onDot
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": "Slides",
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Array.from({
    length: count
  }).map((_, i) => {
    const on = i === active;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      role: "tab",
      "aria-selected": on,
      "aria-label": `Go to slide ${i + 1}`,
      onClick: () => onDot(i),
      style: {
        width: on ? 22 : 8,
        height: 8,
        padding: 0,
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--brand)' : 'var(--stone-300)',
        transition: 'width var(--dur-medium) var(--ease-standard), background var(--dur-fast)'
      }
    });
  }));
}

/* ---------------- Row variant: native scroll-snap card rows ---------------- */
function RowCarousel({
  slides,
  slideWidth,
  gap,
  showArrows,
  ariaLabel
}) {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const step = (typeof slideWidth === 'number' ? slideWidth : 300) + gap;
  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);
  useEffect(() => {
    update();
  }, [update, slides.length]);
  const scrollByCards = dir => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * step,
      behavior: 'smooth'
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "region",
    "aria-roledescription": "carousel",
    "aria-label": ariaLabel,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    onScroll: update,
    style: {
      display: 'flex',
      gap,
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      padding: '2px 2px 10px'
    }
  }, slides.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    role: "group",
    "aria-roledescription": "slide",
    "aria-label": `${i + 1} of ${slides.length}`,
    style: {
      flex: 'none',
      width: slideWidth,
      scrollSnapAlign: 'start'
    }
  }, s))), showArrows && !atStart && /*#__PURE__*/React.createElement(Arrow, {
    dir: "prev",
    onClick: () => scrollByCards(-1),
    style: {
      position: 'absolute',
      left: -14,
      top: 'calc(50% - 24px)'
    }
  }), showArrows && !atEnd && /*#__PURE__*/React.createElement(Arrow, {
    dir: "next",
    onClick: () => scrollByCards(1),
    style: {
      position: 'absolute',
      right: -14,
      top: 'calc(50% - 24px)'
    }
  }));
}

/* ---------------- Page variant: one slide per view, transform-based --------- */
function Carousel({
  children,
  index,
  defaultIndex = 0,
  onSlideChange,
  variant = 'page',
  showArrows = true,
  showDots = true,
  slideWidth = 300,
  gap = 16,
  ariaLabel = 'Carousel'
}) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const controlled = index !== undefined;
  const [internal, setInternal] = useState(defaultIndex);
  const active = Math.max(0, Math.min(count - 1, controlled ? index : internal));
  const reduce = useReducedMotion();
  const go = useCallback(next => {
    const clamped = Math.max(0, Math.min(count - 1, next));
    if (!controlled) setInternal(clamped);
    onSlideChange && onSlideChange(clamped);
  }, [count, controlled, onSlideChange]);
  if (variant === 'row') {
    return /*#__PURE__*/React.createElement(RowCarousel, {
      slides: slides,
      slideWidth: slideWidth,
      gap: gap,
      showArrows: showArrows,
      ariaLabel: ariaLabel
    });
  }
  const wrapRef = useRef(null);
  const startX = useRef(null);
  const widthRef = useRef(1);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = e => {
    if (e.target.closest('input,textarea,select,button,a')) {
      startX.current = null;
      return;
    }
    startX.current = e.clientX;
    widthRef.current = wrapRef.current ? wrapRef.current.offsetWidth : 1;
    setDragging(true);
  };
  const onPointerMove = e => {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  };
  const endDrag = () => {
    if (startX.current === null) {
      setDragging(false);
      return;
    }
    const threshold = Math.min(80, widthRef.current * 0.18);
    if (drag <= -threshold) go(active + 1);else if (drag >= threshold) go(active - 1);
    startX.current = null;
    setDrag(0);
    setDragging(false);
  };
  const onKeyDown = e => {
    const t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "region",
    "aria-roledescription": "carousel",
    "aria-label": ariaLabel,
    tabIndex: 0,
    onKeyDown: onKeyDown,
    style: {
      outline: 'none'
    },
    onFocus: e => {
      if (e.target === e.currentTarget) e.currentTarget.style.boxShadow = 'var(--ring)';
      e.currentTarget.style.borderRadius = 'var(--radius-lg)';
    },
    onBlur: e => {
      e.currentTarget.style.boxShadow = 'none';
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, showArrows && /*#__PURE__*/React.createElement(Arrow, {
    dir: "prev",
    onClick: () => go(active - 1),
    disabled: active === 0
  }), /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      flex: 1,
      overflow: 'hidden',
      minWidth: 0,
      touchAction: 'pan-y'
    },
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: endDrag,
    onPointerLeave: endDrag,
    onPointerCancel: endDrag
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      transform: `translateX(calc(${-active * 100}% + ${drag}px))`,
      transition: dragging || reduce ? 'none' : 'transform var(--dur-medium) var(--ease-emphasized)',
      cursor: dragging ? 'grabbing' : 'grab'
    }
  }, slides.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    role: "group",
    "aria-roledescription": "slide",
    "aria-label": `${i + 1} of ${count}`,
    "aria-hidden": i !== active,
    style: {
      flex: '0 0 100%',
      minWidth: 0,
      boxSizing: 'border-box',
      userSelect: dragging ? 'none' : 'auto'
    }
  }, s)))), showArrows && /*#__PURE__*/React.createElement(Arrow, {
    dir: "next",
    onClick: () => go(active + 1),
    disabled: active === count - 1
  })), showDots && count > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Dots, {
    count: count,
    active: active,
    onDot: go
  })));
}
Object.assign(__ds_scope, { Carousel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Carousel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Assessment.jsx
try { (() => {
const {
  useState: useAState
} = React;
const OUTCOMES = [{
  key: 'conformant',
  label: 'Conformant',
  desc: 'Requirement fully met',
  tone: 'pass'
}, {
  key: 'observation',
  label: 'Observation',
  desc: 'Minor gap / opportunity',
  tone: 'obs'
}, {
  key: 'nonconformity',
  label: 'Nonconformity',
  desc: 'Requirement not met',
  tone: 'fail'
}, {
  key: 'notassessed',
  label: 'Not assessed',
  desc: 'Skip for now',
  tone: 'na'
}];
const TONE_OF = {
  conformant: 'pass',
  observation: 'obs',
  nonconformity: 'fail',
  notassessed: 'na'
};
function OutcomeOption({
  outcome,
  selected,
  onClick
}) {
  const Icon = window.AFIcon;
  const iconMap = {
    conformant: 'check',
    observation: 'alert-triangle',
    nonconformity: 'x',
    notassessed: 'clock'
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '12px 14px',
      textAlign: 'left',
      cursor: 'pointer',
      borderRadius: 'var(--radius-md)',
      width: '100%',
      border: `1.5px solid ${selected ? `var(--status-${outcome.tone}-solid)` : 'var(--border-default)'}`,
      background: selected ? `var(--status-${outcome.tone}-bg)` : 'var(--surface-card)',
      boxShadow: selected ? 'none' : 'var(--shadow-xs)',
      transition: 'border-color var(--dur-fast), background var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 'var(--radius-sm)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      background: `var(--status-${outcome.tone}-solid)`,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: iconMap[outcome.key],
    size: 17
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, outcome.label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, outcome.desc)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: '50%',
      flex: 'none',
      border: `1.5px solid ${selected ? `var(--status-${outcome.tone}-solid)` : 'var(--border-strong)'}`,
      background: selected ? `var(--status-${outcome.tone}-solid)` : 'transparent',
      display: 'grid',
      placeItems: 'center'
    }
  }, selected && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "#fff"
  })));
}

// One question = one slide. Reads/writes its OWN answer by ref, so every slide
// stays mounted and unsaved input survives swiping (form-safe carousel).
function QuestionSlide({
  q,
  number,
  total,
  answer,
  onOutcome,
  onEvidence,
  onNotes
}) {
  const DS = window.AuditFlowDesignSystem_900961;
  const {
    Card,
    Input,
    ConformanceBadge
  } = DS;
  const Icon = window.AFIcon;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 4px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    elevation: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      fontWeight: 600,
      color: '#fff',
      background: 'var(--brand)',
      padding: '3px 9px',
      borderRadius: 'var(--radius-sm)'
    }
  }, q.ref), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "Question ", number, " of ", total)), answer.outcome && /*#__PURE__*/React.createElement(ConformanceBadge, {
    status: answer.outcome
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      color: 'var(--text-strong)',
      lineHeight: 1.3,
      margin: '0 0 12px'
    }
  }, q.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      alignItems: 'flex-start',
      padding: '11px 13px',
      background: 'var(--blue-50)',
      border: '1px solid var(--blue-100)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-help",
    size: 17,
    color: "var(--blue-600)",
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--stone-700)',
      lineHeight: 1.5
    }
  }, q.guidance)), /*#__PURE__*/React.createElement("span", {
    className: "af-eyebrow",
    style: {
      display: 'block',
      marginBottom: 10
    }
  }, "Conformity rating"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 22
    }
  }, OUTCOMES.map(o => /*#__PURE__*/React.createElement(OutcomeOption, {
    key: o.key,
    outcome: o,
    selected: answer.outcome === o.key,
    onClick: () => onOutcome(q.ref, o.key)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Evidence reference",
    placeholder: "e.g. QP-7.5 Rev 4, calibration register",
    value: answer.evidence || '',
    onChange: e => onEvidence(q.ref, e.target.value),
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "paperclip",
      size: 16
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-strong)'
    }
  }, "Auditor notes"), /*#__PURE__*/React.createElement("textarea", {
    value: answer.notes || '',
    onChange: e => onNotes(q.ref, e.target.value),
    placeholder: "Record what you observed and any gap to close\u2026",
    rows: 3,
    style: {
      resize: 'vertical',
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-default)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      color: 'var(--text-strong)',
      background: 'var(--surface-card)',
      boxShadow: 'var(--shadow-inset)',
      outline: 'none'
    },
    onFocus: e => {
      e.target.style.borderColor = 'var(--border-focus)';
      e.target.style.boxShadow = 'var(--ring)';
    },
    onBlur: e => {
      e.target.style.borderColor = 'var(--border-default)';
      e.target.style.boxShadow = 'var(--shadow-inset)';
    }
  })))));
}
function Assessment() {
  const DS = window.AuditFlowDesignSystem_900961;
  const {
    Card,
    Button,
    Carousel,
    ProgressBar
  } = DS;
  const Icon = window.AFIcon;
  const {
    QUESTIONS
  } = window.AFData;
  const [idx, setIdx] = useAState(0);
  const [answers, setAnswers] = useAState({});
  const answeredCount = Object.keys(answers).filter(k => answers[k].outcome).length;
  const setOutcome = (ref, outcome) => setAnswers(a => ({
    ...a,
    [ref]: {
      ...a[ref],
      outcome
    }
  }));
  const setEvidence = (ref, v) => setAnswers(a => ({
    ...a,
    [ref]: {
      ...a[ref],
      evidence: v
    }
  }));
  const setNotes = (ref, v) => setAnswers(a => ({
    ...a,
    [ref]: {
      ...a[ref],
      notes: v
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: 22,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    elevation: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 18px 12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "af-eyebrow"
  }, "Clause 7 \u2014 Support"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 6
    }
  }, answeredCount, " of ", QUESTIONS.length, " answered")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-subtle)'
    }
  }, QUESTIONS.map((item, i) => {
    const a = answers[item.ref] || {};
    const on = i === idx;
    const tone = a.outcome ? TONE_OF[a.outcome] : null;
    return /*#__PURE__*/React.createElement("button", {
      key: item.ref,
      onClick: () => setIdx(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '11px 18px',
        border: 'none',
        borderLeft: `2.5px solid ${on ? 'var(--brand)' : 'transparent'}`,
        background: on ? 'var(--brand-soft)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        flex: 'none',
        background: tone ? `var(--status-${tone}-solid)` : 'var(--stone-300)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "af-mono",
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: on ? 'var(--brand-strong)' : 'var(--text-body)'
      }
    }, item.ref));
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--text-body)'
    }
  }, "Question ", idx + 1, " of ", QUESTIONS.length, " \u2014 Clause 7 \xB7 Support"), /*#__PURE__*/React.createElement("span", {
    className: "af-mono",
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, Math.round((idx + 1) / QUESTIONS.length * 100), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: (idx + 1) / QUESTIONS.length * 100,
    size: "sm"
  })), /*#__PURE__*/React.createElement(Carousel, {
    variant: "page",
    index: idx,
    onSlideChange: setIdx,
    ariaLabel: "Assessment questions"
  }, QUESTIONS.map((item, i) => /*#__PURE__*/React.createElement(QuestionSlide, {
    key: item.ref,
    q: item,
    number: i + 1,
    total: QUESTIONS.length,
    answer: answers[item.ref] || {},
    onOutcome: setOutcome,
    onEvidence: setEvidence,
    onNotes: setNotes
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Save draft"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setIdx(i => Math.min(i + 1, QUESTIONS.length - 1)),
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    disabled: idx === QUESTIONS.length - 1
  }, "Save & next"))));
}
window.AFAssessment = Assessment;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Assessment.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Dashboard.jsx
try { (() => {
function Dashboard({
  onOpenFindings,
  onStartAssessment,
  showBanner = true
}) {
  const DS = window.AuditFlowDesignSystem_900961;
  const {
    Card,
    ScoreGauge,
    ConformanceBadge,
    ProgressBar,
    Badge,
    Button,
    Callout,
    Carousel
  } = DS;
  const Icon = window.AFIcon;
  const {
    CLAUSES,
    FINDINGS,
    ACTIVITY
  } = window.AFData;
  const totals = CLAUSES.reduce((a, c) => ({
    total: a.total + c.total,
    conformant: a.conformant + c.conformant,
    observation: a.observation + c.observation,
    nonconformity: a.nonconformity + c.nonconformity
  }), {
    total: 0,
    conformant: 0,
    observation: 0,
    nonconformity: 0
  });
  const Stat = ({
    icon,
    tone,
    value,
    label
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-md)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      background: `var(--status-${tone}-bg)`,
      color: `var(--status-${tone}-fg)`
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 26,
      fontWeight: 700,
      color: 'var(--text-strong)',
      lineHeight: 1,
      letterSpacing: '-0.02em'
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, label)));
  const ActivityCard = ({
    a
  }) => /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    elevation: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "af-mono",
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, a.id), a.kind === 'audit' ? /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    dot: true
  }, "Audit") : /*#__PURE__*/React.createElement(Badge, {
    tone: a.score >= 85 ? 'pass' : a.score >= 60 ? 'obs' : 'fail'
  }, a.score, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 600,
      color: 'var(--text-strong)',
      lineHeight: 1.3
    }
  }, a.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, a.meta), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.kind === 'audit' ? 'calendar' : 'clock',
    size: 14,
    color: "var(--text-subtle)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, a.when)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, showBanner && /*#__PURE__*/React.createElement(Callout, {
    tone: "fail",
    title: "2 nonconformities are blocking your certification audit",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "danger",
      onClick: onOpenFindings
    }, "Review findings")
  }, "Clauses 8.5.1 and 9.2.2 have open major findings past their due date. Resolve and verify before 30 June."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    elevation: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "af-eyebrow"
  }, "Audit readiness"), /*#__PURE__*/React.createElement(ScoreGauge, {
    value: 92,
    size: 156,
    thickness: 14
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: 'var(--status-pass-fg)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trending-up",
    size: 15
  }), " +6 pts since last review"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "clipboard-check",
      size: 17
    }),
    onClick: onStartAssessment
  }, "Continue self-assessment"))), /*#__PURE__*/React.createElement(Card, {
    title: "This management system at a glance",
    subtitle: "113 controls across ISO 9001:2015 clauses 4\u201310",
    padding: "lg",
    elevation: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 22,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    icon: "check",
    tone: "pass",
    value: totals.conformant,
    label: "Conformant"
  }), /*#__PURE__*/React.createElement(Stat, {
    icon: "alert-triangle",
    tone: "obs",
    value: totals.observation,
    label: "Observations"
  }), /*#__PURE__*/React.createElement(Stat, {
    icon: "x",
    tone: "fail",
    value: totals.nonconformity,
    label: "Nonconformities"
  }), /*#__PURE__*/React.createElement(Stat, {
    icon: "clock",
    tone: "na",
    value: totals.total - totals.conformant - totals.observation - totals.nonconformity,
    label: "Not yet assessed"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: '20px 0 16px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-body)'
    }
  }, "Overall conformity"), /*#__PURE__*/React.createElement("span", {
    className: "af-mono",
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, "87.5%")), /*#__PURE__*/React.createElement(ProgressBar, {
    segments: [{
      value: Math.round(totals.conformant / totals.total * 100),
      tone: 'pass'
    }, {
      value: Math.round(totals.observation / totals.total * 100),
      tone: 'obs'
    }, {
      value: Math.round(totals.nonconformity / totals.total * 100),
      tone: 'fail'
    }],
    size: "lg"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Recent activity & upcoming audits"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 15
    })
  }, "View all")), /*#__PURE__*/React.createElement(Carousel, {
    variant: "row",
    slideWidth: 248,
    gap: 14,
    ariaLabel: "Recent activity and upcoming audits"
  }, ACTIVITY.map(a => /*#__PURE__*/React.createElement(ActivityCard, {
    key: a.id,
    a: a
  })))), /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    elevation: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 20px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Conformity by clause"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "Self-assessment progress per ISO 9001 section")), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 15
    })
  }, "Full report")), /*#__PURE__*/React.createElement("div", null, CLAUSES.map((c, i) => {
    const pct = Math.round(c.conformant / c.total * 100);
    const status = c.nonconformity > 0 ? 'nonconformity' : c.observation > 0 ? 'observation' : 'conformant';
    return /*#__PURE__*/React.createElement("div", {
      key: c.id,
      style: {
        display: 'grid',
        gridTemplateColumns: '38px 1fr 200px 130px 110px',
        alignItems: 'center',
        gap: 16,
        padding: '13px 20px',
        borderTop: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "af-mono",
      style: {
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--brand)'
      }
    }, c.id), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14.5,
        fontWeight: 500,
        color: 'var(--text-strong)'
      }
    }, c.title), /*#__PURE__*/React.createElement(ProgressBar, {
      segments: [{
        value: c.conformant / c.total * 100,
        tone: 'pass'
      }, {
        value: c.observation / c.total * 100,
        tone: 'obs'
      }, {
        value: c.nonconformity / c.total * 100,
        tone: 'fail'
      }]
    }), /*#__PURE__*/React.createElement("span", {
      className: "af-mono",
      style: {
        fontSize: 13,
        color: 'var(--text-muted)'
      }
    }, c.conformant, "/", c.total, " \xB7 ", pct, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        justifySelf: 'end'
      }
    }, /*#__PURE__*/React.createElement(ConformanceBadge, {
      status: status
    })));
  }))));
}
window.AFDashboard = Dashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Findings.jsx
try { (() => {
const {
  useState: useFState
} = React;
function Findings() {
  const DS = window.AuditFlowDesignSystem_900961;
  const {
    Card,
    Tabs,
    ConformanceBadge,
    Avatar,
    Badge,
    Button,
    IconButton
  } = DS;
  const Icon = window.AFIcon;
  const {
    FINDINGS
  } = window.AFData;
  const [tab, setTab] = useFState('open');
  const open = FINDINGS.filter(f => f.status !== 'closed');
  const ncs = FINDINGS.filter(f => f.status === 'nonconformity');
  const shown = tab === 'nc' ? ncs : tab === 'obs' ? FINDINGS.filter(f => f.status === 'observation') : open;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      id: 'open',
      label: 'All open',
      count: open.length
    }, {
      id: 'nc',
      label: 'Nonconformities',
      count: ncs.length
    }, {
      id: 'obs',
      label: 'Observations',
      count: FINDINGS.filter(f => f.status === 'observation').length
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "md",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "filter",
      size: 16
    })
  }, "Filter"), /*#__PURE__*/React.createElement(Button, {
    size: "md",
    variant: "primary",
    style: {
      background: 'rgba(189, 109, 74, 0.976)'
    },
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16
    })
  }, "Log finding"))), /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    elevation: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '150px 70px 1fr 160px 130px 44px',
      gap: 14,
      padding: '12px 20px',
      background: 'var(--stone-50)',
      borderBottom: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontWeight: 600,
      color: 'var(--text-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Finding"), /*#__PURE__*/React.createElement("span", null, "Clause"), /*#__PURE__*/React.createElement("span", null, "Description"), /*#__PURE__*/React.createElement("span", null, "Owner"), /*#__PURE__*/React.createElement("span", null, "Due"), /*#__PURE__*/React.createElement("span", null)), shown.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    style: {
      display: 'grid',
      gridTemplateColumns: '150px 70px 1fr 160px 130px 44px',
      gap: 14,
      alignItems: 'center',
      padding: '14px 20px',
      borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "af-mono",
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, f.id), /*#__PURE__*/React.createElement(ConformanceBadge, {
    status: f.status,
    label: f.severity
  })), /*#__PURE__*/React.createElement("span", {
    className: "af-mono",
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--brand)'
    }
  }, f.clause), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-body)',
      lineHeight: 1.4
    }
  }, f.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: f.owner,
    size: "sm",
    tone: "slate"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-body)'
    }
  }, f.owner)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 15,
    color: f.overdue ? 'var(--status-fail-solid)' : 'var(--text-subtle)'
  }), /*#__PURE__*/React.createElement("span", {
    className: "af-mono",
    style: {
      fontSize: 13,
      color: f.overdue ? 'var(--status-fail-fg)' : 'var(--text-muted)',
      fontWeight: f.overdue ? 600 : 400
    }
  }, f.due)), /*#__PURE__*/React.createElement(IconButton, {
    label: "More actions",
    variant: "ghost",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "more-horizontal",
    size: 18
  }))))));
}
window.AFFindings = Findings;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Findings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Login.jsx
try { (() => {
function Login({
  onSignIn
}) {
  const DS = window.AuditFlowDesignSystem_900961;
  const {
    Button,
    Input,
    Checkbox
  } = DS;
  const Icon = window.AFIcon;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      height: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-full.svg",
    alt: "AuditFlow",
    style: {
      height: 32,
      marginBottom: 36
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-3xl)',
      fontWeight: 600,
      color: 'var(--text-strong)',
      margin: '0 0 6px',
      letterSpacing: '-0.02em'
    }
  }, "Welcome back"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--text-muted)',
      margin: '0 0 28px'
    }
  }, "Sign in to continue your ISO 9001 self-assessment."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    type: "email",
    defaultValue: "dana.okoye@northwind.co",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "users",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Keep me signed in",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onSignIn,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 17
    })
  }, "Sign in")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 24,
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, "New to AuditFlow? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontWeight: 600
    }
  }, "Start a free assessment")))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--stone-900)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 56,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(var(--clay-900) 1px, transparent 1px), linear-gradient(90deg, var(--clay-900) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      background: 'rgba(255,255,255,0.08)',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 15,
    color: "var(--clay-200)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--clay-100)',
      letterSpacing: '0.02em'
    }
  }, "Audit-ready, year round")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 34,
      fontWeight: 600,
      color: '#fff',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      margin: '0 0 16px',
      maxWidth: 380
    }
  }, "Know exactly where you stand before the auditor arrives."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15.5,
      color: 'var(--stone-300)',
      lineHeight: 1.6,
      maxWidth: 360,
      margin: 0
    }
  }, "Self-assess against every ISO 9001 clause, capture evidence in one place, and close nonconformities before they become findings."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      marginTop: 36
    }
  }, [['113', 'controls tracked'], ['92%', 'audit readiness'], ['3', 'days to certification']].map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--clay-200)',
      letterSpacing: '-0.02em'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--stone-400)',
      marginTop: 2
    }
  }, l)))))));
}
window.AFLogin = Login;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Sidebar.jsx
try { (() => {
const NAV = [{
  id: 'dashboard',
  label: 'Dashboard',
  icon: 'layout-dashboard'
}, {
  id: 'assessment',
  label: 'Self-assessment',
  icon: 'clipboard-check'
}, {
  id: 'findings',
  label: 'Findings',
  icon: 'flag',
  badge: 8
}, {
  id: 'clauses',
  label: 'Clause library',
  icon: 'book-open'
}, {
  id: 'reports',
  label: 'Reports',
  icon: 'file-text'
}];
const NAV_SECONDARY = [{
  id: 'team',
  label: 'Team',
  icon: 'users'
}, {
  id: 'settings',
  label: 'Settings',
  icon: 'sliders'
}];
function Sidebar({
  active,
  onNavigate
}) {
  const Icon = window.AFIcon;
  const item = n => {
    const on = active === n.id;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => onNavigate && onNavigate(n.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        padding: '9px 12px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        background: on ? 'var(--brand-soft)' : 'transparent',
        color: on ? 'var(--brand-strong)' : 'var(--stone-300)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-md)',
        fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        textAlign: 'left',
        transition: 'background var(--dur-fast), color var(--dur-fast)'
      },
      onMouseEnter: e => {
        if (!on) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.color = '#fff';
        }
      },
      onMouseLeave: e => {
        if (!on) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--stone-300)';
        }
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 18,
      strokeWidth: on ? 2.2 : 1.9
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, n.label), n.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        padding: '1px 7px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(189, 109, 74, 0.976)',
        color: '#fff'
      }
    }, n.badge));
  };
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-width)',
      flex: 'none',
      height: '100%',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      gap: 4,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 8px 18px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-full-dark.svg",
    alt: "AuditFlow",
    style: {
      height: 30
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      marginBottom: 10,
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-sm)',
      background: 'rgba(189, 109, 74, 0.976)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 13,
      color: 'rgb(250, 246, 246)'
    }
  }, "NW")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#fff',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "Northwind Mfg."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--stone-400)'
    }
  }, "ISO 9001:2015")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 15,
    color: "var(--stone-400)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, NAV.map(item)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'rgba(255,255,255,0.08)',
      margin: '12px 8px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, NAV_SECONDARY.map(item)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'rgba(189, 109, 74, 0.976)',
      display: 'grid',
      placeItems: 'center',
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      flex: 'none'
    }
  }, "DO"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#fff'
    }
  }, "Dana Okoye"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--stone-400)'
    }
  }, "QHSE Manager")), /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 16,
    color: "var(--stone-400)"
  })));
}
window.AFSidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TopBar.jsx
try { (() => {
function TopBar({
  title,
  subtitle,
  actions
}) {
  const Icon = window.AFIcon;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 28px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-2xl)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      margin: 0,
      letterSpacing: '-0.02em'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 38,
      padding: '0 12px',
      minWidth: 240,
      background: 'var(--stone-50)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-subtle)'
    }
  }, "Search clauses, findings\u2026")), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Notifications",
    style: {
      position: 'relative',
      width: 38,
      height: 38,
      display: 'grid',
      placeItems: 'center',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 8,
      right: 9,
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--status-fail-solid)',
      border: '1.5px solid var(--surface-card)'
    }
  })), actions);
}
window.AFTopBar = TopBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.jsx
try { (() => {
// AuditFlow mock data — ISO 9001:2015 self-assessment

const CLAUSES = [{
  id: '4',
  title: 'Context of the organization',
  total: 12,
  conformant: 11,
  observation: 1,
  nonconformity: 0
}, {
  id: '5',
  title: 'Leadership',
  total: 14,
  conformant: 13,
  observation: 1,
  nonconformity: 0
}, {
  id: '6',
  title: 'Planning',
  total: 10,
  conformant: 8,
  observation: 2,
  nonconformity: 0
}, {
  id: '7',
  title: 'Support',
  total: 22,
  conformant: 16,
  observation: 4,
  nonconformity: 2
}, {
  id: '8',
  title: 'Operation',
  total: 28,
  conformant: 24,
  observation: 3,
  nonconformity: 1
}, {
  id: '9',
  title: 'Performance evaluation',
  total: 18,
  conformant: 15,
  observation: 2,
  nonconformity: 1
}, {
  id: '10',
  title: 'Improvement',
  total: 9,
  conformant: 9,
  observation: 0,
  nonconformity: 0
}];
const FINDINGS = [{
  id: 'NC-2026-0184',
  clause: '8.5.1',
  status: 'nonconformity',
  severity: 'Major',
  title: 'Production work instructions not at point of use',
  owner: 'Marcus Reid',
  due: '2026-06-18',
  overdue: true
}, {
  id: 'NC-2026-0179',
  clause: '9.2.2',
  status: 'nonconformity',
  severity: 'Major',
  title: 'Internal audit programme missed Q1 cycle',
  owner: 'Dana Okoye',
  due: '2026-06-09',
  overdue: true
}, {
  id: 'OB-2026-0203',
  clause: '7.1.5',
  status: 'observation',
  severity: 'Minor',
  title: 'Calibration records lack next-due dates for 3 gauges',
  owner: 'Priya Nair',
  due: '2026-06-27',
  overdue: false
}, {
  id: 'OB-2026-0198',
  clause: '6.1',
  status: 'observation',
  severity: 'Minor',
  title: 'Risk register not reviewed since last management review',
  owner: 'Dana Okoye',
  due: '2026-07-02',
  overdue: false
}, {
  id: 'OB-2026-0191',
  clause: '7.2',
  status: 'observation',
  severity: 'Minor',
  title: 'Competence matrix missing two new hires',
  owner: 'Sam Whitfield',
  due: '2026-07-05',
  overdue: false
}];

// One clause's question set, used in the Assessment screen
const QUESTIONS = [{
  ref: '7.1.5',
  text: 'Are monitoring and measuring resources suitable, maintained, and calibrated against traceable standards?',
  guidance: 'Evidence: calibration certificates, equipment register, recall records for out-of-tolerance devices.'
}, {
  ref: '7.1.6',
  text: 'Has the organization determined the knowledge necessary for the operation of its processes?',
  guidance: 'Evidence: lessons-learned log, knowledge-capture procedure, succession notes.'
}, {
  ref: '7.2',
  text: 'Is the competence of persons doing work under the QMS determined, evidenced, and maintained?',
  guidance: 'Evidence: training records, competence matrix, qualification certificates.'
}, {
  ref: '7.3',
  text: 'Are persons aware of the quality policy, relevant objectives, and their contribution to the QMS?',
  guidance: 'Evidence: induction records, awareness sessions, internal comms.'
}, {
  ref: '7.4',
  text: 'Has the organization determined internal and external communications relevant to the QMS?',
  guidance: 'Evidence: communication plan, stakeholder matrix.'
}];

// Recent assessment activity + upcoming audits — Dashboard row carousel
const ACTIVITY = [{
  kind: 'assessment',
  id: 'ASM-204',
  title: 'Q2 internal self-assessment',
  meta: 'Clauses 4–10 · 113 controls',
  score: 92,
  owner: 'Dana Okoye',
  when: 'Updated today'
}, {
  kind: 'assessment',
  id: 'ASM-198',
  title: 'Supplier evaluation review',
  meta: 'Clause 8.4 · 18 controls',
  score: 78,
  owner: 'Priya Nair',
  when: 'Updated 3 days ago'
}, {
  kind: 'audit',
  id: 'AUD-061',
  title: 'Stage 2 certification audit',
  meta: 'BSI · on-site',
  score: null,
  owner: 'External',
  when: 'In 14 days · 30 Jun'
}, {
  kind: 'assessment',
  id: 'ASM-186',
  title: 'Calibration & measurement',
  meta: 'Clause 7.1.5 · 9 controls',
  score: 88,
  owner: 'Marcus Reid',
  when: 'Updated 1 week ago'
}, {
  kind: 'audit',
  id: 'AUD-058',
  title: 'Internal audit — Operations',
  meta: 'Clause 8 · scheduled',
  score: null,
  owner: 'Sam Whitfield',
  when: 'In 21 days · 7 Jul'
}, {
  kind: 'assessment',
  id: 'ASM-180',
  title: 'Document & records control',
  meta: 'Clause 7.5 · 14 controls',
  score: 95,
  owner: 'Dana Okoye',
  when: 'Updated 2 weeks ago'
}];
window.AFData = {
  CLAUSES,
  FINDINGS,
  QUESTIONS,
  ACTIVITY
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/icons.jsx
try { (() => {
// AuditFlow icon set — Lucide (MIT). Embedded path data for the UI kit so the
// kit renders offline. In production, import from the `lucide-react` package.
const ICONS = {
  'layout-dashboard': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "9",
    x: "3",
    y: "3",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "5",
    x: "14",
    y: "3",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "9",
    x: "14",
    y: "12",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "5",
    x: "3",
    y: "16",
    rx: "1"
  })),
  'clipboard-check': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "8",
    height: "4",
    x: "8",
    y: "2",
    rx: "1",
    ry: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 14 2 2 4-4"
  })),
  'flag': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    x2: "4",
    y1: "22",
    y2: "15"
  })),
  'file-text': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v4a2 2 0 0 0 2 2h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 13H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 17H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 9H8"
  })),
  'sliders': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "21",
    x2: "14",
    y1: "4",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    x2: "3",
    y1: "4",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    x2: "12",
    y1: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    x2: "3",
    y1: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    x2: "16",
    y1: "20",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "3",
    y1: "20",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14",
    x2: "14",
    y1: "2",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    x2: "8",
    y1: "10",
    y2: "14"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    x2: "16",
    y1: "18",
    y2: "22"
  })),
  'search': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  'bell': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.3 21a1.94 1.94 0 0 0 3.4 0"
  })),
  'plus': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14"
  })),
  'chevron-right': /*#__PURE__*/React.createElement("path", {
    d: "m9 18 6-6-6-6"
  }),
  'chevron-down': /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }),
  'check': /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }),
  'x': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })),
  'alert-triangle': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  })),
  'paperclip': /*#__PURE__*/React.createElement("path", {
    d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
  }),
  'calendar': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "18",
    x: "3",
    y: "4",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    x2: "16",
    y1: "2",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    x2: "8",
    y1: "2",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    x2: "21",
    y1: "10",
    y2: "10"
  })),
  'arrow-right': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 5 7 7-7 7"
  })),
  'filter': /*#__PURE__*/React.createElement("polygon", {
    points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
  }),
  'download': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 10 12 15 17 10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12",
    y1: "15",
    y2: "3"
  })),
  'circle-help': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  })),
  'users': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  })),
  'trending-up': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
    points: "22 7 13.5 15.5 8.5 10.5 2 17"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "16 7 22 7 22 13"
  })),
  'more-horizontal': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "12",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "12",
    r: "1"
  })),
  'book-open': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 7v14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
  })),
  'shield-check': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })),
  'clock': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 6 12 12 16 14"
  })),
  'log-out': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "16 17 21 12 16 7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    x2: "9",
    y1: "12",
    y2: "12"
  }))
};
function Icon({
  name,
  size = 18,
  strokeWidth = 2,
  color = 'currentColor',
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: 'none',
      display: 'block',
      ...style
    },
    "aria-hidden": "true"
  }, ICONS[name] || null);
}
window.AFIcon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ClauseStrip = __ds_scope.ClauseStrip;

__ds_ns.ConformanceBadge = __ds_scope.ConformanceBadge;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.ScoreGauge = __ds_scope.ScoreGauge;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Carousel = __ds_scope.Carousel;

})();
