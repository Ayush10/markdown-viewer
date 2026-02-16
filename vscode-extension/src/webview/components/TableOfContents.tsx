import { useEffect, useState, useCallback } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  markdown: string;
  className?: string;
}

export default function TableOfContents({ markdown, className }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const extracted: TocItem[] = [];
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`~\[\]]/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      extracted.push({ id, text, level });
    }
    setItems(extracted);
  }, [markdown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    const headings = document.querySelectorAll(
      '.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6'
    );
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [items]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (items.length === 0) return null;

  const minLevel = Math.min(...items.map((i) => i.level));

  return (
    <nav className={`toc ${className ?? ''} ${collapsed ? 'toc--collapsed' : ''}`}>
      <div className="toc-header" onClick={() => setCollapsed((c) => !c)}>
        <List size={16} />
        <span>On this page</span>
      </div>
      {!collapsed && (
        <ul className="toc-list">
          {items.map((item, i) => (
            <li
              key={`${item.id}-${i}`}
              className={`toc-item toc-item--level-${item.level - minLevel} ${
                activeId === item.id ? 'toc-item--active' : ''
              }`}
            >
              <button onClick={() => handleClick(item.id)}>{item.text}</button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
