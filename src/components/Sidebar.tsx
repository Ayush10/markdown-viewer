import { FileText, X, Plus, FolderOpen, Search } from 'lucide-react';
import type { FileEntry } from '../hooks/useFiles';
import { useState } from 'react';

interface SidebarProps {
  files: FileEntry[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onOpenFile: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  files,
  activeFileId,
  onSelectFile,
  onRemoveFile,
  onOpenFile,
  collapsed,
  onToggle,
}: SidebarProps) {
  const [search, setSearch] = useState('');

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-title">Files</span>}
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <FolderOpen size={18} /> : <X size={16} />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="sidebar-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sidebar-actions">
            <button className="sidebar-btn" onClick={onOpenFile}>
              <Plus size={14} />
              <span>Open File</span>
            </button>
          </div>

          <div className="sidebar-files">
            {filteredFiles.length === 0 && (
              <div className="sidebar-empty">
                {files.length === 0
                  ? 'No files loaded. Open or drop a .md file.'
                  : 'No matching files.'}
              </div>
            )}
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className={`sidebar-file ${file.id === activeFileId ? 'sidebar-file--active' : ''}`}
                onClick={() => onSelectFile(file.id)}
              >
                <FileText size={14} />
                <span className="sidebar-file-name">{file.name}</span>
                <button
                  className="sidebar-file-remove"
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveFile(file.id);
                  }}
                  title="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
