# VS Code Extension Implementation

## Overview

Built a VS Code extension (`markdown-viewer-enhanced`) that provides a feature-rich markdown preview panel with LLM-powered text rewriting. The extension reuses the same React rendering pipeline as the desktop app, ensuring feature parity. It is designed to work across VS Code, Cursor, Antigravity, VSCodium, and other VS Code-compatible editors.

## Architecture Decisions

### React Webview Approach
The extension bundles the existing React rendering components (MarkdownRenderer, MermaidBlock, CodeBlock, etc.) into a VS Code webview panel. This was chosen over alternative approaches (markdown-it, plain DOM manipulation) because:
- Feature parity with zero re-implementation
- Single maintenance point for the rendering pipeline
- The same remark/rehype plugin stack works identically

### Tiered LLM Fallback
The LLM integration uses a three-tier approach for maximum cross-editor compatibility:
1. **VS Code Language Model API** (`vscode.lm`) — works with Copilot in VS Code
2. **Direct API calls** — Anthropic Claude and OpenAI GPT with user-configured API keys
3. **Graceful degradation** — notification guiding user to configure a provider

Runtime detection (`typeof vscode.lm !== 'undefined'`) ensures the extension doesn't crash on editors that lack the LM API (Cursor, VSCodium).

### esbuild Dual-Target Build
Two separate build targets run in parallel:
- **Extension host** (Node.js, CJS) — `src/extension.ts` → `dist/extension.js`
- **Webview** (Browser, IIFE) — `src/webview/index.tsx` → `dist/webview.js` + `dist/webview.css`

## Technical Choices

### Build Tool: esbuild
Chosen over webpack for VS Code extension development because:
- Sub-second builds (vs 30-50s with webpack)
- Native JSX/TSX support
- Officially recommended by VS Code team
- Simple configuration for dual-target builds

### Styling: VS Code Theme Variable Mapping
`vscode-theme.css` maps VS Code's built-in CSS variables (`--vscode-editor-background`, etc.) to the extension's custom properties (`--bg-primary`, etc.) with fallback values. This ensures the preview matches whatever theme the user has installed.

### Frontmatter Parsing
Used a lightweight custom YAML parser in the webview instead of `gray-matter` to avoid bundling the full library. The parser handles common frontmatter patterns (key-value pairs, arrays) without the overhead.

## File Inventory

### New Files Created

```
vscode-extension/
├── package.json                    # Extension manifest with commands, menus, config
├── tsconfig.json                   # TypeScript config (bundler module resolution)
├── esbuild.mjs                     # Dual-target build script
├── .vscodeignore                   # VSIX packaging exclusions
├── README.md                       # Marketplace documentation
├── media/icon.png                  # Extension icon (128x128)
├── src/
│   ├── extension.ts                # Entry: commands, listeners, activation
│   ├── preview/
│   │   ├── PreviewManager.ts       # Webview panel lifecycle, debounced updates
│   │   └── getWebviewContent.ts    # HTML shell with CSP
│   ├── llm/
│   │   ├── types.ts                # LlmProvider interface, RewriteAction type
│   │   ├── prompts.ts              # Rewrite prompt templates
│   │   ├── LlmService.ts           # Tiered fallback orchestrator
│   │   ├── VscodeLmProvider.ts     # Tier 1: vscode.lm API wrapper
│   │   └── DirectApiProvider.ts    # Tier 2: Anthropic/OpenAI fetch
│   ├── editor/
│   │   └── commands.ts             # Bold, italic, code, link, table, etc.
│   └── webview/
│       ├── index.tsx               # React entry point
│       ├── App.tsx                  # Root component (message listener)
│       ├── components/
│       │   ├── MarkdownRenderer.tsx # remark/rehype pipeline (copied from app)
│       │   ├── MermaidBlock.tsx     # Diagram rendering (copied from app)
│       │   ├── CodeBlock.tsx        # Syntax highlighting (copied from app)
│       │   ├── FrontmatterDisplay.tsx  # YAML metadata (copied from app)
│       │   └── TableOfContents.tsx  # Heading navigation (copied from app)
│       └── styles/
│           ├── index.css           # Markdown body styles (extracted from app)
│           └── vscode-theme.css    # VS Code variable mapping
└── dist/                           # Build output (gitignored)
```

### Modified Files

- `.gitignore` — Added `vscode-extension/dist/`, `vscode-extension/node_modules/`, `vscode-extension/*.vsix`

## Setup Instructions

### Development
```bash
cd vscode-extension
npm install
npm run build        # One-time build
npm run watch        # Watch mode for development
```

### Testing
1. Open the `vscode-extension` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Open any `.md` file
4. Run "Markdown Viewer: Open Preview to the Side" from Command Palette

### Packaging
```bash
cd vscode-extension
npm run package      # Produces markdown-viewer-enhanced-0.1.0.vsix
```

### Installing the VSIX
```bash
# VS Code
code --install-extension markdown-viewer-enhanced-0.1.0.vsix

# Cursor
cursor --install-extension markdown-viewer-enhanced-0.1.0.vsix
```

## Cross-Compatibility Matrix

| Feature | VS Code | Cursor | VSCodium | Antigravity |
|---------|---------|--------|----------|-------------|
| Webview Preview | Yes | Yes | Yes | Yes |
| Context Menu LLM | Yes | Yes | Yes | Yes |
| vscode.lm (Tier 1) | Yes (w/ Copilot) | No | No | Unknown |
| Direct API (Tier 2) | Yes | Yes | Yes | Yes |
| Keybindings | Yes | Yes | Yes | Yes |

## What's NOT Included

- **Editor replacement** — Uses VS Code's built-in editor, not CodeMirror
- **File management** — No sidebar/tabs (uses VS Code's built-in file explorer)
- **Scroll sync** — No bidirectional scroll sync between editor and preview
- **Marketplace publishing** — VSIX ready, publishing requires `vsce publish`
- **Open VSX Registry** — Not yet published to Open VSX for VSCodium
