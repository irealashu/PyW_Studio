import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Hammer, 
  Save, 
  FolderPlus, 
  FolderGit2, 
  Square, 
  Code2, 
  Package, 
  Cpu, 
  History, 
  Trash2, 
  Settings,
  ChevronDown,
  Terminal,
  FileCode2,
  Check,
  Sparkles,
  Layers,
  TestTube2
} from 'lucide-react';
import { Project, ViewMode } from '../types';

interface HeaderProps {
  currentProject: Project;
  projects: Project[];
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onSelectProject: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onSaveCurrentFile: () => void;
  onRunScript: () => void;
  onBuildExe: () => void;
  onCancelTask: () => void;
  isTaskRunning: boolean;
  hasUnsavedChanges: boolean;
  onOpenSettings: () => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  activeView,
  onSelectView,
  onSelectProject,
  onOpenNewProjectModal,
  onSaveCurrentFile,
  onRunScript,
  onBuildExe,
  onCancelTask,
  isTaskRunning,
  hasUnsavedChanges,
  onOpenSettings,
  onToggleTerminal,
  isTerminalOpen,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'editor', label: 'Editor', icon: <Code2 className="w-4 h-4" /> },
    { 
      id: 'dependencies', 
      label: 'Dependencies', 
      icon: <Package className="w-4 h-4" />,
      count: currentProject.installedPackages.length
    },
    { id: 'environment', label: 'Environments', icon: <Cpu className="w-4 h-4" /> },
    { id: 'builder', label: 'EXE Builder', icon: <Hammer className="w-4 h-4" /> },
    { id: 'tests', label: 'Tests', icon: <TestTube2 className="w-4 h-4" /> },
    { id: 'history', label: 'Build History', icon: <History className="w-4 h-4" /> },
    { id: 'cleanup', label: 'Cleanup', icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md text-slate-200 select-none sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-15 flex items-center justify-between gap-6">
        
        {/* Left: Branding & Project Selector */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold text-sm tracking-tight">
              PyW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-100">
                  PyW Studio
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Windows Python Packaging
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Project Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-100 font-semibold">{currentProject.name}</span>
                <span className="text-slate-400 text-[11px] font-mono">({currentProject.entryScript})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${projectMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {projectMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 pb-2 mb-1 border-b border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <span>Projects</span>
                  <span className="text-slate-500 text-[10px]">{projects.length} available</span>
                </div>

                <div className="max-h-60 overflow-y-auto px-1 py-1 space-y-0.5">
                  {projects.map((p) => {
                    const isSelected = p.id === currentProject.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectProject(p.id);
                          setProjectMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-sky-500/15 text-sky-300 font-medium'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCode2 className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                          <div className="truncate">
                            <span className="block truncate font-medium">{p.name}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{p.entryScript}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800 mt-2 pt-2 px-1">
                  <button
                    onClick={() => {
                      onOpenNewProjectModal();
                      setProjectMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 flex items-center gap-2 font-medium transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Create New Python Project...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Menu Tabs (Spacious, Clean, Uncongested) */}
        <nav className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-sky-800 text-sky-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Main Action Buttons */}
          {isTaskRunning ? (
            <button
              onClick={onCancelTask}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all animate-pulse cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel Task</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRunScript}
                title="Run active script (F5)"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:shadow-emerald-600/30 active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
                <span className="text-[10px] font-mono opacity-80 bg-emerald-700/80 px-1 py-0.2 rounded">F5</span>
              </button>

              <button
                onClick={onBuildExe}
                title="Build Standalone Executable (PyInstaller)"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer hover:shadow-sky-600/30 active:scale-98"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Build EXE</span>
              </button>
            </div>
          )}

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Quick Utility Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={onSaveCurrentFile}
              title="Save current file (Ctrl+S)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
              {hasUnsavedChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
              )}
            </button>

            <button
              onClick={onToggleTerminal}
              title="Toggle Console Terminal"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isTerminalOpen
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Settings & Workspace Preferences"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
