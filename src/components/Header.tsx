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
  FileCode,
  Archive,
  Download,
  Check,
  Plus
} from 'lucide-react';
import { Project, ViewMode } from '../types';

interface HeaderProps {
  currentProject: Project;
  projects: Project[];
  activeView: ViewMode;
  activeFilePath?: string;
  onSelectView: (view: ViewMode) => void;
  onSelectProject: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onSaveCurrentFile: () => void;
  onRunScript: () => void;
  onBuildExe: () => void;
  onDownloadExe: () => void;
  onExportPy: () => void;
  onExportPyw: () => void;
  onExportZip: () => void;
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
  activeFilePath,
  onSelectView,
  onSelectProject,
  onOpenNewProjectModal,
  onSaveCurrentFile,
  onRunScript,
  onBuildExe,
  onDownloadExe,
  onExportPy,
  onExportPyw,
  onExportZip,
  onCancelTask,
  isTaskRunning,
  hasUnsavedChanges,
  onOpenSettings,
  onToggleTerminal,
  isTerminalOpen,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
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
      {/* Responsive Header Container: min-w-0 & overflow-x-auto ensures buttons NEVER hide outside the window */}
      <div className="w-full px-3 sm:px-4 md:px-5 h-16 flex items-center justify-between gap-3 overflow-x-auto scrollbar-thin">
        
        {/* Left: Branding & Project Selector */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm sm:text-base tracking-tight shadow-sm shrink-0">
              PyW
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-zinc-100">
                  PyW Studio
                </span>
                <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-zinc-300 font-medium block">
                Python Packaging
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800 shrink-0" />

          {/* Project Switcher Dropdown */}
          <div className="relative shrink-0" ref={projectDropdownRef}>
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 hover:border-zinc-600 text-xs sm:text-sm font-semibold text-zinc-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[200px]">
                <span className="text-zinc-100 font-semibold truncate">{currentProject.name}</span>
                <span className="text-zinc-300 text-xs font-mono hidden md:inline">({currentProject.entryScript})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-300 transition-transform duration-200 ${projectMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {projectMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 pb-2 mb-1 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <span>Projects</span>
                  <span className="text-zinc-400 font-mono">{projects.length} available</span>
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
                            ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                            : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCode2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-300' : 'text-zinc-400'}`} />
                          <div className="truncate">
                            <span className="block truncate font-medium">{p.name}</span>
                            <span className="text-xs text-zinc-300 font-mono truncate block">{p.entryScript}</span>
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
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-sky-400 hover:text-sky-300 hover:bg-zinc-800 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
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
        <nav className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                      isActive ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Save, & Export Group */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {isTaskRunning ? (
            <button
              onClick={onCancelTask}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onRunScript}
                title="Run script (F5)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
                <span className="text-[10px] font-mono opacity-90 bg-emerald-700 px-1 py-0.2 rounded hidden sm:inline">F5</span>
              </button>

              <button
                onClick={onBuildExe}
                title="Build Standalone Executable (PyInstaller)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Build</span>
                <span>EXE</span>
              </button>
            </div>
          )}

          <div className="h-6 w-px bg-zinc-800 shrink-0 mx-0.5" />

          {/* Save Button */}
          <button
            onClick={onSaveCurrentFile}
            title="Save current file (Ctrl+S)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
              hasUnsavedChanges
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400 hover:bg-amber-500/30'
                : 'bg-zinc-900 text-zinc-100 hover:text-white hover:bg-zinc-800 border border-zinc-700'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${hasUnsavedChanges ? 'text-amber-400' : 'text-zinc-200'}`} />
            <span>Save</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
            )}
          </button>

          {/* Export Action Buttons (Directly Right to Save Button) */}
          <div className="flex items-center gap-1.5 shrink-0" ref={exportDropdownRef}>
            {/* Desktop Direct Buttons: Exe download, py export, pyw export, project zip */}
            <div className="hidden lg:flex items-center gap-1.5">
              {/* 1. Exe download */}
              <button
                onClick={onDownloadExe}
                title="Download Standalone Executable (.exe)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-sky-950 text-sky-300 hover:text-sky-200 border border-sky-600/70 hover:border-sky-500 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-98"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>EXE</span>
              </button>

              {/* 2. py export to .py */}
              <button
                onClick={onExportPy}
                title="Export current script as standard Python (.py)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-98"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>.py</span>
              </button>

              {/* 3. pyw export to .pyw */}
              <button
                onClick={onExportPyw}
                title="Export current script as windowed Python (.pyw)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-98"
              >
                <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
                <span>.pyw</span>
              </button>

              {/* 4. project export to zip */}
              <button
                onClick={onExportZip}
                title="Export complete project as .zip archive"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-98"
              >
                <Archive className="w-3.5 h-3.5 text-amber-400" />
                <span>ZIP</span>
              </button>
            </div>

            {/* Responsive Export Dropdown: Guarantees access without hiding off screen */}
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                title="All Export Options (EXE, .py, .pyw, ZIP)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span className="lg:hidden">Export</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-300 transition-transform duration-200 ${exportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                  <div className="px-2.5 py-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 mb-1">
                    Export & Download
                  </div>

                  <button
                    onClick={() => {
                      onDownloadExe();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-sky-950/80 border border-sky-600/50 flex items-center justify-center shrink-0">
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-sky-300">Download .exe</span>
                      <span className="text-[11px] text-zinc-400">Standalone Windows executable</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportPy();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-950/80 border border-blue-600/50 flex items-center justify-center shrink-0">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-blue-300">Export to .py</span>
                      <span className="text-[11px] text-zinc-400">Standard Python console script</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportPyw();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-teal-950/80 border border-teal-600/50 flex items-center justify-center shrink-0">
                      <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-teal-300">Export to .pyw</span>
                      <span className="text-[11px] text-zinc-400">Windowed GUI script (no console)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportZip();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group border-t border-zinc-800/80 mt-1 pt-1.5"
                  >
                    <div className="w-7 h-7 rounded-md bg-amber-950/80 border border-amber-600/50 flex items-center justify-center shrink-0">
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-amber-300">Project export to .zip</span>
                      <span className="text-[11px] text-zinc-400">All scripts, requirements & configs</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800 shrink-0 mx-0.5" />

          {/* Quick Utility Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleTerminal}
              title="Toggle Console Terminal"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer border ${
                isTerminalOpen
                  ? 'bg-zinc-800 text-sky-300 border-zinc-600 shadow-xs'
                  : 'text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Console</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Settings & Workspace Preferences"
              className="p-1.5 rounded-lg text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
