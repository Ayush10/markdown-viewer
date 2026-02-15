# Web Integration Plan — ayushojha.com/tools/markdowneditor

## Problem

The Markdown Viewer needs to be available at `ayushojha.com/tools/markdowneditor` without bloating the main portfolio site (Next.js 16 + Payload CMS, deployed on Coolify).

### Bundle Size Reality

| Component | Raw Size | Gzipped |
|-----------|----------|---------|
| Main JS (React, CodeMirror, remark/rehype, gray-matter) | 2,788 KB | 778 KB |
| Mermaid diagram chunks (lazy loaded) | ~1,500 KB | ~500 KB |
| KaTeX fonts (loaded on demand by CSS) | ~1,500 KB | — |
| CSS | 51 KB | 13 KB |
| **Total** | **~6.9 MB** | **~1.3 MB initial** |

If this were integrated directly into the Next.js app as a React component, it would add ~2.8 MB to the JS bundle for that route and pull in 17+ dependencies that the portfolio site doesn't need.

---

## Recommended Approach: Static Export + Next.js Rewrites

Deploy the Markdown Viewer as a **standalone static Vite app** served from the same domain via Next.js rewrites. Zero impact on the main site bundle.

### How It Works

```
ayushojha.com/                    → Next.js (normal pages)
ayushojha.com/tools/markdowneditor → Vite static build (separate app)
```

The Markdown Viewer's `dist/` output is a self-contained static site. Next.js never bundles or processes any of its code — it simply proxies/serves the static files.

### Implementation Steps

#### 1. Adjust Vite Base Path

Update `vite.config.ts` to use the target URL prefix:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/tools/markdowneditor/',
})
```

> **Note**: This changes the base for web deployment only. For Electron, you'll need a conditional or separate build. A simple approach:

```ts
const isElectron = process.env.BUILD_TARGET === 'electron';

export default defineConfig({
  plugins: [react()],
  base: isElectron ? './' : '/tools/markdowneditor/',
})
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "build:web": "tsc -b && vite build",
    "build:electron": "BUILD_TARGET=electron tsc -b && BUILD_TARGET=electron vite build",
    "electron:dev": "npm run build:electron && electron .",
    "electron:build": "npm run build:electron && electron-builder --mac"
  }
}
```

#### 2. Build and Copy Static Files

After `npm run build:web`, the `dist/` directory contains everything needed. Copy it into the portfolio's public directory:

```bash
# From the Markdown Viewer project
npm run build:web

