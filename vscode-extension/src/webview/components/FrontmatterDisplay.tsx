import { Tag, User, Calendar, Hash } from 'lucide-react';

interface FrontmatterDisplayProps {
  data: Record<string, unknown>;
}

export default function FrontmatterDisplay({ data }: FrontmatterDisplayProps) {
  if (!data || Object.keys(data).length === 0) return null;

  const getIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k === 'author' || k === 'authors') return <User size={14} />;
    if (k === 'date' || k === 'created' || k === 'updated') return <Calendar size={14} />;
    if (k === 'tags' || k === 'categories') return <Tag size={14} />;
    return <Hash size={14} />;
  };

  const renderValue = (val: unknown): string => {
    if (Array.isArray(val)) return val.join(', ');
    if (val instanceof Date) return val.toLocaleDateString();
    return String(val);
  };

  return (
    <div className="frontmatter">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="frontmatter-item">
          {getIcon(key)}
          <span className="frontmatter-key">{key}</span>
          <span className="frontmatter-value">{renderValue(value)}</span>
        </div>
      ))}
    </div>
  );
}
