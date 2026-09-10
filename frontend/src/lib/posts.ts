import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface PostMeta {
  slug: string;
  title: string;
  summary: string;
  date: string;
  theme: string;
}

const THEME_ALIASES: Record<string, string> = {
  process: 'process',
  implementation: 'dev',
  product: 'product',
  dev: 'dev',
};

function normalizeTheme(raw: string): string {
  const key = raw.trim().toLowerCase();
  return THEME_ALIASES[key] ?? key;
}

function excerptFromContent(content: string, max = 180): string {
  const cleaned = content
    .replace(/[#*_`>\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}...`;
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return new Date().toISOString().slice(0, 10);
}

async function resolvePostsDir(): Promise<string | null> {
  const candidates = [
    path.join(process.cwd(), 'marketing', 'blog'),
    path.join(process.cwd(), '..', 'marketing', 'blog'),
    path.join(process.cwd(), '..', '..', 'marketing', 'blog'),
    path.join(process.cwd(), 'frontend', 'marketing', 'blog'),
  ];

  for (const dir of candidates) {
    try {
      await fs.access(dir);
      return dir;
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function readPostMarkdown(slug: string) {
  const dir = await resolvePostsDir();
  if (!dir) {
    throw new Error('Missing blog source directory.');
  }
  const filePath = path.join(dir, `${slug}.md`);
  const raw = await fs.readFile(filePath, 'utf8');
  return matter(raw);
}

// Files that must never be published as blog posts.
//   APPROVAL-REVIEW*      -> review queue (deliberately kept out of the public list)
//   *-supporting.md       -> internal sales/launch collateral
//   *-cta-variants.md     -> internal sales CTA copy
// #2: explicit exclusion of internal working files so they can't be swept into the public blog.
function isExcludedFile(file: string): boolean {
  return (
    /^APPROVAL-REVIEW/i.test(file) ||
    /-(supporting|cta-variants)\.md$/i.test(file)
  );
}

export async function getPosts(): Promise<PostMeta[]> {
  const POSTS_DIR = await resolvePostsDir();
  if (!POSTS_DIR) {
    return [];
  }

  const files = await fs.readdir(POSTS_DIR);

  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .filter((f) => !isExcludedFile(f))
      .map(async (file) => {
        const slug = file.slice(0, -3);
        const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
        const { data, content } = matter(raw);
        // #3: default is draft. Only frontmatter `published: true` becomes a public post.
        if (data.published !== true) return null;
        const date = toIsoDate(data.date ?? data.publishedDate ?? data.publishedAt);
        const title =
          typeof data.title === 'string' && data.title.trim().length > 0
            ? data.title.trim()
            : content.split('\n').find((line) => line.trim().startsWith('# '))?.replace(/^#+\s*/, '').trim() ?? slug;
        const summary =
          typeof data.excerpt === 'string' && data.excerpt.trim().length > 0
            ? data.excerpt.trim()
            : typeof data.description === 'string' && data.description.trim().length > 0
              ? data.description.trim()
              : excerptFromContent(content);
        const theme = normalizeTheme(typeof data.theme === 'string' ? data.theme : 'product');
        return { slug, title, summary, date, theme };
      }),
  );

  return entries
    .filter((e): e is PostMeta => e !== null)
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
}
