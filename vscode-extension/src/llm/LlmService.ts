import * as vscode from 'vscode';
import { VscodeLmProvider } from './VscodeLmProvider';
import { DirectApiProvider } from './DirectApiProvider';
import type { LlmProvider, RewriteAction } from './types';
import { getPrompt } from './prompts';

export class LlmService {
  private provider: LlmProvider | null = null;

  async rewrite(
    text: string,
    action: RewriteAction,
    customInstruction?: string
  ): Promise<string | null> {
    const provider = await this.resolveProvider();
    if (!provider) {
      const choice = await vscode.window.showWarningMessage(
        'No LLM available. Install GitHub Copilot or configure an API key in settings.',
        'Open Settings'
      );
      if (choice === 'Open Settings') {
        vscode.commands.executeCommand(
          'workbench.action.openSettings',
          'markdownViewer.llm'
        );
      }
      return null;
    }

    const prompt = getPrompt(action, text, customInstruction);

    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Rewriting: ${action}...`,
        cancellable: true,
      },
      async (_progress, token) => {
        return provider.complete(prompt, token);
      }
    );
  }

  /** Invalidate cached provider so next call re-resolves */
  resetProvider() {
    this.provider = null;
  }

  private async resolveProvider(): Promise<LlmProvider | null> {
    // Always re-resolve to pick up config changes
    this.provider = null;

    const config = vscode.workspace.getConfiguration('markdownViewer.llm');
    const preference = config.get<string>('provider', 'auto');

    // Tier 1: vscode.lm API
    if (preference === 'auto' || preference === 'vscode-lm') {
      if (typeof vscode.lm !== 'undefined') {
        try {
          const models = await vscode.lm.selectChatModels({});
          if (models.length > 0) {
            this.provider = new VscodeLmProvider(models[0]);
            return this.provider;
          }
        } catch {
          // vscode.lm not available in this editor fork
        }
      }
    }

    // Tier 2: Direct API
    const anthropicKey = config.get<string>('anthropicApiKey', '');
    const openaiKey = config.get<string>('openaiApiKey', '');
    const model = config.get<string>('model', '');

    if (preference === 'anthropic' || (preference === 'auto' && anthropicKey)) {
      if (anthropicKey) {
        this.provider = new DirectApiProvider('anthropic', anthropicKey, model);
        return this.provider;
      }
    }

    if (preference === 'openai' || (preference === 'auto' && openaiKey)) {
      if (openaiKey) {
        this.provider = new DirectApiProvider('openai', openaiKey, model);
        return this.provider;
      }
    }

    // Tier 3: Nothing available
    return null;
  }
}
