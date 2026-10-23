import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  RotateCcw, 
  RotateCw, 
  WrapText, 
  Check, 
  Copy, 
  FileCode2, 
  Save, 
  Play,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { ProjectFile } from '../types';

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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* File Tab Bar */}
      <div className="h-10 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs px-3 select-none">
        <div className="flex items-center gap-1 overflow-x-auto h-full">
          {openFiles.map((path) => {
            const isActive = path === activeFilePath;
            const name = path.split('/').pop() || path;
            return (
              <div
                key={path}
                onClick={() => onSelectTab(path)}
                className={`group flex items-center gap-2 px-3.5 h-full cursor-pointer transition-colors border-b-2 text-xs font-medium ${
                  isActive
                    ? 'bg-slate-950/80 text-sky-400 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
                }`}
              >
                <FileCode2 className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{name}</span>
                {file.path === path && file.isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                )}
                {openFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(path);
                    }}
                    className="p-0.5 text-slate-500 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor Actions */}
        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search & Replace (Ctrl+F)"
            className={`p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors ${
              showSearch ? 'bg-slate-800 text-sky-400' : ''
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle Word Wrap"
            className={`p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors ${
              wordWrap ? 'bg-slate-800 text-sky-400' : ''
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyCode}
            title="Copy file contents"
            className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showSearch && (
        <div className="bg-slate-900/95 border-b border-slate-800 p-2.5 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Find in file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
              {matchCount > 0 && (
                <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-mono">
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
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleReplaceAll}
              disabled={!matchCount}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 font-medium transition-colors"
            >
              Replace All
            </button>
          </div>

          <button
            onClick={() => setShowSearch(false)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Code Textarea Area with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-[13px] leading-relaxed">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-14 bg-slate-950/80 border-r border-slate-800/80 text-slate-600 text-right pr-3 select-none py-3 overflow-hidden"
        >
          {lineNumbers.map((num) => (
            <div
              key={num}
              className={num === cursorPos.line ? 'text-sky-400 font-bold bg-slate-800/40 -mr-3 pr-3' : ''}
            >
              {num}
            </div>
          ))}
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
          className={`flex-1 bg-transparent text-slate-200 p-3 outline-none resize-none overflow-auto font-mono ${
            wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
          }`}
          style={{ tabSize: 4 }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-slate-900 border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span>
            Ln <strong className="text-slate-200 font-mono">{cursorPos.line}</strong>, Col{' '}
            <strong className="text-slate-200 font-mono">{cursorPos.col}</strong>
          </span>
          <span>{lineCount} lines</span>
          <span>{file.content.length} characters</span>
          {file.isModified && <span className="text-amber-400 font-medium">• Unsaved changes</span>}
        </div>

        <div className="flex items-center gap-4">
          <span>Spaces: 4</span>
          <span>UTF-8 (CRLF)</span>
          <span className="capitalize text-sky-400 font-medium">{file.language}</span>
        </div>
      </div>
    </div>
  );
};
