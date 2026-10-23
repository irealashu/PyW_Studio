import React from 'react';
import { X, Settings, HardDrive, ShieldCheck, Terminal } from 'lucide-react';
import { PythonInterpreter } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  interpreters: PythonInterpreter[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-zinc-100">PyW Studio Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-zinc-300 max-h-[75vh] overflow-y-auto">
          {/* Managed Paths */}
          <div className="space-y-2.5">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider text-xs flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              Application Storage Root
            </span>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-400 space-y-1.5">
              <div>
                <span className="text-zinc-500">Workspace:</span> %LOCALAPPDATA%\PyWStudio
              </div>
              <div>
                <span className="text-zinc-500">Environments:</span> %LOCALAPPDATA%\PyWStudio\environments
              </div>
              <div>
                <span className="text-zinc-500">Staging:</span> %LOCALAPPDATA%\PyWStudio\staging
              </div>
              <div>
                <span className="text-zinc-500">Logs:</span> %LOCALAPPDATA%\PyWStudio\logs
              </div>
            </div>
          </div>

          {/* PyInstaller Policy */}
          <div className="space-y-2.5">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              PyInstaller Packaging Engine
            </span>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Default Packaging Engine:</span>
                <span className="font-mono text-emerald-400 font-bold">PyInstaller 6.5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Target Binary Architecture:</span>
                <span className="font-mono text-zinc-200">Windows AMD64 (PE32+)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Isolated Virtual Environment:</span>
                <span className="font-mono text-sky-400">Enforced</span>
              </div>
            </div>
          </div>

          {/* Safety rules */}
          <div className="space-y-2.5">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Integrity & Safety
            </span>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2 text-xs text-zinc-400 leading-relaxed">
              <p>• Never delete user source files (.py, .pyw) during packaging or cleaning.</p>
              <p>• Automatically verify PE32+ executable headers before reporting build success.</p>
              <p>• Safe subprocess invocation with sanitized argument vectors.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
