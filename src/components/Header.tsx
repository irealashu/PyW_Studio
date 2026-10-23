import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Hammer, 
  Save, 
  Square, 
  Code2, 
  Package, 
  Cpu, 
  History, 
  Settings,
  ChevronDown,
  Terminal,
  FileCode2,
  Check,
  Plus
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
      label: 'Packages', 
      icon: <Package className="w-4 h-4" />,
      count: currentProject.installedPackages.length
    },
    { id: 'builder', label: 'Build EXE', icon: <Hammer className="w-4 h-4" /> },
    { id: 'environment', label: 'Environments', icon: <Cpu className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 select-none sticky top-0 z-40">
      <div className="w-full px-5 h-16 flex items-center justify-between gap-6">
        
        {/* Left: Branding & Project Selector */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-base tracking-tight shadow-sm">
              PyW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-zinc-100">
                  PyW Studio
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  v2.0
                </span>
              </div>
              <span className="text-xs text-zinc-400 block">
                Python Windows Packaging
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800" />

          {/* Project Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-zinc-100 font-semibold">{currentProject.name}</span>
                <span className="text-zinc-400 text-xs font-mono">({currentProject.entryScript})</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${projectMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {projectMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 pb-2 mb-1 border-b border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  <span>Projects</span>
                  <span className="text-zinc-500 font-mono">{projects.length} available</span>
                </div>

                <div className="max-h-60 overflow-y-auto px-1.5 py-1 space-y-1">
                  {projects.map((p) => {
                    const isSelected = p.id === currentProject.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectProject(p.id);
                          setProjectMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500/10 text-sky-400 font-medium'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCode2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-400' : 'text-zinc-400'}`} />
                          <div className="truncate">
                            <span className="block truncate font-medium">{p.name}</span>
                            <span className="text-xs text-zinc-400 font-mono truncate block">{p.entryScript}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-zinc-800 mt-2 pt-2 px-1.5">
                  <button
                    onClick={() => {
                      onOpenNewProjectModal();
                      setProjectMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-sky-400 hover:text-sky-300 hover:bg-zinc-800 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 text-zinc-400'
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
        <div className="flex items-center gap-3 shrink-0">
          {isTaskRunning ? (
            <button
              onClick={onCancelTask}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Cancel Task</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onRunScript}
                title="Run script (F5)"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run</span>
                <span className="text-xs font-mono opacity-80 bg-emerald-700 px-1.5 py-0.5 rounded">F5</span>
              </button>

              <button
                onClick={onBuildExe}
                title="Build Standalone Executable (PyInstaller)"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors cursor-pointer active:scale-98"
              >
                <Hammer className="w-4 h-4" />
                <span>Build EXE</span>
              </button>
            </div>
          )}

          <div className="h-6 w-px bg-zinc-800 mx-1" />

          {/* Quick Utility Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSaveCurrentFile}
              title="Save current file (Ctrl+S)"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
              )}
            </button>

            <button
              onClick={onToggleTerminal}
              title="Toggle Console Terminal"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isTerminalOpen
                  ? 'bg-zinc-800 text-sky-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Console</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Settings & Workspace Preferences"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
