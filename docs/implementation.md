# Markdown Viewer — Implementation Documentation

## Overview

A feature-rich, modern markdown viewer and editor available as a web app and native desktop app for **macOS, Windows, and Linux**. Built with React + TypeScript + Vite, packaged with Electron for all platforms. Supports all major markdown extensions including GFM, math equations, mermaid diagrams, syntax highlighting, frontmatter, and more.

## Architecture Decisions

### Tech Stack
- **Vite + React 19 + TypeScript** — Fast dev experience, type safety, latest React features
- **Electron 40** — Native macOS desktop app with system integration
- **electron-builder** — DMG packaging, file associations, app signing
- **remark/rehype ecosystem** — Industry-standard, composable markdown processing pipeline
- **Mermaid.js** — Client-side diagram rendering (flowcharts, sequence diagrams, etc.)
- **KaTeX** — Fast LaTeX math rendering (bundled locally, no CDN dependency)
- **highlight.js** (via rehype-highlight) — Syntax highlighting for 190+ languages
- **gray-matter** — YAML frontmatter parsing (universal, works in both browser and Node)
- **CodeMirror 6** (via @uiw/react-codemirror) — Full-featured markdown editor with syntax support
- **Lucide React** — Consistent, tree-shakable icon library

### Why Electron + electron-builder (not electron-vite/electron-forge)
- The app is a simple single-window viewer — no complex IPC patterns needed
- `electron-builder` has better macOS support (DMG, notarization, file associations)
- Simpler declarative config in `package.json`
- Vite build already produces static `dist/` — Electron just loads `dist/index.html`

### Why remark/rehype over alternatives
- **vs marked/markdown-it**: remark provides a proper AST-based pipeline with composable plugins
- **vs MDX**: We don't need JSX-in-markdown; pure viewing is the use case
- **vs @uiw/react-md-editor**: We need fine-grained control over rendering, not an opinionated editor

