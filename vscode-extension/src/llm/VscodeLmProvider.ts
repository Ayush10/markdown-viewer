import * as vscode from 'vscode';
import type { LlmProvider } from './types';

export class VscodeLmProvider implements LlmProvider {
  constructor(private model: vscode.LanguageModelChat) {}

  async complete(
    prompt: string,
    token: vscode.CancellationToken
  ): Promise<string | null> {
    try {
      const messages = [vscode.LanguageModelChatMessage.User(prompt)];
      const response = await this.model.sendRequest(messages, {}, token);

      let result = '';
      for await (const chunk of response.text) {
        result += chunk;
      }
      return result.trim();
    } catch (err) {
      if (err instanceof vscode.LanguageModelError) {
        vscode.window.showErrorMessage(`LLM Error: ${err.message}`);
      }
      return null;
    }
  }
}
