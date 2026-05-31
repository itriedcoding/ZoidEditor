import { useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useStore, Tab } from '../store';
import { detectLanguage } from '../services/ai';

interface EditorProps { tab: Tab; }

let themesDefined = false;

function defineThemes(monaco: any) {
  if (themesDefined) return;
  themesDefined = true;

  monaco.editor.defineTheme('zoid-dark', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'comment', foreground: '666666' },
      { token: 'keyword', foreground: 'FFFFFF', fontStyle: 'bold' },
      { token: 'string', foreground: 'CCCCCC' },
      { token: 'number', foreground: '999999' },
      { token: 'type', foreground: 'FFFFFF' },
      { token: 'function', foreground: 'FFFFFF' },
      { token: 'variable', foreground: 'CCCCCC' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#FFFFFF',
      'editor.lineHighlightBackground': '#111111',
      'editor.selectionBackground': '#333333',
      'editor.inactiveSelectionBackground': '#222222',
      'editorCursor.foreground': '#FFFFFF',
      'editorLineNumber.foreground': '#444444',
      'editorLineNumber.activeForeground': '#888888',
      'editorIndentGuide.background': '#1a1a1a',
      'editorIndentGuide.activeBackground': '#333333',
      'editor.selectionHighlightBackground': '#222222',
      'editorBracketMatch.background': '#222222',
      'editorBracketMatch.border': '#444444',
      'scrollbarSlider.background': '#333333',
      'scrollbarSlider.hoverBackground': '#444444',
      'scrollbarSlider.activeBackground': '#555555',
      'minimap.background': '#000000',
    },
  });

  monaco.editor.defineTheme('zoid-light', {
    base: 'vs', inherit: true,
    rules: [
      { token: 'comment', foreground: '999999' },
      { token: 'keyword', foreground: '000000', fontStyle: 'bold' },
      { token: 'string', foreground: '333333' },
      { token: 'number', foreground: '666666' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editor.lineHighlightBackground': '#F0F0F0',
      'editor.selectionBackground': '#CCCCCC',
      'editor.inactiveSelectionBackground': '#DDDDDD',
      'editorCursor.foreground': '#000000',
      'editorLineNumber.foreground': '#BBBBBB',
      'editorLineNumber.activeForeground': '#777777',
      'editorIndentGuide.background': '#E5E5E5',
      'editorIndentGuide.activeBackground': '#CCCCCC',
      'minimap.background': '#FFFFFF',
    },
  });
}

function CodeEditor({ tab }: EditorProps) {
  const { updateFileContent, settings, setCursorPosition, setFindController } = useStore();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    defineThemes(monaco);
    monaco.editor.setTheme(settings.theme === 'black-white' ? 'zoid-dark' : 'zoid-light');
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({ lineNumber: e.position.lineNumber, column: e.position.column });
    });
    // Expose find controller for FindReplace component
    const controller = editor.getContribution('editor.contrib.findController') as any;
    if (controller) setFindController(controller);
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(settings.theme === 'black-white' ? 'zoid-dark' : 'zoid-light');
    }
  }, [settings.theme]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) updateFileContent(tab.id, value);
  }, [tab.id, updateFileContent]);

  const language = tab.language || detectLanguage(tab.fileName);
  const theme = settings.theme === 'black-white' ? 'zoid-dark' : 'zoid-light';

  return (
    <Editor
      key={tab.id}
      defaultLanguage={language}
      language={language}
      value={tab.content}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme={theme}
      options={{
        fontSize: settings.fontSize,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap,
        minimap: { enabled: settings.minimap !== 'none' },
        lineNumbers: settings.lineNumbers,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
        fontLigatures: true,
        bracketPairColorization: { enabled: false },
        renderWhitespace: 'selection',
        padding: { top: 16 },
        folding: true,
        foldingHighlight: false,
        guides: { indentation: false, bracketPairs: false },
        renderLineHighlight: 'line',
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        contextmenu: true,
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        formatOnPaste: true,
        autoIndent: 'full',
        formatOnType: true,
      }}
    />
  );
}

export default CodeEditor;
