import * as vscode from 'vscode';
import type { LlmProvider } from './types';

export class DirectApiProvider implements LlmProvider {
  constructor(
    private vendor: 'anthropic' | 'openai',
    private apiKey: string,
    private model: string
  ) {}

  async complete(
    prompt: string,
    token: vscode.CancellationToken
  ): Promise<string | null> {
    const controller = new AbortController();
    const disposable = token.onCancellationRequested(() => controller.abort());

    try {
      if (this.vendor === 'anthropic') {
        return await this.callAnthropic(prompt, controller.signal);
      } else {
        return await this.callOpenAI(prompt, controller.signal);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
      vscode.window.showErrorMessage(`API Error: ${err.message}`);
      return null;
    } finally {
      disposable.dispose();
    }
  }

  private async callAnthropic(
    prompt: string,
    signal: AbortSignal
  ): Promise<string> {
    const model = this.model || 'claude-sonnet-4-20250514';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic API ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? '';
  }

  private async callOpenAI(
    prompt: string,
    signal: AbortSignal
  ): Promise<string> {
    const model = this.model || 'gpt-4o';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI API ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}
