import { Sun, Moon, ZoomIn, ZoomOut, Copy, Check, PanelLeftClose, PanelLeft, Eye, Columns2, Code2, FilePlus } from 'lucide-react';
import { useState, useCallback } from 'react';

export type ViewMode = 'preview' | 'split' | 'editor';

interface ToolbarProps {
  theme: string;
  onToggleTheme: () => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  rawMarkdown: string;
  fileName: string | null;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  frontmatter: Record<string, unknown> | null;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onNewFile: () => void;
}

export default function Toolbar({
  theme,
  onToggleTheme,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  rawMarkdown,
  fileName,
  sidebarCollapsed,
  onToggleSidebar,
  frontmatter,
  viewMode,
  onSetViewMode,
  onNewFile,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [rawMarkdown]);

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button className="toolbar-btn" onClick={onToggleSidebar} title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}>
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div className="toolbar-breadcrumb">
          <span className="toolbar-logo">MD</span>
          {fileName && (
            <>
              <span className="toolbar-sep">/</span>
              <span className="toolbar-filename">{fileName}</span>
            </>
          )}
          {frontmatter?.title != null && (
            <>
              <span className="toolbar-sep">—</span>
              <span className="toolbar-doctitle">{String(frontmatter.title as string)}</span>
            </>
          )}
        </div>
      </div>

      <div className="toolbar-right">
        <button className="toolbar-btn" onClick={onNewFile} title="New file (Cmd+N)">
          <FilePlus size={16} />
        </button>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${viewMode === 'editor' ? 'toolbar-btn--active' : ''}`}
            onClick={() => onSetViewMode('editor')}
            title="Editor only"
          >
            <Code2 size={16} />
          </button>
          <button
            className={`toolbar-btn ${viewMode === 'split' ? 'toolbar-btn--active' : ''}`}
            onClick={() => onSetViewMode('split')}
            title="Split view"
          >
            <Columns2 size={16} />
          </button>
          <button
            className={`toolbar-btn ${viewMode === 'preview' ? 'toolbar-btn--active' : ''}`}
            onClick={() => onSetViewMode('preview')}
            title="Preview only"
          >
            <Eye size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={onDecreaseFontSize} title="Decrease font size">
            <ZoomOut size={16} />
          </button>
          <span className="toolbar-font-size">{fontSize}px</span>
          <button className="toolbar-btn" onClick={onIncreaseFontSize} title="Increase font size">
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <button className="toolbar-btn" onClick={handleCopy} title="Copy raw markdown">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>

        <button className="toolbar-btn toolbar-btn--theme" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
