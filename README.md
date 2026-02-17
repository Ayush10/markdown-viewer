# Markdown Viewer

A feature-rich markdown viewer and editor available as a **VS Code extension**, **web app**, and **native desktop application** for macOS, Windows, and Linux. Supports GFM, math equations, Mermaid diagrams, syntax highlighting, frontmatter, LLM-powered rewriting, and more.

## VS Code Extension

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/ayushojha.markdown-viewer-enhanced?label=VS%20Code%20Marketplace&color=blue)](https://marketplace.visualstudio.com/items?itemName=ayushojha.markdown-viewer-enhanced)

Install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ayushojha.markdown-viewer-enhanced) or search **"Markdown Viewer Enhanced"** in the Extensions panel.

```bash
# Or install via CLI
code --install-extension ayushojha.markdown-viewer-enhanced
```

**Extension features:**
- Full markdown preview with GFM, LaTeX math, Mermaid diagrams, and syntax highlighting
- Auto-opens preview when a markdown file is detected
- **AI-powered rewriting** — select text, right-click, and choose from Rewrite, Simplify, Expand, Fix Grammar, Make Professional, or Custom Prompt
- LLM support via VS Code Language Model API (Copilot), Anthropic, or OpenAI
- Editor shortcuts for bold, italic, code, links, images, tables, and code blocks
- Works across **VS Code, Cursor, Antigravity, VSCodium, Windsurf**, and other VS Code-compatible editors

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Shift+M` | Open preview to side |
| `Cmd/Ctrl+B` | Toggle bold |
| `Cmd/Ctrl+I` | Toggle italic |
| `` Cmd/Ctrl+` `` | Toggle inline code |

## Features

