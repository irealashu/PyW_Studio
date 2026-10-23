import React from 'react';
import { X, Settings, HardDrive, ShieldCheck, Cpu, Terminal, Palette } from 'lucide-react';
import { PythonInterpreter } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  interpreters: PythonInterpreter[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  interpreters,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">PyW Studio Application Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          {/* Managed Paths */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              Application Storage Root
            </span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>
                <span className="text-slate-500">Workspace:</span> %LOCALAPPDATA%\PyWStudio
              </div>
              <div>
                <span className="text-slate-500">Environments:</span> %LOCALAPPDATA%\PyWStudio\environments
              </div>
              <div>
                <span className="text-slate-500">Staging:</span> %LOCALAPPDATA%\PyWStudio\staging
              </div>
              <div>
                <span className="text-slate-500">Logs:</span> %LOCALAPPDATA%\PyWStudio\logs
              </div>
            </div>
          </div>

          {/* PyInstaller Version Policy */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              PyInstaller Engine Policy
            </span>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span>Default Packaging Engine:</span>
                <span className="font-mono text-emerald-400 font-bold">PyInstaller 6.5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Target Binary Architecture:</span>
                <span className="font-mono text-slate-300">Windows AMD64 (PE32+)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Isolated venv installation:</span>
                <span className="font-mono text-sky-400">Enforced (Safe Mode)</span>
              </div>
            </div>
          </div>

          {/* Safety rules */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safety & Data Integrity Rules
            </span>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-1.5 text-slate-400 leading-relaxed">
              <p>• Never delete user source files (.py, .pyw) during cleanup or packaging.</p>
              <p>• Always verify PE32+ executable header and exit code before reporting build success.</p>
              <p>• Subprocess calls use explicit argument vectors (no shell=True injection vulnerabilities).</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
