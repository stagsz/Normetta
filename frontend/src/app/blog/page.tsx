import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog — Normetta',
  description: 'ISO 9001 quality management notes, audit tips, and product updates from Normetta.',
};

const palette = {
  product: { accent: 'var(--brand)' },
  process: { accent: 'var(--status-obs-fg)' },
  dev: { accent: 'var(--text-link)' },
} as const;

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <div data-theme="light" className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)] antialiased">
      {/* Global topbar */}
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] px-6 md:px-10 backdrop-blur-md">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[var(--text-strong)]">
          Norm<span className="text-[var(--brand)]">etta</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Features</Link>
          <Link href="/#how" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">How it works</Link>
          <Link href="/#pricing" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Pricing</Link>
          <Link href="/blog" className="text-sm font-medium text-[var(--text-strong)]">Blog</Link>
          <Link href="/register" className="btn-primary">Start 30-day free trial</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.10em]" style={{ color: 'var(--brand)' }}>
            <span className="block h-px w-5" style={{ background: 'var(--brand)' }} />
            Blog
          </div>
          <h1 className="font-serif text-[clamp(36px,5vw,52px)] leading-[1.08] tracking-tight text-[var(--text-strong)]">
            Notes from the audit world.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--text-muted)]">
            Practical guides, frameworks, and updates for quality managers and internal auditors running ISO 9001 programs.
          </p>

          <div className="mt-12 flex flex-col gap-6">
            {posts.map((post) => {
              const c = palette[post.theme as keyof typeof palette] ?? palette.product;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-[0.10em]" style={{ color: c.accent }}>
                        {post.theme === 'product' && 'Product'}
                        {post.theme === 'process' && 'Process'}
                        {post.theme === 'dev' && 'Implementation'}
                      </div>
                      <div className="mt-2 text-base font-semibold tracking-tight text-[var(--text-strong)] group-hover:text-[var(--brand)] transition-colors">
                        {post.title}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">{post.summary}</p>
                      <div className="mt-3 text-sm text-[var(--text-subtle)]">
                        Published {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="hidden flex-shrink-0 text-sm text-[var(--text-muted)] md:block group-hover:text-[var(--brand)] transition-colors">
                      Read <span aria-hidden className="text-[var(--text-strong)]">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
