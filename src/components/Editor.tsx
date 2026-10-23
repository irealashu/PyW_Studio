import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  WrapText, 
  Check, 
  Copy, 
  FileCode2, 
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  GitCompare
} from 'lucide-react';
import { ProjectFile, SyntaxDiagnostic } from '../types';

interface EditorProps {
  file: ProjectFile;
  openFiles: string[];
  activeFilePath: string;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onChangeContent: (newContent: string) => void;
  onSaveFile: () => void;
  onRunScript: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  file,
  openFiles,
  activeFilePath,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  onSaveFile,
  onRunScript,
}) => {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [wordWrap, setWordWrap] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diagnostics, setDiagnostics] = useState<SyntaxDiagnostic[]>([]);
  const [showProblems, setShowProblems] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Synchronize scroll between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = file.content.substring(0, pos);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Real-time Python Syntax Checker
  useEffect(() => {
    if (file.language !== 'python') {
      setDiagnostics([]);
      return;
    }

    const issues: SyntaxDiagnostic[] = [];
    const lines = file.content.split('\n');

    let openParens = 0;
    let openBrackets = 0;
    let openBraces = 0;

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();

      // Check comments vs code
      if (trimmed.startsWith('#') || trimmed.length === 0) return;

      // Check for missing colon on control flow statements
      const controlFlowRegex = /^(def\s+\w+\(.*\)|class\s+\w+.*|if\s+.+|elif\s+.+|else|for\s+.+\s+in\s+.+|while\s+.+|try|except.*|finally)$/;
      if (controlFlowRegex.test(trimmed) && !trimmed.endsWith(':')) {
        issues.push({
          line: lineNum,
          column: lineText.length,
          message: `SyntaxError: expected ':' at end of '${trimmed.split(' ')[0]}' statement`,
          severity: 'error',
        });
      }

      // Check for mixed tabs and spaces
      if (lineText.startsWith(' ') && lineText.includes('\t')) {
        issues.push({
          line: lineNum,
          column: 1,
          message: 'TabError: inconsistent use of tabs and spaces in indentation',
          severity: 'warning',
        });
      }

      // Track brackets
      for (const char of lineText) {
        if (char === '(') openParens++;
        else if (char === ')') openParens--;
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets--;
        else if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
      }
    });

    if (openParens !== 0) {
      issues.push({
        line: lines.length,
        column: 1,
        message: `SyntaxError: unclosed parenthesis '(' (${Math.abs(openParens)} unmatched)`,
        severity: 'error',
      });
    }

    if (openBrackets !== 0) {
      issues.push({
        line: lines.length,
        column: 1,
        message: `SyntaxError: unclosed square bracket '[' (${Math.abs(openBrackets)} unmatched)`,
        severity: 'error',
      });
    }

    setDiagnostics(issues);
  }, [file.content, file.language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save shortcut: Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSaveFile();
      return;
    }

    // Run shortcut: F5 or Ctrl+R
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
      e.preventDefault();
      onRunScript();
      return;
    }

    // Search shortcut: Ctrl+F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
      return;
    }

    // Tab key handling: indent with 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = file.content;

      if (e.shiftKey) {
        // Unindent
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        if (value.substring(lineStart, lineStart + 4) === '    ') {
          const newContent = value.substring(0, lineStart) + value.substring(lineStart + 4);
          onChangeContent(newContent);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = Math.max(lineStart, start - 4);
              textareaRef.current.selectionEnd = Math.max(lineStart, end - 4);
            }
          }, 0);
        }
      } else {
        // Indent 4 spaces
        const newContent = value.substring(0, start) + '    ' + value.substring(end);
        onChangeContent(newContent);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
          }
        }, 0);
      }
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const start = e.currentTarget.selectionStart;
      const value = file.content;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const match = currentLine.match(/^(\s+)/);
      const indent = match ? match[1] : '';
      const extraIndent = currentLine.trim().endsWith(':') ? '    ' : '';

      if (indent || extraIndent) {
        e.preventDefault();
        const insert = '\n' + indent + extraIndent;
        const newContent = value.substring(0, start) + insert + value.substring(start);
        onChangeContent(newContent);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + insert.length;
          }
        }, 0);
      }
    }
  };

  // Search logic
  useEffect(() => {
    if (!searchTerm) {
      setMatchCount(0);
      return;
    }
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = file.content.match(regex);
    setMatchCount(matches ? matches.length : 0);
  }, [searchTerm, file.content]);

  const handleReplaceAll = () => {
    if (!searchTerm) return;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = file.content.replace(regex, replaceTerm);
    onChangeContent(newContent);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = file.content.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const jumpToLine = (lineNum: number) => {
    if (!textareaRef.current) return;
    const lines = file.content.split('\n');
    let charIndex = 0;
    for (let i = 0; i < lineNum - 1 && i < lines.length; i++) {
      charIndex += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex);
    updateCursorPosition();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* File Tab Bar */}
      <div className="h-11 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-sm px-3 select-none">
        <div className="flex items-center gap-1 overflow-x-auto h-full">
          {openFiles.map((path) => {
            const isActive = path === activeFilePath;
            const name = path.split('/').pop() || path;
            return (
              <div
                key={path}
                onClick={() => onSelectTab(path)}
                className={`group flex items-center gap-2.5 px-4 h-full cursor-pointer transition-colors border-b-2 text-sm font-medium ${
                  isActive
                    ? 'bg-zinc-950 text-sky-400 border-sky-400'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border-transparent'
                }`}
              >
                <FileCode2 className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-zinc-500'}`} />
                <span>{name}</span>
                {file.path === path && file.isModified && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                )}
                {openFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(path);
                    }}
                    className="p-1 text-zinc-500 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor Actions */}
        <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search & Replace (Ctrl+F)"
            className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer ${
              showSearch ? 'bg-zinc-800 text-sky-400' : ''
            }`}
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle Word Wrap"
            className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer ${
              wordWrap ? 'bg-zinc-800 text-sky-400' : ''
            }`}
          >
            <WrapText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDiff(!showDiff)}
            title="Compare with saved version"
            className={`p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer ${
              showDiff ? 'bg-zinc-800 text-sky-400' : ''
            }`}
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyCode}
            title="Copy file contents"
            className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showSearch && (
        <div className="bg-zinc-900 border-b border-zinc-800 p-3 flex items-center justify-between text-sm gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Find in file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-sky-500"
              />
              {matchCount > 0 && (
                <span className="absolute right-3 top-2 text-xs text-zinc-400 font-mono">
                  {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                </span>
              )}
            </div>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleReplaceAll}
              disabled={!matchCount}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 text-sm font-medium transition-colors cursor-pointer shrink-0"
            >
              Replace All
            </button>
          </div>

          <button
            onClick={() => setShowSearch(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Code Textarea Area with Line Numbers & Error Gutter */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-[14px] leading-relaxed">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-14 bg-zinc-950 border-r border-zinc-800/80 text-zinc-600 text-right pr-3 select-none py-3 overflow-hidden shrink-0 font-mono text-[13px]"
        >
          {lineNumbers.map((num) => {
            const hasError = diagnostics.some((d) => d.line === num && d.severity === 'error');
            const hasWarning = diagnostics.some((d) => d.line === num && d.severity === 'warning');

            return (
              <div
                key={num}
                className={`flex items-center justify-end gap-1.5 ${
                  num === cursorPos.line ? 'text-sky-400 font-semibold' : ''
                }`}
              >
                {hasError ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Syntax Error on this line" />
                ) : hasWarning ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Syntax Warning on this line" />
                ) : null}
                <span>{num}</span>
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={file.content}
          onChange={(e) => onChangeContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          onScroll={handleScroll}
          spellCheck={false}
          className={`flex-1 bg-transparent text-zinc-100 p-3.5 outline-none resize-none overflow-auto font-mono text-[14px] leading-relaxed selection:bg-sky-500/30 ${
            wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
          }`}
          style={{ tabSize: 4 }}
        />
      </div>

      {/* Problems / Syntax Errors Drawer */}
      {showProblems && diagnostics.length > 0 && (
        <div className="bg-zinc-900 border-t border-zinc-800 p-3 max-h-40 overflow-y-auto font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400 pb-1.5 border-b border-zinc-800">
            <span className="font-semibold text-zinc-200">
              Syntax Diagnostics ({diagnostics.length})
            </span>
            <button
              onClick={() => setShowProblems(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              ×
            </button>
          </div>
          {diagnostics.map((diag, i) => (
            <div
              key={i}
              onClick={() => jumpToLine(diag.line)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-zinc-800 cursor-pointer text-xs"
            >
              {diag.severity === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-zinc-400 font-bold">Line {diag.line}:</span>
              <span className="text-zinc-200">{diag.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status Bar */}
      <div className="h-8 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-5">
          <span>
            Ln <strong className="text-zinc-200 font-mono">{cursorPos.line}</strong>, Col{' '}
            <strong className="text-zinc-200 font-mono">{cursorPos.col}</strong>
          </span>
          <span>{lineCount} lines</span>
          <span>{file.content.length} characters</span>
          {file.isModified && <span className="text-amber-400 font-medium">• Unsaved changes</span>}

          {/* Syntax diagnostics pill */}
          {file.language === 'python' && (
            <button
              onClick={() => setShowProblems(!showProblems)}
              className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer"
            >
              {diagnostics.length === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No syntax errors
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> {diagnostics.length} issue(s)
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-5">
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          <span className="capitalize text-sky-400 font-medium">{file.language}</span>
        </div>
      </div>
    </div>
  );
};
