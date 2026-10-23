import React, { useState } from 'react';
import { 
  FileCode2, 
  FileText, 
  FolderTree, 
  Plus, 
  Trash2, 
  Download, 
  FileCheck, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  Settings2,
  FilePlus2,
  RefreshCw
} from 'lucide-react';
import { Project, ProjectFile } from '../types';

interface ProjectExplorerProps {
  project: Project;
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (name: string, content?: string) => void;
  onDeleteFile: (path: string) => void;
  onSetEntryScript: (path: string) => void;
  onExportProject: () => void;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  project,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onSetEntryScript,
  onExportProject,
}) => {
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim();
    onCreateFile(cleanName);
    setNewFileName('');
    setIsAddingFile(false);
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.language === 'python') {
      return <FileCode2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
    if (file.language === 'json') {
      return <Settings2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none shrink-0">
      {/* Explorer Header */}
      <div className="h-10 px-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <FolderTree className="w-4 h-4 text-sky-400" />
          <span>Files</span>
          <span className="text-[10px] text-slate-500 font-mono">({Object.keys(project.files).length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAddingFile(true)}
            title="Create new file"
            className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onExportProject}
            title="Export & download project files"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New file input form */}
      {isAddingFile && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-slate-800 bg-slate-800/50">
          <input
            type="text"
            autoFocus
            placeholder="e.g. utils.py, dialog.pyw"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full text-xs px-2 py-1 bg-slate-900 border border-sky-500 rounded text-slate-100 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <button
              type="button"
              onClick={() => setIsAddingFile(false)}
              className="text-[10px] px-2 py-0.5 rounded text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[10px] px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-1">
        {Object.values(project.files).map((file) => {
          const isActive = file.path === activeFilePath;
          const isEntry = file.path === project.entryScript;

          return (
            <div
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className={`group flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer border-l-2 transition-all ${
                isActive
                  ? 'bg-sky-500/10 text-sky-300 border-sky-400 font-medium'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(file)}
                <span className="truncate">{file.name}</span>
                {file.isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEntry ? (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-sky-900/80 text-sky-300 border border-sky-700/60 font-mono">
                    entry
                  </span>
                ) : file.path.endsWith('.py') || file.path.endsWith('.pyw') ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetEntryScript(file.path);
                    }}
                    title="Set as PyInstaller entry script"
                    className="p-1 text-slate-500 hover:text-sky-300 rounded hover:bg-slate-700/50"
                  >
                    <FileCheck className="w-3 h-3" />
                  </button>
                ) : null}

                {/* Don't allow deleting entry script if only 1 exists */}
                {!isEntry && Object.keys(project.files).length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${file.name}? This action cannot be undone.`)) {
                        onDeleteFile(file.path);
                      }
                    }}
                    title="Delete file"
                    className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-700/50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Directory Structure Helper Note */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/30">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>Windows .pyw Format</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Files with <code className="text-sky-300 font-mono">.pyw</code> launch via pythonw.exe without displaying an unwanted black console window.
        </p>
      </div>
    </aside>
  );
};
