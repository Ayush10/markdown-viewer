import { useState, useCallback, useMemo, useEffect } from 'react';
import matter from 'gray-matter';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import type { ViewMode } from './components/Toolbar';
import MarkdownRenderer from './components/MarkdownRenderer';
import TableOfContents from './components/TableOfContents';
import WelcomeScreen from './components/WelcomeScreen';
import FrontmatterDisplay from './components/FrontmatterDisplay';
import Editor from './components/Editor';
import SplitPane from './components/SplitPane';
import { useTheme } from './hooks/useTheme';
import { useFiles } from './hooks/useFiles';
import { useDebouncedCallback } from './hooks/useDebounce';
import { SAMPLE_MARKDOWN } from './utils/sample-markdown';

export default function App() {
  const { theme, toggleTheme, fontSize, increaseFontSize, decreaseFontSize } = useTheme();
  const {
    files,
    activeFile,
    activeFileId,
    setActiveFileId,
    addFile,
    removeFile,
    updateFileContent,
    createNewFile,
    handleFileDrop,
    handleFileOpen,
  } = useFiles();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [editorContent, setEditorContent] = useState('');
  const [debouncedRenderContent, setDebouncedRenderContent] = useState('');

  // Sync editor content when active file changes
  useEffect(() => {
    if (activeFile) {
      setEditorContent(activeFile.content);
      setDebouncedRenderContent(activeFile.content);
    }
  }, [activeFileId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced file store update
  const debouncedUpdate = useDebouncedCallback((content: string) => {
    if (activeFileId) {
      updateFileContent(activeFileId, content);
    }
  }, 300);

  // Debounced render content update
  const debouncedRender = useDebouncedCallback((content: string) => {
    setDebouncedRenderContent(content);
  }, 300);

  const handleEditorChange = useCallback((value: string) => {
    setEditorContent(value);
    debouncedUpdate(value);
    debouncedRender(value);
  }, [debouncedUpdate, debouncedRender]);

  // In preview-only mode, render directly from activeFile
  useEffect(() => {
    if (viewMode === 'preview' && activeFile) {
      setDebouncedRenderContent(activeFile.content);
    }
  }, [viewMode, activeFile]);

  // Parse frontmatter from the render content
  const { content, frontmatter } = useMemo(() => {
    if (!debouncedRenderContent) return { content: '', frontmatter: null };
    try {
      const parsed = matter(debouncedRenderContent);
      return {
        content: parsed.content,
        frontmatter: Object.keys(parsed.data).length > 0 ? parsed.data : null,
      };
    } catch {
      return { content: debouncedRenderContent, frontmatter: null };
    }
  }, [debouncedRenderContent]);

  // New file handler
  const handleNewFile = useCallback(() => {
    createNewFile();
    setViewMode('split');
    setEditorContent('');
  }, [createNewFile]);

  // Cycle view mode
  const cycleViewMode = useCallback(() => {
    setViewMode(prev => {
      if (prev === 'preview') return 'split';
      if (prev === 'split') return 'editor';
      return 'preview';
    });
  }, []);

  // Keyboard shortcuts (web only — Electron uses native menus)
  useEffect(() => {
    if (window.electronAPI) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        cycleViewMode();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleViewMode, handleNewFile]);

  // Electron IPC listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubFileOpened = window.electronAPI.onFileOpened((fileData) => {
      addFile(fileData.name, fileData.content);
    });

    const unsubMenuOpen = window.electronAPI.onMenuOpenFile(() => {
      handleFileOpen();
    });

    const unsubTheme = window.electronAPI.onMenuToggleTheme(() => {
      toggleTheme();
    });

    const unsubFontUp = window.electronAPI.onMenuIncreaseFontSize(() => {
      increaseFontSize();
    });

    const unsubFontDown = window.electronAPI.onMenuDecreaseFontSize(() => {
      decreaseFontSize();
    });

    const unsubToggleEditor = window.electronAPI.onMenuToggleEditor(() => {
      cycleViewMode();
    });

    const unsubNewFile = window.electronAPI.onMenuNewFile(() => {
      handleNewFile();
    });

    return () => {
      unsubFileOpened();
      unsubMenuOpen();
      unsubTheme();
      unsubFontUp();
      unsubFontDown();
      unsubToggleEditor();
      unsubNewFile();
    };
  }, [addFile, handleFileOpen, toggleTheme, increaseFontSize, decreaseFontSize, cycleViewMode, handleNewFile]);

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then(text => {
      if (text.trim()) {
        addFile('pasted-content.md', text);
      }
    });
  }, [addFile]);

  const handleLoadSample = useCallback(() => {
    addFile('sample-showcase.md', SAMPLE_MARKDOWN);
  }, [addFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      setIsDragging(false);
      handleFileDrop(e);
    },
    [handleFileDrop]
  );

  const previewPane = (
    <article className="content-scroll">
      {frontmatter && <FrontmatterDisplay data={frontmatter} />}
      <MarkdownRenderer content={content} theme={theme} />
    </article>
  );

  const editorPane = (
    <Editor
      value={editorContent}
      onChange={handleEditorChange}
      theme={theme as 'dark' | 'light'}
    />
  );

  return (
    <div
      className="app"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-overlay-content">
            <span className="drop-icon">+</span>
            <p>Drop markdown file here</p>
          </div>
        </div>
      )}

      <Sidebar
        files={files}
        activeFileId={activeFileId}
        onSelectFile={setActiveFileId}
        onRemoveFile={removeFile}
        onOpenFile={handleFileOpen}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div className="main">
        <Toolbar
          theme={theme}
          onToggleTheme={toggleTheme}
          fontSize={fontSize}
          onIncreaseFontSize={increaseFontSize}
          onDecreaseFontSize={decreaseFontSize}
          rawMarkdown={activeFile?.content ?? ''}
          fileName={activeFile?.name ?? null}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(c => !c)}
          frontmatter={frontmatter}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          onNewFile={handleNewFile}
        />

        <div className="content-area">
          {activeFile ? (
            <>
              {viewMode === 'editor' && (
                <div className="editor-pane--full">{editorPane}</div>
              )}

              {viewMode === 'split' && (
                <SplitPane left={editorPane} right={previewPane} />
              )}

              {viewMode === 'preview' && previewPane}

              {viewMode !== 'editor' && (
                <TableOfContents markdown={content} className="toc-sidebar" />
              )}
            </>
          ) : (
            <WelcomeScreen
              onOpenFile={handleFileOpen}
              onPasteMarkdown={handlePaste}
              onLoadSample={handleLoadSample}
              onNewFile={handleNewFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
