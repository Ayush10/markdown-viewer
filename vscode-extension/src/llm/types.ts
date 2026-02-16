import type * as vscode from 'vscode';

export type RewriteAction =
  | 'rewrite'
  | 'simplify'
  | 'expand'
  | 'fixgrammar'
  | 'professional'
  | 'custom';

export interface LlmProvider {
  complete(
    prompt: string,
    token: vscode.CancellationToken
  ): Promise<string | null>;
}
