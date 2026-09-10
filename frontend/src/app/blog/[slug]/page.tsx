import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPosts, readPostMarkdown } from '@/lib/posts';

const palette = {
  product: { fg: 'var(--text-strong)', bg: 'var(--surface-page)', accent: 'var(--brand)' },
  process: { fg: 'var(--text-strong)', bg: 'var(--surface-page)', accent: 'var(--status-obs-fg)' },
  dev: { fg: 'var(--text-strong)', bg: 'var(--surface-page)', accent: 'var(--text-link)' },
} as const;

async function BlogBody({ slug }: { slug: string }) {
  const source = await readPostMarkdown(slug);
  return (
    <div className="
      prose prose-neutral max-w-none
      prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-[var(--text-strong)]
      prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-5
      prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
      prose-p:text-[var(--text-body)] prose-p:leading-[1.75] prose-p:font-normal
      prose-a:text-[var(--text-link)] prose-a:underline prose-a:decoration-[var(--text-link)] prose-a:underline-offset-2 prose-a:hover:decoration-2
      prose-strong:text-[var(--text-strong)] prose-strong:font-semibold
      prose-code:before:content-none prose-code:after:content-none
      prose-code:bg-[var(--surface-sunken)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
      prose-pre:text-[var(--text-strong)] prose-pre:bg-[var(--surface-sunken)] prose-pre:border prose-pre:border-[var(--border-subtle)] prose-pre:rounded-xl
      [&_pre_code]:text-[var(--text-strong)] [&_pre_code]:bg-transparent
      prose-blockquote:border-l-[var(--brand)] prose-blockquote:bg-[var(--surface-sunken)] prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic
      prose-table:border prose-table:border-[var(--border-subtle)] prose-table:rounded-xl prose-table:overflow-hidden
      prose-th:bg-[var(--surface-sunken)] prose-th:text-[var(--text-strong)] prose-th:font-semibold prose-th:text-sm prose-th:uppercase prose-th:tracking-wide
      prose-td:border-t prose-td:border-[var(--border-subtle)] prose-td:text-[var(--text-body)]
      prose-li:text-[var(--text-body)] prose-li:marker:text-[var(--text-muted)] prose-li:leading-[1.75]
      prose-hr:border-[var(--border-subtle)] prose-hr:my-10
      prose-th:size-px prose-th:px-4 prose-th:py-3 prose-th:text-left
      prose-td:px-4 prose-td:py-3
      [&_input[type=checkbox]]:accent-[var(--brand)] [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:mt-0.5
      [&_li:has(>input[type=checkbox])]:list-none [&_li:has(>input[type=checkbox])]:flex [&_li:has(>input[type=checkbox])]:items-start
    ">
      <MDXRemote source={source.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const posts = await getPosts();
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) return { title: 'Post not found — Normetta' };
    return { title: `${post.title} — Normetta`, description: post.summary };
  } catch {
    return { title: 'Post not found — Normetta' };
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  let post;
  try {
    const posts = await getPosts();
    post = posts.find((p) => p.slug === params.slug);
  } catch {
    post = undefined;
  }
  if (!post) notFound();

  const c = palette[post.theme as keyof typeof palette] ?? palette.product;

  return (
    <div data-theme="light" className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)] antialiased">
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

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20 md:px-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to blog
        </Link>

        <article className="mt-10">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.10em]" style={{ color: c.accent }}>
            <span className="block h-px w-4" style={{ background: c.accent }} />
            {post.theme === 'product' && 'Product'}
            {post.theme === 'process' && 'Process'}
            {post.theme === 'dev' && 'Implementation'}
          </div>
          <h1 className="font-serif text-[clamp(30px,4.5vw,44px)] leading-[1.1] tracking-tight text-[var(--text-strong)]">{post.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--text-muted)]">{post.summary}</p>
          <div className="mt-4 flex items-center gap-3 text-sm text-[var(--text-subtle)]">
            <time dateTime={post.date}>
              Published {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>
          <hr className="mt-10 mb-10 border-[var(--border-subtle)]" />
          <BlogBody slug={post.slug} />
        </article>
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 md:px-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            All posts
          </Link>
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
            normetta.com
          </Link>
        </div>
      </footer>
    </div>
  );
}
