import { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'dark' | 'light';
}

export default function Editor({ value, onChange, theme }: EditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
    ],
    []
  );

  const cmTheme = useMemo(
    () =>
      EditorView.theme(
        {
          '&': {
            height: '100%',
            fontSize: 'var(--md-font-size)',
          },
          '.cm-content': {
            padding: '24px 16px',
            caretColor: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
          },
          '.cm-gutters': {
            background: 'var(--bg-secondary)',
            color: 'var(--text-tertiary)',
            border: 'none',
            borderRight: '1px solid var(--border-subtle)',
          },
          '.cm-activeLineGutter': {
            background: 'var(--bg-hover)',
          },
          '.cm-activeLine': {
            background: 'var(--bg-hover)',
          },
          '.cm-cursor': {
            borderLeftColor: 'var(--accent)',
          },
          '.cm-selectionBackground': {
            background: 'var(--accent-subtle) !important',
          },
          '&.cm-focused .cm-selectionBackground': {
            background: 'var(--accent-subtle) !important',
          },
          '.cm-line': {
            padding: '0 8px',
          },
        },
        { dark: theme === 'dark' }
      ),
    [theme]
  );

  return (
    <div className="editor-container">
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={[...extensions, cmTheme]}
        theme={theme === 'dark' ? 'dark' : 'light'}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          indentOnInput: true,
        }}
      />
    </div>
  );
}
