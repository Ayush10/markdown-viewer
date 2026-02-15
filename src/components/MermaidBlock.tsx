import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

function initMermaid(theme: string) {
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
  });
}

interface MermaidBlockProps {
  code: string;
  theme: string;
}

export default function MermaidBlock({ code, theme }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${crypto.randomUUID()}`);

  useEffect(() => {
    initMermaid(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        initMermaid(theme);
        const { svg: rendered } = await mermaid.render(idRef.current, code);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setSvg('');
        }
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code, theme]);

  if (error) {
    return (
      <div className="mermaid-error">
        <span className="mermaid-error-label">Diagram Error</span>
        <pre>{error}</pre>
        <pre className="mermaid-source">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
