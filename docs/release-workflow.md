# Release Workflow

## How Releases Work

Build artifacts (DMG, EXE, AppImage, deb) are hosted on **GitHub Releases** — free, CDN-backed, up to 2 GB per file. They are NOT stored in the git repository.

The portfolio download page at `ayushojha.com/tools/markdowneditor` fetches the latest release from the GitHub API and links directly to the assets.

## Automated Release (CI/CD)

A GitHub Actions workflow at `.github/workflows/release.yml` builds natively on all 3 platforms when you push a version tag.

### Steps

```bash
# 1. Make your code changes and commit
git add -A && git commit -m "Fix something"

# 2. Bump the version (creates commit + tag automatically)
npm version patch    # 1.0.0 → 1.0.1 (bug fix)
npm version minor    # 1.0.0 → 1.1.0 (new feature)
npm version major    # 1.0.0 → 2.0.0 (breaking change)

# 3. Push code + tag to trigger CI
git push origin main --tags
```

### What Happens

1. GitHub Actions detects the `v*` tag push
2. Three parallel jobs start:
   - `macos-latest` → builds DMG (x64 + arm64)
   - `windows-latest` → builds NSIS installer (x64 + arm64) + portable
   - `ubuntu-latest` → builds AppImage + deb (x64 + arm64)
3. All artifacts are collected and attached to a new GitHub Release
4. The portfolio download page picks up the new version within 1 hour (ISR revalidation)

## Manual Release

If you need to release without CI (e.g., first release):

```bash
# Build locally
npm run electron:build          # All platforms
npm run electron:build:mac      # macOS only
npm run electron:build:win      # Windows only
npm run electron:build:linux    # Linux only

# Create tag
git tag v1.0.0
git push origin v1.0.0

# Create release and upload
gh release create v1.0.0 --title "Markdown Viewer v1.0.0" --generate-notes \
  release/*.dmg release/*.exe release/*.AppImage release/*.deb
```

## Build Artifacts

| Platform | Format | Architectures |
|----------|--------|---------------|
| macOS | DMG | x64 (Intel), arm64 (Apple Silicon) |
| Windows | NSIS installer | x64, arm64 |
| Windows | Portable EXE | x64 |
| Linux | AppImage | x64, arm64 |
| Linux | Deb | amd64, arm64 |

## Download Page

The portfolio download page at `/tools/markdowneditor` is a server component that:
- Fetches `https://api.github.com/repos/Ayush10/markdown-viewer/releases/latest`
- Caches the response for 1 hour (Next.js ISR)
- Detects the visitor's OS and highlights the matching download
- Links directly to GitHub CDN download URLs

No manual updates needed on the portfolio side when releasing new versions.

## Repository

- **GitHub**: https://github.com/Ayush10/markdown-viewer
- **Releases**: https://github.com/Ayush10/markdown-viewer/releases
