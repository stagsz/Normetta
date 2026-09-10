import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { asyncHandler } from '../proxy';

const router = Router();

const candidates = [
  path.join(process.cwd(), 'marketing', 'blog'),
  path.join(process.cwd(), '..', 'marketing', 'blog'),
  path.join(process.cwd(), '..', '..', 'marketing', 'blog'),
];

async function resolvePostsDir(): Promise<string | null> {
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

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return new Date().toISOString().slice(0, 10);
}

router.get('/', asyncHandler(async (req, res) => {
  const dir = await resolvePostsDir();
  if (!dir) {
    return res.json([]);
  }
  const files = await fs.readdir(dir);
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .filter((f) => !/^APPROVAL-REVIEW/i.test(f))
      .map(async (file) => {
        const slug = file.slice(0, -3);
        const raw = await fs.readFile(path.join(dir, file), 'utf8');
        const { data, content } = matter(raw);
        return {
          slug,
          title: typeof data.title === 'string' && data.title.trim().length > 0 ? data.title.trim() : slug,
          summary: typeof data.excerpt === 'string' && data.excerpt.trim().length > 0 ? data.excerpt.trim() : content.split('\n').find((line) => line.trim().startsWith('# '))?.replace(/^#+\s*/, '').trim() ?? slug,
          date: toIsoDate(data.date ?? data.publishedDate ?? data.published),
          theme: typeof data.theme === 'string' ? data.theme : 'product',
        };
      }),
  );

  posts.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
  return res.json(posts);
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const dir = await resolvePostsDir();
  if (!dir) {
    return res.status(404).json({ error: 'Not found' });
  }
  const slug = String(req.params.slug);
  const filePath = path.join(dir, `${slug}.md`);
  await fs.access(filePath);
  const raw = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(raw);
  return res.json({
    slug,
    title: typeof data.title === 'string' && data.title.trim().length > 0 ? data.title.trim() : slug,
    date: toIsoDate(data.date ?? data.publishedDate ?? data.published),
    content,
  });
}));

export default router;
