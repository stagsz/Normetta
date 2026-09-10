/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@auditflow/shared'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: {
    // Same-origin relative path: every Vercel deployment (production and
    // previews) serves its own backend under /_/backend/api, so a relative
    // base needs no CORS. Absolute URLs here break preview deployments and
    // cause cross-origin login failures after a domain migration.
    //
    // Guard: if NEXT_PUBLIC_API_URL points at a stale domain (e.g. the old
    // audit-flow.org), force the relative same-origin path in production so
    // the frontend never calls a different origin than the page it's served on.
    NEXT_PUBLIC_API_URL: (() => {
      const override = process.env.NEXT_PUBLIC_API_URL;
      const isProd = process.env.NODE_ENV === 'production';
      const looksStale =
        !!override &&
        /^https?:\/\//.test(override) &&
        !override.includes('localhost') &&
        !override.startsWith('/');
      if (isProd && looksStale) {
        return '/_/backend/api';
      }
      return override || (isProd ? '/_/backend/api' : 'http://localhost:3001/api');
    })(),
  },
  // Force the HTML document to always revalidate at the edge. The document
  // references hashed JS chunks; if the edge served a stale HTML pointing at a
  // pre-fix chunk, a returning visitor could keep calling the old
  // audit-flow.org API URL. no-cache (revalidate) guarantees the HTML always
  // reflects the current deployment. Hashed /_next/static assets stay
  // immutable (set by Next) so they cache aggressively.
  async headers() {
    return [
      {
        source: '/:path((?!_next/static/).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig
