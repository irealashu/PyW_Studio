import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Folder, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';
import { Project, PythonInterpreter, VirtualEnvironment } from '../types';

interface EnvironmentManagerProps {
  project: Project;
  interpreters: PythonInterpreter[];
  environments: VirtualEnvironment[];
  onSelectInterpreter: (interpreterId: string) => void;
  onSetEnvironmentMode: (mode: 'persistent' | 'temporary') => void;
  onRecreateEnvironment: (envId: string) => void;
  onAddNewInterpreter: (name: string, path: string, version: string) => void;
}

export const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({
  project,
  interpreters,
  environments,
  onSelectInterpreter,
  onSetEnvironmentMode,
  onRecreateEnvironment,
  onAddNewInterpreter,
}) => {
  const currentInterpreter =
    interpreters.find((i) => i.id === project.pythonExecutableId) || interpreters[0];
  const currentEnv =
    environments.find((e) => e.id === project.environmentId) || environments[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Section Header */}
        <div className="pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            Python Interpreters & Virtual Environments
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure project-specific interpreters, manage isolated virtual environments (<code className="text-sky-300 font-mono">venv</code>), and ensure system Python safety.
          </p>
        </div>

        {/* 1. Environment Mode Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Environment Isolation Strategy
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Mode: <strong className="text-sky-300 capitalize">{project.environmentMode}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode A */}
            <div
              onClick={() => onSetEnvironmentMode('persistent')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                project.environmentMode === 'persistent'
                  ? 'bg-sky-950/30 border-sky-500 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-100">
                  Mode A: Persistent Project Environment
                </span>
                {project.environmentMode === 'persistent' && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Reuses the isolated environment across editing, testing, and packaging sessions. Stored in managed application cache (%LOCALAPPDATA%/PyWStudio/environments). Faster iteration.
              </p>
            </div>

            {/* Mode B */}
            <div
              onClick={() => onSetEnvironmentMode('temporary')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                project.environmentMode === 'temporary'
                  ? 'bg-sky-950/30 border-sky-500 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-100">
                  Mode B: Temporary Clean Build Environment
                </span>
                {project.environmentMode === 'temporary' && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Spins up an ephemeral, 100% clean virtual environment prior to PyInstaller packaging. Eliminates conflicting local caches. Best for production release verification.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Active Virtual Environment Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Folder className="w-4 h-4 text-sky-400" />
              Active Project Virtual Environment
            </h3>
            <button
              onClick={() => onRecreateEnvironment(currentEnv.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Rebuild venv</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Environment Name</span>
              <span className="text-xs font-mono font-bold text-slate-100 mt-1 block truncate">
                {currentEnv.name}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Python Version</span>
              <span className="text-xs font-mono text-emerald-400 mt-1 block">
                {currentEnv.pythonVersion}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Installed Packages</span>
              <span className="text-xs font-mono text-slate-200 mt-1 block">
                {project.installedPackages.length} packages
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Disk Size</span>
              <span className="text-xs font-mono text-slate-200 mt-1 block">
                {currentEnv.totalSizeMb} MB
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] text-slate-400">Location:</span>
              <code className="text-sky-300 font-mono text-[11px] truncate">{currentEnv.path}</code>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 shrink-0 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protected Managed Root
            </span>
          </div>
        </div>

        {/* 3. Python Interpreters Registry */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              Registered Python Interpreters
            </h3>
            <span className="text-[11px] text-slate-400">
              Select target interpreter for packaging and execution
            </span>
          </div>

          <div className="space-y-2">
            {interpreters.map((interp) => {
              const isSelected = interp.id === currentInterpreter.id;
              return (
                <div
                  key={interp.id}
                  onClick={() => onSelectInterpreter(interp.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{interp.name}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-900 text-sky-300 border border-sky-700 font-medium">
                          Active
                        </span>
                      )}
                      {interp.tkinterAvailable && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                          Tkinter ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">{interp.path}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-900">
                      {interp.arch}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
