// Normetta design system loader for templates.
// One line for the consumer to edit: `base` points at the design system root.
// Previewing inside this design system, that's two levels up ('../..').
// In a consuming project, point it at the bound _ds/<folder> tree
// (e.g. '_ds/auditflow' at the project root, '../_ds/auditflow' one level down).
(() => {
  const base = '../..';
  for (const p of ['styles.css']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src +
    ' — point the base line at the bound _ds/<folder> tree relative to this page' +
    ' (in a fresh design system this just means the bundle is not compiled yet).');
  document.head.appendChild(s);
})();
