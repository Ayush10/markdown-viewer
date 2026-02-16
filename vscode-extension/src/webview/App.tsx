import { useState, useEffect, useMemo } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer';
import FrontmatterDisplay from './components/FrontmatterDisplay';
import TableOfContents from './components/TableOfContents';

interface VsCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const vscode = acquireVsCodeApi();

function parseFrontmatter(raw: string): {
  content: string;
  data: Record<string, unknown> | null;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { content: raw, data: null };

  const yamlBlock = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // Handle arrays like [tag1, tag2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    }
    if (key) data[key] = value;
  }

  return { content, data: Object.keys(data).length > 0 ? data : null };
}

export default function App() {
  const [markdown, setMarkdown] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      switch (msg.type) {
        case 'update':
          setMarkdown(msg.content || '');
          if (msg.theme) setTheme(msg.theme);
          if (msg.fontSize) setFontSize(msg.fontSize);
          break;
        case 'theme':
          if (msg.theme) setTheme(msg.theme);
          break;
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--md-font-size',
      `${fontSize}px`
    );
  }, [fontSize]);

  const { content, data: frontmatter } = useMemo(
    () => parseFrontmatter(markdown),
    [markdown]
  );

  if (!markdown) {
    return (
      <div className="empty-state">
        <p>Open a markdown file to see the preview</p>
      </div>
    );
  }

  return (
    <div className="preview-root">
      <div className="preview-content">
        {frontmatter && <FrontmatterDisplay data={frontmatter} />}
        <MarkdownRenderer content={content} theme={theme} />
      </div>
      <TableOfContents markdown={content} className="toc-sidebar" />
    </div>
  );
}
