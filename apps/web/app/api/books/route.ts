import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const booksDir = path.join(process.cwd(), 'public', 'books');
    const { searchParams } = new URL(req.url);
    const book = searchParams.get('book');

    if (book) {
      // List chapters/files inside a specific book directory
      const safeBook = book.replace(/\.+/g, '').replace(/[\\/]/g, '');
      const bookDir = path.join(booksDir, safeBook);
      const real = path.resolve(bookDir);
      if (!real.startsWith(path.resolve(booksDir))) {
        return NextResponse.json({ ok: false, error: 'Invalid path' }, { status: 400 });
      }
      const entries = await fs.readdir(bookDir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (e) => {
        const p = path.join(bookDir, e.name);
        const stat = await fs.stat(p).catch(() => null);
        return {
          name: e.name,
          type: e.isDirectory() ? 'dir' : 'file',
          size: stat ? stat.size : 0,
        };
      }));
      items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
      return NextResponse.json({ ok: true, scope: 'chapters', book: safeBook, items });
    }

    const entries = await fs.readdir(booksDir, { withFileTypes: true });
    const items = await Promise.all(entries.map(async (e) => {
      const p = path.join(booksDir, e.name);
      const stat = await fs.stat(p).catch(() => null);
      return {
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
        size: stat ? stat.size : 0,
      };
    }));
    // Sort: directories first, then files alphabetically
    items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
    return NextResponse.json({ ok: true, scope: 'books', items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