### Design System
- CSS custom properties for theming (dark/light)
- Inter font for UI, JetBrains Mono for code
- Indigo accent color (#6366f1) with consistent design tokens
- Responsive layout with collapsible sidebar

## Electron Integration

### Architecture
```
┌─────────────────────────────────────┐
│     Electron Main Process           │
│  (electron/main.cjs)                │
│  - BrowserWindow management         │
│  - Native macOS menus               │
│  - File open dialog (IPC)           │
│  - Finder file association handler  │
│  - External link → system browser   │
└──────────┬──────────────────────────┘
           │ contextBridge (IPC)
┌──────────▼──────────────────────────┐
│     Preload Script                   │
│  (electron/preload.cjs)             │
│  - Exposes window.electronAPI       │
│  - openFiles(), onFileOpened(), etc │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│     Renderer (React App)             │
│  - Checks window.electronAPI        │
│  - Native dialog OR browser fallback│
│  - Listens for menu IPC events      │
└─────────────────────────────────────┘
```

### Cross-Platform Features
- **Platform-aware menus**: macOS gets app menu (About, Services, Hide); Windows/Linux get File > Quit
- **File associations**: `.md`, `.markdown`, `.mdx` registered on all platforms
- **Native file dialog**: Markdown file filters, multi-select support
- **macOS lifecycle**: `open-file` event, `activate` for dock click, stays in dock on close
- **Windows/Linux lifecycle**: Single instance lock, CLI argument file opening, quits on window close
- **External links**: Redirected to system browser via `shell.openExternal()`
- **Dark mode**: `backgroundColor: '#0f1117'` prevents white flash on launch
- **Window icon**: macOS uses `.icns`; Windows/Linux use `icon.png` loaded at runtime

### Dual-mode (Web + Desktop)
The app works in both environments:
- **Electron**: `window.electronAPI` is available → uses native dialogs, IPC menu commands
- **Browser**: `window.electronAPI` is undefined → falls back to `<input type="file">` and browser APIs

### IPC Channels
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `dialog:openFiles` | Renderer → Main | Open native file picker |
| `file:opened` | Main → Renderer | File opened via Finder double-click |
| `menu:openFile` | Main → Renderer | File > Open menu clicked |
| `menu:newFile` | Main → Renderer | File > New menu clicked |
| `menu:toggleTheme` | Main → Renderer | View > Toggle Theme |
| `menu:increaseFontSize` | Main → Renderer | View > Increase Font Size |
| `menu:decreaseFontSize` | Main → Renderer | View > Decrease Font Size |
| `menu:toggleEditor` | Main → Renderer | View > Toggle Editor |

## Editor Integration

### CodeMirror Setup
- **Language support**: Markdown with nested code block highlighting (190+ languages via `@codemirror/language-data`)
- **Features**: Line numbers, active line highlighting, fold gutters, bracket matching, line wrapping
- **Theming**: Custom theme using CSS custom properties to match the app's design tokens
- **Performance**: Debounced updates (300ms) — editor state updates immediately, file store and preview render are debounced

### View Modes
| Mode | Description | Shortcut |
|------|-------------|----------|
| Preview | Read-only rendered markdown | — |
| Split | Side-by-side editor + preview | Cmd+E |
| Editor | Full-screen code editor | Cmd+E (cycle) |

### Split Pane
- Draggable divider with mouse tracking
- Configurable min widths (default: 20% each side)
- Smooth cursor tracking with `col-resize` cursor

## Markdown Features Supported

| Feature | Plugin/Library | Description |
|---------|---------------|-------------|
| GFM Tables | remark-gfm | Full GitHub Flavored Markdown tables |
| Task Lists | remark-gfm | Checkbox task lists with styled checkboxes |
| Strikethrough | remark-gfm | ~~strikethrough~~ text |
| Autolinks | remark-gfm | Automatic URL detection |
| Footnotes | remark-gfm | Footnote references and definitions |
| Math (inline) | remark-math + rehype-katex | $E = mc^2$ inline equations |
| Math (block) | remark-math + rehype-katex | Display math equations |
| Syntax Highlighting | rehype-highlight | 190+ languages, theme-aware colors |
| Mermaid Diagrams | mermaid | Flowcharts, sequence, state diagrams |
| Frontmatter | gray-matter + remark-frontmatter | YAML metadata parsing & display |
| Emoji | remark-emoji | :emoji: shortcode support |
| Raw HTML | rehype-raw | Inline HTML rendering (dl, dt, dd, etc.) |
| Heading Anchors | rehype-slug + rehype-autolink-headings | Clickable heading links |
| GitHub Alerts | Custom component | [!NOTE], [!TIP], [!WARNING] blockquotes |
| Image Captions | Custom component | figcaption from alt/title text |

## File Inventory

### Electron Files
| File | Description |
|------|-------------|
| `electron/main.cjs` | Main process — window, menus, IPC, file associations |
| `electron/preload.cjs` | Secure IPC bridge via `contextBridge` |
| `electron/afterPack.cjs` | macOS xattr cleanup for notarization compatibility |
| `src/electron.d.ts` | TypeScript types for `window.electronAPI` |
| `build/icon.icns` | macOS app icon (generated from favicon.svg) |

### Source Files
| File | Description |
|------|-------------|
| `src/App.tsx` | Main app layout, state management, Electron IPC listeners, view mode cycling |
| `src/main.tsx` | React entry point + Electron detection |
| `src/index.css` | Complete styling — themes, layout, markdown rendering, KaTeX CSS |
| `src/vite-env.d.ts` | TypeScript declarations for gray-matter |
| `src/components/MarkdownRenderer.tsx` | Core markdown rendering with all remark/rehype plugins |
| `src/components/Editor.tsx` | CodeMirror 6 markdown editor with custom theming |
| `src/components/SplitPane.tsx` | Draggable split view with mouse tracking |
| `src/components/MermaidBlock.tsx` | Mermaid diagram rendering with error handling |
| `src/components/CodeBlock.tsx` | Code blocks with language label and copy button |
| `src/components/Sidebar.tsx` | File explorer with search and file management |
| `src/components/Toolbar.tsx` | Top toolbar — theme toggle, zoom, view modes, copy, new file |
| `src/components/TableOfContents.tsx` | Right-side TOC with scroll-spy active highlighting |
| `src/components/WelcomeScreen.tsx` | Empty state with feature cards and action buttons |
| `src/components/FrontmatterDisplay.tsx` | YAML frontmatter metadata display |
| `src/hooks/useTheme.ts` | Theme management with localStorage persistence + font size |
| `src/hooks/useFiles.ts` | File state management — dual-path (Electron native / browser fallback) |
| `src/hooks/useDebounce.ts` | Debounced callback utility hook |
| `src/utils/sample-markdown.ts` | Comprehensive sample showcasing all features |

### Build Configuration
| File | Description |
|------|-------------|
| `package.json` | Scripts, dependencies, electron-builder config |
| `vite.config.ts` | Vite config with relative base path for Electron |
| `tsconfig.json` | TypeScript project references |
| `tsconfig.app.json` | React app TS config (ES2022, JSX) |
| `tsconfig.node.json` | Node/Vite TS config (ES2023) |
| `eslint.config.js` | ESLint 9 flat config |

## Build Pipeline

### Web Build
```
TypeScript (tsc -b) → Vite Bundle → dist/
```

### Electron Build
```
TypeScript → Vite Bundle → electron-builder → platform installers
                                    ↓
                          afterPack.cjs (xattr cleanup, macOS only)
```

### Bundle Analysis (v1.0.0)
| Category | Size (raw) | Size (gzip) |
|----------|-----------|-------------|
| Main JS bundle | 2,788 KB | 778 KB |
| CSS | 51 KB | 13 KB |
| KaTeX fonts | ~1,500 KB | (loaded on demand) |
| Mermaid diagram chunks | ~1,500 KB | (lazy loaded) |
| **Total dist/** | **6.9 MB** | — |

Mermaid diagram types are automatically code-split by Vite into separate chunks — only the diagram types actually used on a page are loaded.

## Setup Instructions

### Web Development
```bash
npm install
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
```

### Desktop App (Development)
```bash
npm install
npm run electron:dev     # Build + launch Electron locally
```

### Build Installers
```bash
npm run electron:build           # All platforms (macOS + Windows + Linux)
npm run electron:build:mac       # macOS only (DMG, x64 + arm64)
npm run electron:build:win       # Windows only (NSIS + portable, x64 + arm64)
npm run electron:build:linux     # Linux only (AppImage + deb, x64 + arm64)
```

### Build Output

#### macOS
| Artifact | Size |
|----------|------|
| `Markdown Viewer-1.0.0-mac-arm64.dmg` | 145 MB |
| `Markdown Viewer-1.0.0-mac-x64.dmg` | 149 MB |

#### Windows
| Artifact | Size |
|----------|------|
| `Markdown Viewer-1.0.0-win-x64.exe` (NSIS installer) | 121 MB |
| `Markdown Viewer-1.0.0-win-arm64.exe` (NSIS installer) | 123 MB |
| `Markdown Viewer-1.0.0-win.exe` (universal NSIS, x64+arm64) | 244 MB |
| `Markdown Viewer-1.0.0-portable.exe` (no install needed) | 121 MB |

#### Linux
| Artifact | Size |
|----------|------|
| `Markdown Viewer-1.0.0-linux-x86_64.AppImage` | 150 MB |
| `Markdown Viewer-1.0.0-linux-arm64.AppImage` | 151 MB |
| `Markdown Viewer-1.0.0-linux-amd64.deb` | 117 MB |
| `Markdown Viewer-1.0.0-linux-arm64.deb` | 113 MB |

## What's NOT Included

- PDF export
- Code signing / notarization (use `--mac.identity` for macOS production)
- Auto-update mechanism
- Cloud sync / file system persistence (files are in-memory per session)
