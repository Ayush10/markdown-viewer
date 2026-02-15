import { useState, useCallback, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string | null;
  children: React.ReactNode;
}

const LANGUAGE_DISPLAY: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TSX',
  py: 'Python',
  rb: 'Ruby',
  rs: 'Rust',
  go: 'Go',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  fish: 'Fish',
  ps1: 'PowerShell',
  powershell: 'PowerShell',
  bat: 'Batch',
  cmd: 'Batch',
  yml: 'YAML',
  yaml: 'YAML',
  json: 'JSON',
  toml: 'TOML',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  sql: 'SQL',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  md: 'Markdown',
  markdown: 'Markdown',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  makefile: 'Makefile',
  make: 'Makefile',
  cmake: 'CMake',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  cs: 'C#',
  csharp: 'C#',
  java: 'Java',
  kotlin: 'Kotlin',
  kt: 'Kotlin',
  swift: 'Swift',
  objc: 'Objective-C',
  php: 'PHP',
  perl: 'Perl',
  lua: 'Lua',
  r: 'R',
  scala: 'Scala',
  clojure: 'Clojure',
  clj: 'Clojure',
  elixir: 'Elixir',
  ex: 'Elixir',
  erlang: 'Erlang',
  erl: 'Erlang',
  haskell: 'Haskell',
  hs: 'Haskell',
  ocaml: 'OCaml',
  ml: 'OCaml',
  fsharp: 'F#',
  dart: 'Dart',
  zig: 'Zig',
  nim: 'Nim',
  v: 'V',
  vue: 'Vue',
  svelte: 'Svelte',
  terraform: 'Terraform',
  tf: 'Terraform',
  hcl: 'HCL',
  ini: 'INI',
  conf: 'Config',
  nginx: 'Nginx',
  apache: 'Apache',
  diff: 'Diff',
  plaintext: 'Text',
  text: 'Text',
  txt: 'Text',
};

function getDisplayName(lang: string): string {
  const lower = lang.toLowerCase();
  return LANGUAGE_DISPLAY[lower] ?? lang.charAt(0).toUpperCase() + lang.slice(1);
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(() => {
    const code = preRef.current?.querySelector('code')?.textContent ?? '';
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">
          {language ? getDisplayName(language) : 'Code'}
        </span>
        <button
          className="code-block-copy"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}
