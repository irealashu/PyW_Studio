import React, { useState } from 'react';
import { 
  FileCode2, 
  FileText, 
  FolderTree, 
  Plus, 
  Trash2, 
  Download, 
  FileCheck, 
  Settings2,
  Info
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
      return <FileCode2 className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (file.language === 'json') {
      return <Settings2 className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-zinc-300 shrink-0" />;
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full text-zinc-100 select-none shrink-0">
      {/* Explorer Header with High Contrast */}
      <div className="h-12 px-4 border-b border-zinc-800 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-bold text-zinc-100">
          <FolderTree className="w-4 h-4 text-sky-400" />
          <span>Files</span>
          <span className="text-xs text-zinc-300 font-mono font-semibold">({Object.keys(project.files).length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAddingFile(true)}
            title="Create new file"
            className="p-1.5 rounded-md text-zinc-200 hover:text-sky-300 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-700/60"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onExportProject}
            title="Export & download project files (.zip)"
            className="p-1.5 rounded-md text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-700/60"
          >
            <Download className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* New file input form */}
      {isAddingFile && (
        <form onSubmit={handleCreateSubmit} className="p-3 border-b border-zinc-700 bg-zinc-900">
          <input
            type="text"
            autoFocus
            placeholder="e.g. main.pyw, config.py"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full text-xs sm:text-sm px-3 py-1.5 bg-zinc-950 border border-sky-500 rounded-md text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsAddingFile(false)}
              className="text-xs px-2.5 py-1 rounded text-zinc-300 hover:text-white cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {Object.values(project.files).map((file) => {
          const isActive = file.path === activeFilePath;
          const isEntry = file.path === project.entryScript;

          return (
            <div
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-sky-300 font-bold border border-zinc-700'
                  : 'text-zinc-200 hover:bg-zinc-900 hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {getFileIcon(file)}
                <span className="truncate">{file.name}</span>
                {file.isModified && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {isEntry ? (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono font-semibold">
                    entry
                  </span>
                ) : file.path.endsWith('.py') || file.path.endsWith('.pyw') ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetEntryScript(file.path);
                    }}
                    title="Set as PyInstaller entry script"
                    className="p-1 text-zinc-400 hover:text-sky-300 rounded hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
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
                    className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Directory Structure Helper Note with High Text Contrast */}
      <div className="p-3.5 border-t border-zinc-800 text-xs text-zinc-200 bg-zinc-900/60">
        <div className="flex items-center gap-1.5 text-zinc-100 font-bold mb-1">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Windowed Python (.pyw)</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-normal">
          <code className="text-zinc-100 font-mono font-bold bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">.pyw</code> scripts run using pythonw.exe without displaying an empty console window.
        </p>
      </div>
    </aside>
  );
};
