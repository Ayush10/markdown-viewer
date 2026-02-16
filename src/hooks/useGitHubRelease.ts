import { useState, useEffect } from 'react';

export interface ReleaseAsset {
  name: string;
  size: number;
  download_url: string;
}

export interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: ReleaseAsset[];
}

export type Platform = 'mac' | 'windows' | 'linux' | 'unknown';
export type Arch = 'arm64' | 'x64' | 'unknown';

interface PlatformDownload {
  label: string;
  asset: ReleaseAsset;
  variant?: string;
}

interface UseGitHubReleaseResult {
  release: Release | null;
  loading: boolean;
  error: string | null;
  platform: Platform;
  arch: Arch;
  recommended: PlatformDownload | null;
  allDownloads: Record<Platform, PlatformDownload[]>;
}

function detectPlatform(): { platform: Platform; arch: Arch } {
  const ua = navigator.userAgent.toLowerCase();
  let platform: Platform = 'unknown';
  let arch: Arch = 'unknown';

  if (ua.includes('mac')) platform = 'mac';
  else if (ua.includes('win')) platform = 'windows';
  else if (ua.includes('linux')) platform = 'linux';

  if (ua.includes('arm64') || ua.includes('aarch64')) arch = 'arm64';
  else arch = 'x64';

  // macOS Apple Silicon detection
  if (platform === 'mac') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer.includes('Apple') && !renderer.includes('Intel')) {
            arch = 'arm64';
          }
        }
      }
    } catch {
      // fallback to x64
    }
  }

  return { platform, arch };
}

function categorizeAssets(assets: ReleaseAsset[]): Record<Platform, PlatformDownload[]> {
  const result: Record<Platform, PlatformDownload[]> = {
    mac: [],
    windows: [],
    linux: [],
    unknown: [],
  };

  for (const asset of assets) {
    const name = asset.name.toLowerCase();

    if (name.endsWith('.dmg')) {
      const arch = name.includes('arm64') ? 'Apple Silicon' : 'Intel';
      result.mac.push({ label: `macOS ${arch}`, asset, variant: name.includes('arm64') ? 'arm64' : 'x64' });
    } else if (name.endsWith('.exe')) {
      if (name.includes('portable')) {
        result.windows.push({ label: 'Windows Portable (x64)', asset, variant: 'portable' });
      } else {
        const arch = name.includes('arm64') ? 'ARM64' : 'x64';
        result.windows.push({ label: `Windows Installer (${arch})`, asset, variant: name.includes('arm64') ? 'arm64' : 'x64' });
      }
    } else if (name.endsWith('.appimage')) {
      const arch = name.includes('arm64') ? 'ARM64' : 'x86_64';
      result.linux.push({ label: `Linux AppImage (${arch})`, asset, variant: name.includes('arm64') ? 'arm64' : 'x64' });
    } else if (name.endsWith('.deb')) {
      const arch = name.includes('arm64') ? 'ARM64' : 'amd64';
      result.linux.push({ label: `Linux .deb (${arch})`, asset, variant: name.includes('arm64') ? 'arm64-deb' : 'x64-deb' });
    }
  }

  return result;
}

function getRecommended(
  downloads: Record<Platform, PlatformDownload[]>,
  platform: Platform,
  arch: Arch,
): PlatformDownload | null {
  const platformDownloads = downloads[platform];
  if (!platformDownloads || platformDownloads.length === 0) return null;

  // Find best match for arch
  const archMatch = platformDownloads.find(d => d.variant === arch);
  if (archMatch) return archMatch;

  // Fallback: first non-portable option, or just first
  return platformDownloads.find(d => d.variant !== 'portable') || platformDownloads[0];
}

export function useGitHubRelease(repo: string): UseGitHubReleaseResult {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { platform, arch } = detectPlatform();

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}/releases/latest`)
      .then(res => {
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRelease({
          tag_name: data.tag_name,
          name: data.name,
          published_at: data.published_at,
          html_url: data.html_url,
          assets: data.assets.map((a: { name: string; size: number; browser_download_url: string }) => ({
            name: a.name,
            size: a.size,
            download_url: a.browser_download_url,
          })),
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [repo]);

  const allDownloads = release ? categorizeAssets(release.assets) : { mac: [], windows: [], linux: [], unknown: [] };
  const recommended = getRecommended(allDownloads, platform, arch);

  return { release, loading, error, platform, arch, recommended, allDownloads };
}
