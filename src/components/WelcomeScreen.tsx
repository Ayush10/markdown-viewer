import { FileUp, ClipboardPaste, Code2, BarChart3, Sigma, Table2, ListChecks, BookOpen, PenLine } from 'lucide-react';

interface WelcomeScreenProps {
  onOpenFile: () => void;
  onPasteMarkdown: () => void;
  onLoadSample: () => void;
  onNewFile: () => void;
}

const features = [
  { icon: Code2, label: 'Syntax Highlighting', desc: '190+ languages with theme-aware colors' },
  { icon: BarChart3, label: 'Mermaid Diagrams', desc: 'Flowcharts, sequence & state diagrams' },
  { icon: Sigma, label: 'LaTeX Math', desc: 'KaTeX-powered equation rendering' },
  { icon: Table2, label: 'GFM Tables', desc: 'Full GitHub Flavored Markdown tables' },
  { icon: ListChecks, label: 'Task Lists', desc: 'Interactive checkbox lists' },
  { icon: BookOpen, label: 'Frontmatter', desc: 'YAML metadata parsing & display' },
];

export default function WelcomeScreen({ onOpenFile, onPasteMarkdown, onLoadSample, onNewFile }: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome-hero">
        <div className="welcome-icon">
          <span>MD</span>
        </div>
        <h1>Markdown Viewer</h1>
        <p>Drop a <code>.md</code> file anywhere, or use the buttons below to get started.</p>
      </div>

      <div className="welcome-actions">
        <button className="welcome-btn welcome-btn--primary" onClick={onOpenFile}>
          <FileUp size={20} />
          <span>Open File</span>
        </button>
        <button className="welcome-btn welcome-btn--secondary" onClick={onPasteMarkdown}>
          <ClipboardPaste size={20} />
          <span>Paste Markdown</span>
        </button>
        <button className="welcome-btn welcome-btn--secondary" onClick={onNewFile}>
          <PenLine size={20} />
          <span>New File</span>
        </button>
        <button className="welcome-btn welcome-btn--ghost" onClick={onLoadSample}>
          <BookOpen size={20} />
          <span>Load Sample</span>
        </button>
      </div>

      <div className="welcome-features">
        <h2>Supported Features</h2>
        <div className="welcome-features-grid">
          {features.map(f => (
            <div key={f.label} className="welcome-feature-card">
              <f.icon size={24} />
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
