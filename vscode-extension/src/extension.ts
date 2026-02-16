import * as vscode from 'vscode';
import { PreviewManager } from './preview/PreviewManager';
import { LlmService } from './llm/LlmService';
import { registerEditorCommands } from './editor/commands';
import type { RewriteAction } from './llm/types';

export function activate(context: vscode.ExtensionContext) {
  const previewManager = new PreviewManager(context);
  const llmService = new LlmService();

  // ─── Preview Commands ───
  context.subscriptions.push(
    vscode.commands.registerCommand('markdownViewer.showPreview', () => {
      previewManager.showPreview(vscode.ViewColumn.Active);
    }),
    vscode.commands.registerCommand(
      'markdownViewer.showPreviewToSide',
      () => {
        previewManager.showPreview(vscode.ViewColumn.Beside);
      }
    )
  );

  // ─── LLM Commands ───
  const llmActions: { command: string; action: RewriteAction }[] = [
    { command: 'markdownViewer.llmRewrite', action: 'rewrite' },
    { command: 'markdownViewer.llmSimplify', action: 'simplify' },
    { command: 'markdownViewer.llmExpand', action: 'expand' },
    { command: 'markdownViewer.llmFixGrammar', action: 'fixgrammar' },
    { command: 'markdownViewer.llmProfessional', action: 'professional' },
  ];

  for (const { command, action } of llmActions) {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
          vscode.window.showInformationMessage(
            'Select some text first to rewrite with AI.'
          );
          return;
        }

        const selectedText = editor.document.getText(editor.selection);
        const result = await llmService.rewrite(selectedText, action);
        if (result) {
          await editor.edit((editBuilder) => {
            editBuilder.replace(editor.selection, result);
          });
        }
      })
    );
  }

  // Custom prompt command
  context.subscriptions.push(
    vscode.commands.registerCommand('markdownViewer.llmCustom', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showInformationMessage(
          'Select some text first to rewrite with AI.'
        );
        return;
      }

      const instruction = await vscode.window.showInputBox({
        prompt: 'Enter your rewriting instruction',
        placeHolder:
          'e.g., "Make it more casual" or "Translate to Spanish"',
      });

      if (!instruction) return;

      const selectedText = editor.document.getText(editor.selection);
      const result = await llmService.rewrite(
        selectedText,
        'custom',
        instruction
      );
      if (result) {
        await editor.edit((editBuilder) => {
          editBuilder.replace(editor.selection, result);
        });
      }
    })
  );

  // ─── Editor Enhancements ───
  registerEditorCommands(context);

  // ─── Auto-open & Live Preview ───
  function shouldAutoOpen(): boolean {
    return vscode.workspace
      .getConfiguration('markdownViewer.preview')
      .get<boolean>('autoOpen', true);
  }

  function autoOpenIfMarkdown(editor: vscode.TextEditor | undefined) {
    if (!editor) return;
    if (editor.document.languageId !== 'markdown') return;
    if (!shouldAutoOpen()) return;

    // Auto-open preview to the side
    previewManager.showPreview(vscode.ViewColumn.Beside);
  }

  // Auto-open for the currently active editor on activation
  autoOpenIfMarkdown(vscode.window.activeTextEditor);

  // Auto-open when switching to a markdown file
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document.languageId === 'markdown') {
        autoOpenIfMarkdown(editor);
        previewManager.updateImmediate(editor.document);
      }
    })
  );

  // Live preview on text changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === 'markdown') {
        previewManager.update(e.document);
      }
    })
  );

  // Auto-open when a new markdown file is opened
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (document.languageId !== 'markdown') return;
      if (!shouldAutoOpen()) return;

      // Small delay to let the editor tab settle before opening preview
      setTimeout(() => {
        const active = vscode.window.activeTextEditor;
        if (active?.document === document) {
          previewManager.showPreview(vscode.ViewColumn.Beside);
        }
      }, 100);
    })
  );

  // ─── Reset LLM provider when config changes ───
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('markdownViewer.llm')) {
        llmService.resetProvider();
      }
    })
  );

  // Cleanup
  context.subscriptions.push({
    dispose: () => previewManager.dispose(),
  });
}

export function deactivate() {}
