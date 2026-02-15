export const SAMPLE_MARKDOWN = `---
title: Markdown Viewer — Feature Showcase
author: Markdown Viewer App
date: 2026-02-14
tags: [markdown, demo, features]
---

# Welcome to Markdown Viewer

A powerful, feature-rich markdown viewer with support for all modern markdown extensions. Drop a \`.md\` file or paste markdown to get started.

---

## Text Formatting

You can use **bold**, *italic*, ~~strikethrough~~, and ***bold italic*** text. Here's some \`inline code\` and a [hyperlink](https://example.com). You can also use ==highlighted text== and H~2~O for subscript or X^2^ for superscript.

> **Note:** This viewer supports GitHub Flavored Markdown (GFM) and many extended syntax features.

---

## Task Lists

- [x] GFM tables and task lists
- [x] Syntax highlighted code blocks
- [x] LaTeX math equations (KaTeX)
- [x] Mermaid diagrams
- [x] Frontmatter parsing (YAML)
- [x] Footnotes support
- [x] Emoji shortcodes :rocket:
- [x] Dark and light themes
- [ ] Export to PDF (coming soon)

---

## Code Blocks

### JavaScript

\`\`\`javascript
// Recursive fibonacci with memoization
const fibonacci = (() => {
  const cache = new Map([[0, 0], [1, 1]]);
  return function fib(n) {
    if (cache.has(n)) return cache.get(n);
    const result = fib(n - 1) + fib(n - 2);
    cache.set(n, result);
    return result;
  };
})();

console.log(fibonacci(50)); // 12586269025
\`\`\`

### Python

\`\`\`python
from dataclasses import dataclass
from typing import Optional

@dataclass
class TreeNode:
    value: int
    left: Optional["TreeNode"] = None
    right: Optional["TreeNode"] = None

    def insert(self, val: int) -> "TreeNode":
        if val < self.value:
            self.left = self.left.insert(val) if self.left else TreeNode(val)
        elif val > self.value:
            self.right = self.right.insert(val) if self.right else TreeNode(val)
        return self

    def inorder(self) -> list[int]:
        left = self.left.inorder() if self.left else []
        right = self.right.inorder() if self.right else []
        return left + [self.value] + right
\`\`\`

### Rust

\`\`\`rust
use std::collections::HashMap;

fn two_sum(nums: &[i32], target: i32) -> Option<(usize, usize)> {
    let mut seen: HashMap<i32, usize> = HashMap::new();
    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        if let Some(&j) = seen.get(&complement) {
            return Some((j, i));
        }
        seen.insert(num, i);
    }
    None
}
\`\`\`

---

## Tables

| Feature | Status | Engine |
|:--------|:------:|-------:|
| GFM Tables | Supported | remark-gfm |
| Task Lists | Supported | remark-gfm |
| Math (KaTeX) | Supported | remark-math + rehype-katex |
| Syntax Highlighting | Supported | rehype-highlight |
| Mermaid Diagrams | Supported | mermaid |
| Frontmatter | Supported | gray-matter |
| Emoji | Supported | remark-emoji |
| Footnotes | Supported | remark-gfm |

---

## Math Equations (KaTeX)

### Inline Math

Einstein's famous equation: $E = mc^2$. The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

### Block Math

$$
\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}
$$

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

---

## Mermaid Diagrams

### Flowchart

\`\`\`mermaid
graph TD
    A[Open Markdown File] --> B{Parse Content}
    B --> C[Extract Frontmatter]
    B --> D[Process Markdown AST]
    D --> E[Apply Remark Plugins]
    E --> F[Apply Rehype Plugins]
    F --> G[Render to React Components]
    G --> H[Display in Viewer]
    C --> I[Show Metadata]
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant App
    participant Parser
    participant Renderer

    User->>App: Drop .md file
    App->>Parser: Parse markdown
    Parser->>Parser: Apply plugins (GFM, math, etc.)
    Parser-->>Renderer: AST
    Renderer->>Renderer: Convert to React elements
    Renderer-->>App: Rendered HTML
    App-->>User: Display formatted content
\`\`\`

---

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

> [!NOTE]
> This viewer supports GitHub-style alert blockquotes.

> [!TIP]
> Try dragging and dropping a markdown file onto the window!

> [!WARNING]
> Some features like PDF export are still under development.

---

## Images

![Placeholder Image](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop "Code on a screen")

---

## Footnotes

Here's a sentence with a footnote[^1], and another one[^2].

[^1]: This is the first footnote with a detailed explanation.
[^2]: This is the second footnote. Footnotes are rendered at the bottom of the document.

---

## Nested Lists

1. **Rendering Pipeline**
   1. Parse raw markdown text
   2. Build abstract syntax tree (AST)
   3. Apply transformations
      - remark plugins (syntax extensions)
      - rehype plugins (HTML transformations)
   4. Render to React components
2. **Supported Extensions**
   - GitHub Flavored Markdown
     - Tables
     - Task lists
     - Strikethrough
     - Autolinks
   - Math (KaTeX)
   - Mermaid diagrams
3. **Theme System**
   - Dark mode (default)
   - Light mode
   - System preference detection

---

## Horizontal Rules

Above the line.

***

Between the lines.

---

Below the line.

---

## Definition Lists (HTML)

<dl>
  <dt>Markdown</dt>
  <dd>A lightweight markup language for creating formatted text using a plain-text editor.</dd>
  <dt>KaTeX</dt>
  <dd>A fast math typesetting library for the web, used to render LaTeX equations.</dd>
  <dt>Mermaid</dt>
  <dd>A JavaScript-based diagramming and charting tool that renders Markdown-inspired text definitions.</dd>
</dl>

---

*Built with React, TypeScript, and the remark/rehype ecosystem.*
`;
