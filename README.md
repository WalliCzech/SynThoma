# Public assets for SYNTHOMA web

Place static files here. Served at "/" by Next.js.

- /assets/           → misc assets (icons, shaders, misc)
  - /assets/images/  → raster/vector images
  - /assets/favicon.ico → site icon (referenced in Next metadata)
- /fonts/            → webfonts (woff2)
- /audio/            → sfx, ambience
- /video/            → trailers, bg loops
- /books/            → PDFs, ePubs (non-sensitive)
- /stories/          → story snippets (non-sensitive)

Notes
- Prefer CDN or LFS for heavy media.
- Keep licensing files alongside third-party media.
