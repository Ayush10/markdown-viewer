import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import remarkEmoji from 'remark-emoji';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import MermaidBlock from './MermaidBlock';
import CodeBlock from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  theme: string;
}

export default function MarkdownRenderer({ content, theme }: MarkdownRendererProps) {
  const remarkPlugins = useMemo(
    () => [remarkGfm, remarkMath, [remarkFrontmatter, ['yaml']], remarkEmoji] as any[],
    []
  );

  const rehypePlugins = useMemo(
    () => [
      rehypeRaw,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypeKatex,
      [rehypeHighlight, { detect: true, ignoreMissing: true }],
    ] as any[],
    []
  );

  const components: Components = useMemo(
    () => ({
      pre({ children, ...props }) {
        const child = children as any;
        if (child?.type === 'code') {
          const className = child.props?.className ?? '';

          if (/language-mermaid/.test(className)) {
            const code = String(child.props?.children ?? '').trim();
            return <MermaidBlock code={code} theme={theme} />;
          }

          const langMatch = className.match(/language-(\S+)/);
          const language = langMatch ? langMatch[1] : null;

          return (
            <CodeBlock language={language}>
              {children}
            </CodeBlock>
          );
        }
        return <pre {...props}>{children}</pre>;
      },
      code({ children, className, ...props }) {
        const isInline = !className;
        if (isInline) {
          return (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      table({ children, ...props }) {
        return (
          <div className="table-wrapper">
            <table {...props}>{children}</table>
          </div>
        );
      },
      img({ src, alt, title, ...props }) {
        return (
          <figure className="md-figure">
            <img src={src} alt={alt} title={title ?? undefined} loading="lazy" {...props} />
            {(alt || title) && <figcaption>{title || alt}</figcaption>}
          </figure>
        );
      },
      blockquote({ children, ...props }) {
        const text = String(children);
        const alertMatch = text.match(/\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/);
        const alertType = alertMatch ? alertMatch[1].toLowerCase() : null;
        return (
          <blockquote className={alertType ? `alert alert--${alertType}` : ''} {...props}>
            {children}
          </blockquote>
        );
      },
      a({ href, children, ...props }) {
        const isExternal = href?.startsWith('http');
        return (
          <a
            href={href}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [theme]
  );

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
