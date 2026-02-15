import { useState, useCallback } from 'react';

export interface FileEntry {
  id: string;
  name: string;
  content: string;
  lastModified: number;
}

export function useFiles() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const addFile = useCallback((name: string, content: string) => {
    const id = crypto.randomUUID();
    const entry: FileEntry = { id, name, content, lastModified: Date.now() };
    setFiles(prev => [...prev, entry]);
    setActiveFileId(id);
    return id;
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setActiveFileId(prev => (prev === id ? null : prev));
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, content, lastModified: Date.now() } : f))
    );
  }, []);

  const createNewFile = useCallback(() => {
    return addFile('untitled.md', '');
  }, [addFile]);

  const activeFile = files.find(f => f.id === activeFileId) ?? null;

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(file => {
        if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.mdx') || file.type === 'text/markdown') {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              addFile(file.name, reader.result);
            }
          };
          reader.readAsText(file);
        }
      });
    },
    [addFile]
  );

  const handleFileOpen = useCallback(async () => {
    // Electron: use native file dialog
    if (window.electronAPI) {
      const openedFiles = await window.electronAPI.openFiles();
      openedFiles.forEach(f => addFile(f.name, f.content));
      return;
    }

    // Browser fallback: use <input type="file">
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.mdx,.txt';
    input.multiple = true;
    input.onchange = () => {
      if (input.files) {
        Array.from(input.files).forEach(file => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              addFile(file.name, reader.result);
            }
          };
          reader.readAsText(file);
        });
      }
    };
    input.click();
  }, [addFile]);

  return {
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
  };
}
