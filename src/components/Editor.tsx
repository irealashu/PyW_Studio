import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  WrapText, 
  Check, 
  Copy, 
  FileCode2, 
  FileCode,
  Archive,
  Download,
  Save,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  GitCompare,
  ChevronDown
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
  onDownloadExe?: () => void;
  onExportPy?: () => void;
  onExportPyw?: () => void;
  onExportZip?: () => void;
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
  onDownloadExe,
  onExportPy,
  onExportPyw,
  onExportZip,
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
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      {/* File Tab Bar with Integrated Save & Export Controls */}
      <div className="h-11 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-sm px-3 select-none gap-2 overflow-x-auto scrollbar-thin">
        {/* Left Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto h-full min-w-0">
          {openFiles.map((path) => {
            const isActive = path === activeFilePath;
            const name = path.split('/').pop() || path;
            return (
              <div
                key={path}
                onClick={() => onSelectTab(path)}
                className={`group flex items-center gap-2 px-3.5 h-full cursor-pointer transition-colors border-b-2 text-xs sm:text-sm font-semibold shrink-0 ${
                  isActive
                    ? 'bg-zinc-950 text-sky-300 border-sky-400'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-850 border-transparent'
                }`}
              >
                <FileCode2 className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-zinc-400'}`} />
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
                    className="p-0.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Save & Export Buttons (guaranteed visible right in editor toolbar) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Save Button */}
          <button
            onClick={onSaveFile}
            title="Save file (Ctrl+S)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
              file.isModified
                ? 'bg-amber-500/20 text-amber-200 border-amber-400 hover:bg-amber-500/30'
                : 'bg-zinc-800/80 text-zinc-200 hover:text-white hover:bg-zinc-700 border-zinc-700'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${file.isModified ? 'text-amber-400' : 'text-zinc-300'}`} />
            <span>Save</span>
          </button>

          {/* Quick Exports right to Save button */}
          {onDownloadExe && (
            <button
              onClick={onDownloadExe}
              title="Download standalone .exe"
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-sky-950 text-sky-300 hover:text-sky-200 border border-sky-600/70 hover:border-sky-500 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>.exe</span>
            </button>
          )}

          {onExportPy && (
            <button
              onClick={onExportPy}
              title="Export as standard Python (.py)"
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition-all cursor-pointer"
            >
              <FileCode className="w-3 h-3 text-blue-400" />
              <span>.py</span>
            </button>
          )}

          {onExportPyw && (
            <button
              onClick={onExportPyw}
              title="Export as windowed Python (.pyw)"
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition-all cursor-pointer"
            >
              <FileCode2 className="w-3 h-3 text-teal-400" />
              <span>.pyw</span>
            </button>
          )}

          {onExportZip && (
            <button
              onClick={onExportZip}
              title="Export whole project as .zip"
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition-all cursor-pointer"
            >
              <Archive className="w-3 h-3 text-amber-400" />
              <span>.zip</span>
            </button>
          )}

          {/* Export Dropdown for small screens or all-in-one menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              title="Export Options"
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <ChevronDown className={`w-3 h-3 text-zinc-300 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-1.5 z-50">
                {onDownloadExe && (
                  <button
                    onClick={() => {
                      onDownloadExe();
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-zinc-800 text-zinc-100 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Download .exe</span>
                  </button>
                )}
                {onExportPy && (
                  <button
                    onClick={() => {
                      onExportPy();
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-zinc-800 text-zinc-100 font-semibold cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export to .py</span>
                  </button>
                )}
                {onExportPyw && (
                  <button
                    onClick={() => {
                      onExportPyw();
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-zinc-800 text-zinc-100 font-semibold cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Export to .pyw</span>
                  </button>
                )}
                {onExportZip && (
                  <button
                    onClick={() => {
                      onExportZip();
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-zinc-800 text-zinc-100 font-semibold cursor-pointer border-t border-zinc-800 mt-1 pt-1.5"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Project export to .zip</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-700 mx-0.5" />

          {/* Tools: Search, Wrap, Diff, Copy */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search & Replace (Ctrl+F)"
            className={`p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer ${
              showSearch ? 'bg-zinc-800 text-sky-300 border border-sky-500/50' : ''
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle Word Wrap"
            className={`p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer ${
              wordWrap ? 'bg-zinc-800 text-sky-300 border border-sky-500/50' : ''
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowDiff(!showDiff)}
            title="Compare with saved version"
            className={`p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer ${
              showDiff ? 'bg-zinc-800 text-sky-300 border border-sky-500/50' : ''
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyCode}
            title="Copy file contents"
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showSearch && (
        <div className="bg-zinc-900 border-b border-zinc-700 p-2.5 flex items-center justify-between text-sm gap-3">
          <div className="flex items-center gap-2.5 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Find in file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-600 rounded-lg px-3 py-1.5 text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
              />
              {matchCount > 0 && (
                <span className="absolute right-3 top-2 text-xs text-zinc-300 font-mono font-medium">
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
                className="w-full bg-zinc-950 border border-zinc-600 rounded-lg px-3 py-1.5 text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleReplaceAll}
              disabled={!matchCount}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 disabled:opacity-40 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 border border-zinc-700"
            >
              Replace All
            </button>
          </div>

          <button
            onClick={() => setShowSearch(false)}
            className="p-1.5 text-zinc-300 hover:text-white rounded-md hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Code Textarea Area with High-Contrast Line Numbers & Error Gutter */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-[14px] leading-relaxed">
        {/* Line Numbers Gutter: high-contrast text-zinc-400 */}
        <div
          ref={lineNumbersRef}
          className="w-14 bg-zinc-950 border-r border-zinc-800 text-zinc-400 text-right pr-3 select-none py-3 overflow-hidden shrink-0 font-mono text-[13px] font-medium"
        >
          {lineNumbers.map((num) => {
            const hasError = diagnostics.some((d) => d.line === num && d.severity === 'error');
            const hasWarning = diagnostics.some((d) => d.line === num && d.severity === 'warning');

            return (
              <div
                key={num}
                className={`flex items-center justify-end gap-1.5 ${
                  num === cursorPos.line ? 'text-sky-300 font-bold bg-zinc-900/50' : ''
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
          className={`flex-1 bg-transparent text-zinc-100 p-3.5 outline-none resize-none overflow-auto font-mono text-[14px] leading-relaxed selection:bg-sky-500/40 ${
            wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
          }`}
          style={{ tabSize: 4 }}
        />
      </div>

      {/* Problems / Syntax Errors Drawer */}
      {showProblems && diagnostics.length > 0 && (
        <div className="bg-zinc-900 border-t border-zinc-700 p-3 max-h-40 overflow-y-auto font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-300 pb-1.5 border-b border-zinc-800">
            <span className="font-bold text-zinc-100">
              Syntax Diagnostics ({diagnostics.length})
            </span>
            <button
              onClick={() => setShowProblems(false)}
              className="text-zinc-400 hover:text-white"
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
              <span className="text-zinc-300 font-bold">Line {diag.line}:</span>
              <span className="text-zinc-100">{diag.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* High-Contrast Status Bar */}
      <div className="h-8 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-300 select-none font-medium">
        <div className="flex items-center gap-4 sm:gap-6">
          <span>
            Ln <strong className="text-zinc-100 font-mono font-bold">{cursorPos.line}</strong>, Col{' '}
            <strong className="text-zinc-100 font-mono font-bold">{cursorPos.col}</strong>
          </span>
          <span>{lineCount} lines</span>
          <span className="hidden sm:inline">{file.content.length} characters</span>
          {file.isModified && <span className="text-amber-400 font-bold">• Unsaved changes</span>}

          {/* Syntax diagnostics pill */}
          {file.language === 'python' && (
            <button
              onClick={() => setShowProblems(!showProblems)}
              className="flex items-center gap-1.5 hover:text-white cursor-pointer font-semibold"
            >
              {diagnostics.length === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No syntax errors
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {diagnostics.length} issue(s)
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          <span className="capitalize text-sky-400 font-bold">{file.language}</span>
        </div>
      </div>
    </div>
  );
};
