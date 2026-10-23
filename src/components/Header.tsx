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
  Plus,
  Wrench,
  FlaskConical,
  Trash2,
  Layers
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
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(target)) {
        setProjectMenuOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(target)) {
        setExportMenuOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isToolsActive = ['environment', 'history', 'tests', 'cleanup'].includes(activeView);
  const getToolLabel = () => {
    switch (activeView) {
      case 'environment': return 'Environments';
      case 'history': return 'History';
      case 'tests': return 'Tests';
      case 'cleanup': return 'Cleanup';
      default: return 'Tools';
    }
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 select-none sticky top-0 z-40">
      {/* Clean, Non-Scrollable Header Container with Grouped Menus */}
      <div className="w-full px-3 sm:px-4 md:px-5 h-14 flex items-center justify-between gap-3 overflow-visible">
        
        {/* Left Zone: Brand Mark & Grouped Project Selector */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo & Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs shrink-0">
              PyW
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-zinc-100">
                PyW Studio
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-zinc-800 shrink-0 hidden sm:block" />

          {/* Grouped Project Switcher */}
          <div className="relative shrink-0" ref={projectDropdownRef}>
            <button
              onClick={() => {
                setProjectMenuOpen(!projectMenuOpen);
                setExportMenuOpen(false);
                setToolsMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 hover:border-zinc-600 text-xs sm:text-sm font-semibold text-zinc-100 transition-colors cursor-pointer"
              title="Switch or create projects"
            >
              <FileCode2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-zinc-100 font-semibold truncate max-w-[110px] sm:max-w-[160px] md:max-w-[200px]">
                {currentProject.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${projectMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {projectMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 pb-2 mb-1 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>Projects</span>
                  <span className="text-zinc-400 font-mono text-[11px]">{projects.length} available</span>
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
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                            : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCode2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-300' : 'text-zinc-400'}`} />
                          <div className="truncate">
                            <span className="block truncate font-medium text-zinc-100">{p.name}</span>
                            <span className="text-[11px] text-zinc-400 font-mono truncate block">{p.entryScript}</span>
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
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs sm:text-sm text-sky-400 hover:text-sky-300 hover:bg-zinc-800 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Zone: Grouped Clean Navigation Tabs (Never overflows) */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shrink-0">
          {/* Editor */}
          <button
            onClick={() => onSelectView('editor')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'editor'
                ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Editor</span>
          </button>

          {/* Packages */}
          <button
            onClick={() => onSelectView('dependencies')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'dependencies'
                ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Packages</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-medium ${
              activeView === 'dependencies' ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {currentProject.installedPackages.length}
            </span>
          </button>

          {/* Build EXE View */}
          <button
            onClick={() => onSelectView('builder')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'builder'
                ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Build EXE</span>
          </button>

          {/* Grouped Secondary Tools Menu */}
          <div className="relative shrink-0" ref={toolsDropdownRef}>
            <button
              onClick={() => {
                setToolsMenuOpen(!toolsMenuOpen);
                setProjectMenuOpen(false);
                setExportMenuOpen(false);
              }}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isToolsActive
                  ? 'bg-zinc-800 text-sky-300 shadow-xs border border-sky-500/40'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
              }`}
              title="More tools (Environments, History, Tests, Cleanup)"
            >
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">
                {isToolsActive ? getToolLabel() : 'Tools'}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${toolsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50">
                <div className="px-2.5 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
                  Workspace Tools
                </div>

                <button
                  onClick={() => {
                    onSelectView('environment');
                    setToolsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeView === 'environment'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <div className="flex-1">
                    <span>Environments</span>
                    <span className="block text-[10px] text-zinc-400 font-normal">Virtualenvs & interpreters</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectView('history');
                    setToolsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeView === 'history'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div className="flex-1">
                    <span>Build History</span>
                    <span className="block text-[10px] text-zinc-400 font-normal">Past EXE releases & logs</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectView('tests');
                    setToolsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeView === 'tests'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <span>Test Suite</span>
                    <span className="block text-[10px] text-zinc-400 font-normal">Unit test & syntax runner</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectView('cleanup');
                    setToolsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeView === 'cleanup'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div className="flex-1">
                    <span>Build Cleanup</span>
                    <span className="block text-[10px] text-zinc-400 font-normal">Clear dist, build & __pycache__</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Zone: Clean Grouped Actions (Save, Run, Export Dropdown, Console, Settings) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Run or Cancel Control */}
          {isTaskRunning ? (
            <button
              onClick={onCancelTask}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
              title="Cancel current running operation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              onClick={onRunScript}
              title="Run script (F5)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
              <span className="text-[10px] font-mono opacity-80 hidden md:inline">F5</span>
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={onSaveCurrentFile}
            title="Save current file (Ctrl+S)"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
              hasUnsavedChanges
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400 hover:bg-amber-500/30'
                : 'bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 border border-zinc-700'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${hasUnsavedChanges ? 'text-amber-400' : 'text-zinc-300'}`} />
            <span>Save</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
            )}
          </button>

          {/* Grouped Export & Build Menu */}
          <div className="relative shrink-0" ref={exportDropdownRef}>
            <button
              onClick={() => {
                setExportMenuOpen(!exportMenuOpen);
                setProjectMenuOpen(false);
                setToolsMenuOpen(false);
              }}
              title="Build & Export Menu (.exe, .py, .pyw, .zip)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export</span>
              <ChevronDown className={`w-3.5 h-3.5 text-sky-200 transition-transform duration-150 ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2.5 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
                  Build & Export Options
                </div>

                {/* Section 1: Build Executable */}
                <button
                  onClick={() => {
                    onBuildExe();
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-md bg-sky-950 border border-sky-600/50 flex items-center justify-center shrink-0">
                    <Hammer className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div>
                    <span className="font-bold block text-zinc-100 group-hover:text-sky-300">Build Executable</span>
                    <span className="text-[11px] text-zinc-400">Compile via PyInstaller</span>
                  </div>
                </button>

                {/* Section 2: Direct Binary / Scripts */}
                <div className="border-t border-zinc-800/80 my-1 pt-1">
                  <button
                    onClick={() => {
                      onDownloadExe();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-sky-950 border border-sky-600/50 flex items-center justify-center shrink-0">
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-sky-300">Download .exe</span>
                      <span className="text-[11px] text-zinc-400">Standalone Windows binary</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportPy();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-950 border border-blue-600/50 flex items-center justify-center shrink-0">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-blue-300">Export .py</span>
                      <span className="text-[11px] text-zinc-400">Standard console script</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportPyw();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-teal-950 border border-teal-600/50 flex items-center justify-center shrink-0">
                      <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-teal-300">Export .pyw</span>
                      <span className="text-[11px] text-zinc-400">Windowed GUI (no console)</span>
                    </div>
                  </button>
                </div>

                {/* Section 3: Project Archive */}
                <div className="border-t border-zinc-800/80 my-1 pt-1">
                  <button
                    onClick={() => {
                      onExportZip();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-amber-950 border border-amber-600/50 flex items-center justify-center shrink-0">
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-100 group-hover:text-amber-300">Export Project (.zip)</span>
                      <span className="text-[11px] text-zinc-400">All scripts, requirements & configs</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-zinc-800 shrink-0 mx-0.5" />

          {/* Grouped Workspace Utilities */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleTerminal}
              title={isTerminalOpen ? "Hide Console" : "Show Console"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer border ${
                isTerminalOpen
                  ? 'bg-zinc-800 text-sky-300 border-zinc-600 shadow-xs'
                  : 'text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">Console</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Settings & Preferences"
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
