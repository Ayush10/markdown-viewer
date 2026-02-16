import * as vscode from 'vscode';

function wrapSelection(wrapper: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  editor.edit((editBuilder) => {
    for (const selection of editor.selections) {
      const text = editor.document.getText(selection);
      if (text.startsWith(wrapper) && text.endsWith(wrapper)) {
        // Unwrap
        editBuilder.replace(
          selection,
          text.slice(wrapper.length, -wrapper.length)
        );
      } else {
        editBuilder.replace(selection, `${wrapper}${text}${wrapper}`);
      }
    }
  });
}

function insertSnippet(snippet: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  editor.insertSnippet(new vscode.SnippetString(snippet));
}

export function registerEditorCommands(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('markdownViewer.toggleBold', () => {
      wrapSelection('**');
    }),

    vscode.commands.registerCommand('markdownViewer.toggleItalic', () => {
      wrapSelection('*');
    }),

    vscode.commands.registerCommand('markdownViewer.toggleCode', () => {
      wrapSelection('`');
    }),

    vscode.commands.registerCommand('markdownViewer.insertLink', () => {
      insertSnippet('[${1:text}](${2:url})');
    }),

    vscode.commands.registerCommand('markdownViewer.insertImage', () => {
      insertSnippet('![${1:alt text}](${2:url})');
    }),

    vscode.commands.registerCommand('markdownViewer.insertTable', () => {
      insertSnippet(
        '| ${1:Header 1} | ${2:Header 2} | ${3:Header 3} |\n| --- | --- | --- |\n| ${4:Cell 1} | ${5:Cell 2} | ${6:Cell 3} |'
      );
    }),

    vscode.commands.registerCommand('markdownViewer.insertCodeBlock', () => {
      insertSnippet('```${1:language}\n${2:code}\n```');
    }),

    vscode.commands.registerCommand(
      'markdownViewer.insertFrontmatter',
      () => {
        insertSnippet(
          '---\ntitle: ${1:Title}\nauthor: ${2:Author}\ndate: ${3:' +
            new Date().toISOString().split('T')[0] +
            '}\ntags: [${4:tag1, tag2}]\n---\n'
        );
      }
    )
  );
}