# Copy to portfolio project
cp -r dist/ /path/to/ayush-portfolio/apps/web/public/tools/markdowneditor/
```

Or automate with a script in the portfolio repo:

```bash
#!/bin/bash
# infrastructure/build-tools.sh
cd /path/to/markdown-viewer
npm run build:web
cp -r dist/* ../Personal\ Website/ayush-portfolio/apps/web/public/tools/markdowneditor/
```

#### 3. Next.js Configuration (if using rewrites instead of public/)

If you prefer not to put files in `public/`, use Next.js rewrites in `next.config.ts`:

```ts
// apps/web/next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/tools/markdowneditor',
        destination: '/tools/markdowneditor/index.html',
      },
      {
        source: '/tools/markdowneditor/:path*',
        destination: '/tools/markdowneditor/:path*',
      },
    ];
  },
};
```

#### 4. Dockerize for Coolify

In the portfolio's `Dockerfile.web`, add the Markdown Viewer build:

```dockerfile
# Stage: Build markdown viewer
FROM node:18-alpine AS md-builder
WORKDIR /app
COPY markdown-viewer/package*.json ./
RUN npm ci
COPY markdown-viewer/ ./
RUN npm run build:web

# In the Next.js builder stage, copy the output
COPY --from=md-builder /app/dist ./apps/web/public/tools/markdowneditor/
```

Or simpler: just commit the built `dist/` files into the portfolio repo under `apps/web/public/tools/markdowneditor/`.

### Why This Approach

| Criteria | Score |
|----------|-------|
| Impact on main site bundle | **Zero** — completely separate JS/CSS |
| Same-origin URL | `/tools/markdowneditor` — no subdomain needed |
| SEO | Fully crawlable, real HTML (not an iframe) |
| Deployment | Single Coolify deployment, no extra services |
| Maintenance | Independent builds — update either project without affecting the other |
| User experience | Feels native, shared domain, no iframe quirks |

---

## Alternative Approaches (Considered & Rejected)

### Option B: iframe Embedding

```tsx
// apps/web/app/tools/markdowneditor/page.tsx
export default function MarkdownEditorPage() {
  return (
    <iframe
      src="https://md.ayushojha.com"
      className="w-full h-screen border-0"
      title="Markdown Editor"
    />
  );
}
```

**Pros**: Complete isolation, separate deployment
**Cons**: Requires a subdomain + separate Coolify service, iframe feels janky (scroll issues, no URL sharing for state), worse SEO, CORS complexity for features like clipboard paste

### Option C: Dynamic Import in Next.js

Re-implement the markdown editor as a Next.js page using `next/dynamic`:

```tsx
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
```

**Pros**: Fully integrated, shared design system
**Cons**: Adds 17+ heavy dependencies to the Next.js project (mermaid, katex, codemirror, react-markdown, etc.), increases `node_modules` significantly, risk of version conflicts (both projects already use Mermaid 11), complex to maintain two copies of the same logic

### Option D: Subdomain Deployment

Deploy at `tools.ayushojha.com/markdowneditor` as a separate Coolify service.

**Pros**: Completely independent
**Cons**: Extra Coolify service to manage, separate SSL certificate, cross-origin issues, doesn't feel like part of the main site

---

## Optimization Opportunities (Optional)

If you want to reduce the initial load even further for the web version:

### 1. Lazy-Load Mermaid (Already Done by Vite)
Vite automatically code-splits Mermaid diagram types. The 1.5 MB of diagram code is only loaded when a user actually renders a Mermaid block. No action needed.

### 2. Lazy-Load the Editor
The CodeMirror editor can be dynamically imported so it only loads when the user switches to split/editor mode:

```tsx
// src/components/Editor.tsx → make it lazy
const Editor = lazy(() => import('./components/Editor'));

// In App.tsx, wrap with Suspense
{viewMode !== 'preview' && (
  <Suspense fallback={<div className="editor-loading">Loading editor...</div>}>
    <Editor value={editorContent} onChange={handleEditorChange} theme={theme} />
  </Suspense>
)}
```

This would move ~200-300 KB of CodeMirror out of the critical path for users who only view markdown.

### 3. Manual Chunks in Vite

Split the main bundle into smaller parallel-loaded chunks:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/tools/markdowneditor/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown', 'remark-gfm', 'remark-math', 'remark-emoji', 'remark-frontmatter'],
          'rehype': ['rehype-katex', 'rehype-highlight', 'rehype-slug', 'rehype-autolink-headings', 'rehype-raw'],
          'codemirror': ['@uiw/react-codemirror', '@codemirror/lang-markdown', '@codemirror/language-data'],
        },
      },
    },
  },
});
```

This improves caching — when you update app code, users only re-download the changed chunk, not the entire 2.8 MB bundle.

### 4. Add a Tools Landing Page

Create a Next.js page at `/tools` that links to the markdown editor (and future tools). This page is pure Next.js and loads instantly:

```tsx
// apps/web/app/tools/page.tsx
export default function ToolsPage() {
  return (
    <div>
      <h1>Developer Tools</h1>
      <a href="/tools/markdowneditor">
        <ToolCard
          title="Markdown Editor"
          description="View and edit markdown with GFM, math, diagrams, and syntax highlighting"
        />
      </a>
    </div>
  );
}
```

---

## Summary

**Use the Static Export + `public/` directory approach.** It's the simplest, has zero impact on your Next.js bundle, requires no extra infrastructure, and gives users a seamless experience at `ayushojha.com/tools/markdowneditor`.

### Quick Start

```bash
# 1. In Markdown Viewer project — build for web
npm run build:web

# 2. Copy to portfolio
cp -r dist/* /path/to/ayush-portfolio/apps/web/public/tools/markdowneditor/

# 3. Deploy portfolio as usual via Coolify
```

The markdown editor loads independently — users visiting your homepage, portfolio, or blog download zero bytes of markdown editor code.