- **Full GFM Support** — Tables, task lists, strikethrough, autolinks, footnotes
- **LaTeX Math** — Inline and block equations powered by KaTeX
- **Mermaid Diagrams** — Flowcharts, sequence, state, and other diagram types
- **Syntax Highlighting** — 190+ languages with theme-aware colors
- **Frontmatter** — YAML metadata parsing and display
- **Live Editor** — Split-pane CodeMirror editor with real-time preview
- **Dark/Light Themes** — System-preference-aware with manual toggle
- **Table of Contents** — Auto-generated TOC with scroll-spy active highlighting
- **GitHub Alerts** — `[!NOTE]`, `[!TIP]`, `[!WARNING]` styled blockquotes
- **Emoji Support** — `:emoji:` shortcode rendering
- **File Management** — Drag-and-drop, paste, open from disk, multi-file tabs
- **VS Code Extension** — [Available on Marketplace](https://marketplace.visualstudio.com/items?itemName=ayushojha.markdown-viewer-enhanced) with AI rewriting
- **Cross-Platform** — Native desktop app for macOS, Windows, and Linux with file associations
- **Adjustable Font Size** — Zoom in/out controls
- **Raw HTML** — Inline HTML rendering within markdown

## Download

### macOS
| Architecture | Installer |
|-------------|-----------|
| Apple Silicon (M1/M2/M3) | `Markdown Viewer-1.0.0-mac-arm64.dmg` |
| Intel | `Markdown Viewer-1.0.0-mac-x64.dmg` |

### Windows
| Architecture | Installer | Portable |
|-------------|-----------|----------|
| x64 | `Markdown Viewer-1.0.0-win-x64.exe` | `Markdown Viewer-1.0.0-portable.exe` |
| ARM64 | `Markdown Viewer-1.0.0-win-arm64.exe` | — |
| Universal (x64 + ARM64) | `Markdown Viewer-1.0.0-win.exe` | — |

### Linux
| Architecture | AppImage | Deb |
|-------------|----------|-----|
| x64 | `Markdown Viewer-1.0.0-linux-x86_64.AppImage` | `Markdown Viewer-1.0.0-linux-amd64.deb` |
| ARM64 | `Markdown Viewer-1.0.0-linux-arm64.AppImage` | `Markdown Viewer-1.0.0-linux-arm64.deb` |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Web Development

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

### Desktop App (Development)

```bash
npm run electron:dev     # Build + launch Electron locally
```

### Build Installers

```bash
# All platforms
npm run electron:build

# Individual platforms
npm run electron:build:mac      # macOS (DMG, x64 + arm64)
npm run electron:build:win      # Windows (NSIS installer + portable, x64 + arm64)
npm run electron:build:linux    # Linux (AppImage + deb, x64 + arm64)
```

All artifacts are output to the `release/` directory.

## Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Open file | `Cmd+O` | `Ctrl+O` |
| New file | `Cmd+N` | `Ctrl+N` |
| Toggle theme | `Cmd+Shift+T` | `Ctrl+Shift+T` |
| Cycle view mode | `Cmd+E` | `Ctrl+E` |
| Increase font | `Cmd+=` | `Ctrl+=` |
| Decrease font | `Cmd+-` | `Ctrl+-` |

## Architecture

```
┌──────────────────────────────────────┐
│     Electron Main Process            │
│  (electron/main.cjs)                 │
│  - BrowserWindow, platform menus     │
│  - File open dialog (IPC)            │
│  - File associations (.md/.mdx)      │
│  - Single instance lock (Win/Linux)  │
│  - CLI arg file open (Win/Linux)     │
│  - Finder open-file event (macOS)    │
└──────────┬───────────────────────────┘
           │ contextBridge (IPC)
┌──────────▼───────────────────────────┐
│     Preload Script                   │
│  (electron/preload.cjs)              │
│  - Exposes window.electronAPI        │
└──────────┬───────────────────────────┘
           │
┌──────────▼───────────────────────────┐
│     Renderer (React App)             │
│  - Checks window.electronAPI         │
│  - Native dialog OR browser fallback │
│  - Vite + React 19 + TypeScript      │
└──────────────────────────────────────┘
```

The app runs in **dual mode**: when `window.electronAPI` is available it uses native Electron dialogs and IPC; otherwise it falls back to browser APIs (`<input type="file">`, clipboard).

### Platform-Specific Behavior

| Feature | macOS | Windows | Linux |
|---------|-------|---------|-------|
| App menu | macOS app menu (About, Services, Hide) | — | — |
| File > Quit | `Cmd+Q` (app menu) | File > Quit | File > Quit |
| File associations | Finder double-click → `open-file` event | CLI args + single-instance lock | CLI args + single-instance lock |
| Window icon | Uses `.icns` from build config | Loaded from `build/icon.png` | Loaded from `build/icon.png` |
| Quit on close | Stays in dock | Quits | Quits |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19, TypeScript |
| Build Tool | Vite 7 |
| Desktop | Electron 40, electron-builder |
| Markdown | react-markdown, remark-gfm, remark-math, remark-emoji, remark-frontmatter |
| Rendering | rehype-katex, rehype-highlight, rehype-slug, rehype-autolink-headings, rehype-raw |
| Diagrams | Mermaid.js |
| Math | KaTeX |
| Editor | CodeMirror 6 (@uiw/react-codemirror) |
| Frontmatter | gray-matter |
| Icons | Lucide React |
| VS Code Extension | esbuild, VS Code Webview API, vscode.lm API |

## Project Structure

```
src/
├── App.tsx                        # Main app layout, state, Electron IPC
├── main.tsx                       # React entry point
├── index.css                      # All styles (themes, layout, KaTeX CSS)
├── components/
│   ├── MarkdownRenderer.tsx       # remark/rehype pipeline with all plugins
│   ├── Editor.tsx                 # CodeMirror markdown editor
│   ├── SplitPane.tsx              # Draggable split editor/preview
│   ├── Toolbar.tsx                # Top bar (theme, zoom, view mode, copy)
│   ├── Sidebar.tsx                # File explorer with search
│   ├── TableOfContents.tsx        # Auto-generated TOC with scroll-spy
│   ├── CodeBlock.tsx              # Code blocks with copy button
│   ├── MermaidBlock.tsx           # Mermaid diagram renderer
│   ├── FrontmatterDisplay.tsx     # YAML metadata display
│   └── WelcomeScreen.tsx          # Empty state UI
├── hooks/
│   ├── useTheme.ts                # Dark/light theme + font size
│   ├── useFiles.ts                # File state (Electron + browser dual-mode)
│   └── useDebounce.ts             # Debounce utility
└── utils/
    └── sample-markdown.ts         # Feature showcase sample

electron/
├── main.cjs                       # Main process (window, menus, IPC, cross-platform)
├── preload.cjs                    # Secure IPC bridge
└── afterPack.cjs                  # macOS xattr cleanup post-build

vscode-extension/
├── package.json                   # Extension manifest
├── esbuild.mjs                    # Dual-target build (extension + webview)
└── src/
    ├── extension.ts               # Entry point: commands, listeners, activation
    ├── preview/                    # Webview panel lifecycle
    ├── llm/                       # Tiered LLM (vscode.lm → Anthropic/OpenAI)
    ├── editor/                    # Formatting commands
    └── webview/                   # React app reusing rendering pipeline
```

## License

MIT
