import type { RewriteAction } from './types';

const PROMPTS: Record<Exclude<RewriteAction, 'custom'>, string> = {
  rewrite:
    'Rewrite the following markdown text while preserving its meaning and markdown formatting. Make it clearer and more engaging.',
  simplify:
    'Simplify the following markdown text. Use shorter sentences, simpler words, and clearer structure. Preserve markdown formatting.',
  expand:
    'Expand the following markdown text with more detail, examples, and explanation. Preserve markdown formatting.',
  fixgrammar:
    'Fix any grammar, spelling, and punctuation errors in the following markdown text. Preserve the original meaning and markdown formatting.',
  professional:
    'Rewrite the following markdown text in a more professional and formal tone. Preserve markdown formatting.',
};

export function getPrompt(
  action: RewriteAction,
  text: string,
  customInstruction?: string
): string {
  const instruction =
    action === 'custom' && customInstruction
      ? customInstruction
      : PROMPTS[action as Exclude<RewriteAction, 'custom'>];

  return `${instruction}\n\nReturn ONLY the rewritten text, no explanations or wrapping.\n\n---\n\n${text}`;
}
