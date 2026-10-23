import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Folder, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Terminal,
  Layers
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
}) => {
  const currentInterpreter =
    interpreters.find((i) => i.id === project.pythonExecutableId) || interpreters[0];
  const currentEnv =
    environments.find((e) => e.id === project.environmentId) || environments[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
        {/* Section Header */}
        <div className="pb-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-sky-400" />
            Python Runtime & Environments
          </h2>
          <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
            Configure project interpreters and manage isolated virtual environments (<code className="text-zinc-200 font-mono">venv</code>).
          </p>
        </div>

        {/* 1. Environment Mode Selection */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-sky-400" />
              Environment Strategy
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Mode: <strong className="text-zinc-200 capitalize">{project.environmentMode}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => onSetEnvironmentMode('persistent')}
              className={`p-5 rounded-xl border cursor-pointer transition-colors ${
                project.environmentMode === 'persistent'
                  ? 'bg-zinc-800 border-sky-500'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-zinc-100">
                  Persistent Environment
                </span>
                {project.environmentMode === 'persistent' && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Persists installed packages across editing, testing, and packaging sessions. Stored in managed cache.
              </p>
            </div>

            <div
              onClick={() => onSetEnvironmentMode('temporary')}
              className={`p-5 rounded-xl border cursor-pointer transition-colors ${
                project.environmentMode === 'temporary'
                  ? 'bg-zinc-800 border-sky-500'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-zinc-100">
                  Ephemeral Build Environment
                </span>
                {project.environmentMode === 'temporary' && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Creates a clean virtual environment prior to packaging. Ideal for validating clean production releases.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Active Virtual Environment Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-sky-400" />
              Active Virtual Environment
            </h3>
            <button
              onClick={() => onRecreateEnvironment(currentEnv.id)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Rebuild Environment</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <span className="text-xs uppercase font-medium text-zinc-400 block">Name</span>
              <span className="text-sm font-mono font-bold text-zinc-100 mt-1 block truncate">
                {currentEnv.name}
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <span className="text-xs uppercase font-medium text-zinc-400 block">Python Version</span>
              <span className="text-sm font-mono text-emerald-400 mt-1 block">
                {currentEnv.pythonVersion}
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <span className="text-xs uppercase font-medium text-zinc-400 block">Packages</span>
              <span className="text-sm font-mono text-zinc-200 mt-1 block">
                {project.installedPackages.length} packages
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <span className="text-xs uppercase font-medium text-zinc-400 block">Disk Usage</span>
              <span className="text-sm font-mono text-zinc-200 mt-1 block">
                {currentEnv.totalSizeMb} MB
              </span>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 text-xs flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-2.5 truncate">
              <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="text-zinc-400 font-medium">Location:</span>
              <code className="text-zinc-200 font-mono truncate">{currentEnv.path}</code>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 shrink-0 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Managed Directory
            </span>
          </div>
        </div>

        {/* 3. Python Interpreters Registry */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-sky-400" />
              Python Interpreters
            </h3>
            <span className="text-xs text-zinc-400">
              Select target runtime interpreter
            </span>
          </div>

          <div className="space-y-3">
            {interpreters.map((interp) => {
              const isSelected = interp.id === currentInterpreter.id;
              return (
                <div
                  key={interp.id}
                  onClick={() => onSelectInterpreter(interp.id)}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-zinc-800 border-sky-500'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-zinc-100">{interp.name}</span>
                      {isSelected && (
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-sky-400 font-medium">
                          Active
                        </span>
                      )}
                      {interp.tkinterAvailable && (
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700 font-mono">
                          Tkinter ready
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-zinc-400">{interp.path}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-zinc-400 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                      {interp.arch}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-sky-500 bg-sky-500' : 'border-zinc-700'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
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
