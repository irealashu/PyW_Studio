import React, { useState } from 'react';
import { X, FolderPlus, CheckCircle2, FileText, Calculator } from 'lucide-react';

interface NewProjectModalProps {
  onClose: () => void;
  onCreateProject: (
    name: string,
    description: string,
    template: 'calculator' | 'arcade' | 'cleaner' | 'blank'
  ) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'calculator' | 'arcade' | 'cleaner' | 'blank'>(
    'calculator'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject(name.trim(), description.trim(), selectedTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-zinc-100">Create New Python Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. DesktopApp, ImageOptimizer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Brief summary of what this application does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-2.5">
              Starter Template
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto pr-1">
              <div
                onClick={() => setSelectedTemplate('calculator')}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedTemplate === 'calculator'
                    ? 'bg-zinc-800 border-sky-500'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-semibold text-zinc-100">
                      Desktop Utility Application
                    </span>
                  </div>
                  {selectedTemplate === 'calculator' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 pl-6">
                  Clean Tkinter desktop utility with interactive event handlers and pyinstaller build profile.
                </p>
              </div>

              <div
                onClick={() => setSelectedTemplate('blank')}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedTemplate === 'blank'
                    ? 'bg-zinc-800 border-sky-500'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-semibold text-zinc-100">
                      Minimal Script (.pyw)
                    </span>
                  </div>
                  {selectedTemplate === 'blank' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 pl-6">
                  Clean single entry file with requirements and packaging profile.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
