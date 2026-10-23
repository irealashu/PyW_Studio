import React, { useState } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  RotateCcw,
  Plus
} from 'lucide-react';
import { Project } from '../types';

interface TkinterPreviewModalProps {
  project: Project;
  onClose: () => void;
  onLogOutput: (text: string, stream?: 'stdout' | 'stderr' | 'system') => void;
}

export const TkinterPreviewModal: React.FC<TkinterPreviewModalProps> = ({
  project,
  onClose,
  onLogOutput,
}) => {
  const [counter, setCounter] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready. Click Increment to test Python event loop.');

  const handleIncrement = () => {
    const next = counter + 1;
    setCounter(next);
    setStatusMessage(`Value updated to ${next}`);
    onLogOutput(`[PyW App] Counter incremented to ${next}`);
  };

  const handleReset = () => {
    setCounter(0);
    setStatusMessage('Counter reset to 0');
    onLogOutput('[PyW App] Counter reset');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Windows Tkinter Simulated Frame */}
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden w-full max-w-md animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* Windows OS Title Bar */}
        <div className="h-10 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center text-xs font-bold text-white">
              Tk
            </div>
            <span className="text-sm font-semibold text-zinc-200">
              Desktop Utility - PyW Studio
            </span>
            <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono">
              Running
            </span>
          </div>

          {/* Windows Minimize/Maximize/Close buttons */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <button className="p-1.5 hover:text-zinc-200 hover:bg-zinc-800 rounded-md">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 hover:text-zinc-200 hover:bg-zinc-800 rounded-md">
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              title="Close window (destroy Tk root)"
              className="p-1.5 hover:text-white hover:bg-rose-600 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tkinter Application Content (Corresponds directly to main.pyw) */}
        <div className="bg-zinc-950 text-zinc-100 flex flex-col">
          {/* Header Banner */}
          <div className="bg-zinc-900 px-6 py-5 border-b border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-100">
              PyW Studio Application
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Python GUI Desktop Application (Tkinter & ttk)
            </p>
          </div>

          {/* Main Body */}
          <div className="p-6 space-y-6">
            {/* Counter Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Current Counter Value
              </span>
              <div className="text-4xl font-bold font-mono text-sky-400">
                {counter}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={handleIncrement}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Increment (+1)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-sm transition-colors cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Status Message */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-4 py-3 text-center">
              <p className="text-sm text-zinc-400">
                {statusMessage}
              </p>
            </div>
          </div>

          {/* Window Footer Status */}
          <div className="h-8 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>mainloop() active</span>
            <span>PID: 8492 (pythonw.exe)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
