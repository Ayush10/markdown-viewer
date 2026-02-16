import * as vscode from 'vscode';
import { getWebviewContent } from './getWebviewContent';

export class PreviewManager {
  private panel: vscode.WebviewPanel | undefined;
  private updateTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.extensionUri = context.extensionUri;
  }

  showPreview(column: vscode.ViewColumn) {
    if (this.panel) {
      this.panel.reveal(column);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'markdownViewerPreview',
        'Markdown Preview',
        column,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.joinPath(this.extensionUri, 'dist'),
            vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'katex', 'dist'),
          ],
        }
      );

      this.panel.webview.html = getWebviewContent(
        this.panel.webview,
        this.extensionUri
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
      });

      // Theme sync
      const themeDisposable = vscode.window.onDidChangeActiveColorTheme(
        (theme) => {
          this.postTheme(theme.kind);
        }
      );
      this.disposables.push(themeDisposable);
    }

    // Send initial content
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId === 'markdown') {
      this.sendUpdate(editor.document);
    }
  }

  update(document: vscode.TextDocument) {
    if (!this.panel) return;
    if (document.languageId !== 'markdown') return;

    // Debounce 300ms
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      this.sendUpdate(document);
    }, 300);
  }

  updateImmediate(document: vscode.TextDocument) {
    if (!this.panel) return;
    if (document.languageId !== 'markdown') return;
    this.sendUpdate(document);
  }

  private sendUpdate(document: vscode.TextDocument) {
    if (!this.panel) return;

    const config = vscode.workspace.getConfiguration('markdownViewer.preview');
    const fontSize = config.get<number>('fontSize', 16);

    this.panel.webview.postMessage({
      type: 'update',
      content: document.getText(),
      theme: this.getTheme(),
      fontSize,
    });

    // Update panel title
    const fileName = document.fileName.split('/').pop() || 'Preview';
    this.panel.title = `Preview: ${fileName}`;
  }

  private getTheme(): 'dark' | 'light' {
    const kind = vscode.window.activeColorTheme.kind;
    return kind === vscode.ColorThemeKind.Light ||
      kind === vscode.ColorThemeKind.HighContrastLight
      ? 'light'
      : 'dark';
  }

  private postTheme(kind: vscode.ColorThemeKind) {
    if (!this.panel) return;
    const theme =
      kind === vscode.ColorThemeKind.Light ||
      kind === vscode.ColorThemeKind.HighContrastLight
        ? 'light'
        : 'dark';
    this.panel.webview.postMessage({ type: 'theme', theme });
  }

  dispose() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.panel?.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
