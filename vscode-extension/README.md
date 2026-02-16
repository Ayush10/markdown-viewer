# Markdown Viewer Enhanced

A feature-rich markdown preview extension for VS Code, Cursor, Antigravity, and other VS Code-compatible editors.

## Features

- **Full GitHub Flavored Markdown** - Tables, task lists, strikethrough, autolinks, footnotes
- **LaTeX Math Equations** - KaTeX-powered inline (`$...$`) and block (`$$...$$`) equations
- **Mermaid Diagrams** - Flowcharts, sequence diagrams, state diagrams, and more
- **Syntax Highlighting** - 190+ languages with theme-aware colors
- **YAML Frontmatter** - Parsed and displayed with appropriate icons
- **Emoji Support** - `:rocket:` shortcode rendering
- **GitHub Alerts** - `[!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!CAUTION]`, `[!IMPORTANT]`
- **Table of Contents** - Auto-generated with scroll-spy active highlighting
- **Dark/Light Themes** - Automatically matches your editor theme
- **LLM-Powered Rewriting** - Select text, right-click, and rewrite with AI

## AI Rewriting

Select any text in a markdown file, right-click, and choose from the **Rewrite with AI** submenu:

- **Rewrite** - Make text clearer and more engaging
- **Simplify** - Use shorter sentences and simpler words
- **Expand** - Add more detail and examples
- **Fix Grammar** - Correct spelling, grammar, and punctuation
- **Make Professional** - Formal, professional tone
- **Custom Prompt** - Enter your own rewriting instruction

### LLM Provider Configuration

The extension automatically detects available LLM providers:

1. **VS Code Language Model API** - Works with GitHub Copilot and compatible extensions
2. **Direct API** - Configure your own Anthropic (Claude) or OpenAI API key in settings

Set your preferred provider in Settings > Markdown Viewer Enhanced > LLM.

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Preview to Side | `Cmd+Shift+M` / `Ctrl+Shift+M` |
| Toggle Bold | `Cmd+B` / `Ctrl+B` |
| Toggle Italic | `Cmd+I` / `Ctrl+I` |
| Toggle Inline Code | `` Cmd+` `` / `` Ctrl+` `` |

## Commands

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for "Markdown Viewer":

- **Open Preview** - Preview in current column
- **Open Preview to the Side** - Preview in adjacent column
- **Insert Frontmatter Template** - Add YAML frontmatter
- **Insert Table** - Add a markdown table
- **Insert Code Block** - Add a fenced code block
- **Insert Link** / **Insert Image** - Add markdown links or images

## Cross-Editor Compatibility

This extension uses only standard VS Code extension APIs, ensuring compatibility with:

- VS Code
- Cursor
- Antigravity
- VSCodium
- Windsurf
- Any other VS Code-compatible editor

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `markdownViewer.llm.provider` | `auto` | LLM provider (auto, vscode-lm, anthropic, openai) |
| `markdownViewer.llm.anthropicApiKey` | | Anthropic API key for direct access |
| `markdownViewer.llm.openaiApiKey` | | OpenAI API key for direct access |
| `markdownViewer.llm.model` | | Model override (e.g., `claude-sonnet-4-20250514`) |
| `markdownViewer.preview.fontSize` | `16` | Preview font size (12-28) |
