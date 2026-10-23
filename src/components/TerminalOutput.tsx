import React, { useRef, useEffect, useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Square, 
  CheckCircle2, 
  AlertCircle,
  X,
  CornerDownLeft,
  Sparkles
} from 'lucide-react';
import { TaskLogItem } from '../types';

interface TerminalOutputProps {
  currentTask: TaskLogItem | null;
  onCancelTask: () => void;
  onClearLogs: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onExecuteCommand?: (command: string) => void;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  currentTask,
  onCancelTask,
  onClearLogs,
  isOpen,
  onToggleOpen,
  onExecuteCommand,
}) => {
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentTask?.logs, autoScroll]);

  const handleCopyLogs = () => {
    if (!currentTask) return;
    const text = currentTask.logs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    if (!currentTask) return;
    const text = currentTask.logs.map((l) => l.text).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pyw_studio_${currentTask.type}_log.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const cmd = inputVal.trim();
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setInputVal('');

    if (onExecuteCommand) {
      onExecuteCommand(cmd);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    }
  };

  if (!isOpen) {
    return (
      <div
        onClick={onToggleOpen}
        className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:bg-slate-850 hover:text-slate-300 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium text-slate-300">Terminal & Interactive Python Console</span>
          {currentTask && currentTask.status === 'running' && (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              {currentTask.title}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Click to expand</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-68 bg-slate-950 border-t border-slate-800 flex flex-col font-mono text-xs select-none">
      {/* Console Top Toolbar */}
      <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-200">Terminal Task Runner & REPL</span>
          {currentTask && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentTask.title}
              </span>
              <span
                className={`font-semibold ${
                  currentTask.status === 'running'
                    ? 'text-amber-400 animate-pulse'
                    : currentTask.status === 'success'
                    ? 'text-emerald-400'
                    : currentTask.status === 'failed'
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                [{currentTask.status.toUpperCase()}]
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 text-slate-400">
          {currentTask?.status === 'running' && (
            <button
              onClick={onCancelTask}
              title="Cancel running process"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600/90 text-white hover:bg-rose-500 font-sans text-[10px] font-semibold cursor-pointer"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Kill</span>
            </button>
          )}

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title="Auto-scroll"
            className={`px-1.5 py-0.5 rounded text-[10px] font-sans cursor-pointer ${
              autoScroll ? 'bg-slate-800 text-sky-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleCopyLogs}
            title="Copy logs"
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadLogs}
            title="Download log file"
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearLogs}
            title="Clear console"
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleOpen}
            title="Collapse terminal"
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output Console Log Area */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 text-slate-300 font-mono text-[11px] leading-relaxed selection:bg-sky-500/30"
      >
        {!currentTask || currentTask.logs.length === 0 ? (
          <div className="text-slate-600 italic">
            PyW Studio Python 3.12.3 Console Ready. Type Python statements (e.g. &apos;2+2&apos;, &apos;math.sqrt(16)&apos;) or commands (&apos;pip list&apos;, &apos;help&apos;) below.
          </div>
        ) : (
          currentTask.logs.map((log, idx) => {
            const isStderr = log.stream === 'stderr';
            const isSystem = log.stream === 'system';

            let colorClass = 'text-slate-300';
            if (isStderr) colorClass = 'text-rose-400 font-medium';
            else if (isSystem) colorClass = 'text-sky-400 font-semibold';
            else if (log.text.includes('INFO:')) colorClass = 'text-emerald-300';
            else if (log.text.includes('WARNING:')) colorClass = 'text-amber-300';
            else if (log.text.includes('ERROR:')) colorClass = 'text-rose-400 font-bold';

            return (
              <div key={idx} className={`leading-tight break-all ${colorClass}`}>
                {log.text}
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Command Prompt Line */}
      <form
        onSubmit={handleInputSubmit}
        className="h-9 bg-slate-900 border-t border-slate-800/80 px-3 flex items-center gap-2 select-text"
      >
        <span className="text-emerald-400 font-bold font-mono text-xs select-none">
          &gt;&gt;&gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Python statement or CLI command (e.g. 2**10, pip list, help)..."
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none font-mono text-xs"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="p-1 text-slate-400 hover:text-sky-300 disabled:opacity-30 cursor-pointer"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
