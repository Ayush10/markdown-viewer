import { useState } from 'react';
import { Download, Apple, Monitor, MonitorSmartphone, ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react';
import { useGitHubRelease, type Platform } from '../hooks/useGitHubRelease';

const REPO = 'Ayush10/markdown-viewer';

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

const PLATFORM_ICONS: Record<Platform, typeof Monitor> = {
  mac: Apple,
  windows: Monitor,
  linux: MonitorSmartphone,
  unknown: Monitor,
};

const PLATFORM_LABELS: Record<Platform, string> = {
  mac: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  unknown: 'Desktop',
};

export default function DownloadSection() {
  const { release, loading, error, platform, recommended, allDownloads } = useGitHubRelease(REPO);
  const [expanded, setExpanded] = useState(false);

  // Don't show inside Electron
  if (window.electronAPI) return null;

  if (loading) {
    return (
      <div className="download-section">
        <div className="download-loading">
          <Loader2 size={20} className="download-spinner" />
          <span>Checking for downloads...</span>
        </div>
      </div>
    );
  }

  if (error || !release) return null;

  const RecommendedIcon = PLATFORM_ICONS[platform] || Monitor;
  const platforms: Platform[] = ['mac', 'windows', 'linux'];

  return (
    <div className="download-section">
      <h2>Download Desktop App</h2>
      <p className="download-version">
        {release.name} &middot; {new Date(release.published_at).toLocaleDateString()}
      </p>

      {recommended && (
        <a
          href={recommended.asset.download_url}
          className="download-btn download-btn--recommended"
          download
        >
          <RecommendedIcon size={20} />
          <div className="download-btn-text">
            <span className="download-btn-label">Download for {PLATFORM_LABELS[platform]}</span>
            <span className="download-btn-meta">{recommended.label} &middot; {formatSize(recommended.asset.size)}</span>
          </div>
          <Download size={18} />
        </a>
      )}

      <button
        className="download-toggle"
        onClick={() => setExpanded(e => !e)}
      >
        All platforms
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="download-all">
          {platforms.map(p => {
            const downloads = allDownloads[p];
            if (downloads.length === 0) return null;
            const Icon = PLATFORM_ICONS[p];
            return (
              <div key={p} className="download-platform">
                <div className="download-platform-header">
                  <Icon size={16} />
                  <span>{PLATFORM_LABELS[p]}</span>
                </div>
                {downloads.map(d => (
                  <a
                    key={d.asset.name}
                    href={d.asset.download_url}
                    className="download-btn download-btn--secondary"
                    download
                  >
                    <span className="download-btn-label">{d.label}</span>
                    <span className="download-btn-meta">{formatSize(d.asset.size)}</span>
                    <Download size={14} />
                  </a>
                ))}
              </div>
            );
          })}
          <a
            href={release.html_url}
            className="download-release-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
