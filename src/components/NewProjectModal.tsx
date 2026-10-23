import React, { useState } from 'react';
import { X, FolderPlus, Sparkles, CheckCircle2, FileCode2, Gamepad2, Wrench, Calculator, FileText } from 'lucide-react';
import { Project } from '../types';

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">Create New Python Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Project Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. ImageOptimizer, RetroArcade"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Brief summary of what this application does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Starter Template
            </label>
            <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
              <div
                onClick={() => setSelectedTemplate('calculator')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === 'calculator'
                    ? 'bg-sky-950/40 border-sky-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-100">
                      Modern Tkinter / ttk Desktop Utility
                    </span>
                  </div>
                  {selectedTemplate === 'calculator' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  Full standalone GUI template with ttk widgets, event bindings, math engine, and unit tests.
                </p>
              </div>

              <div
                onClick={() => setSelectedTemplate('arcade')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === 'arcade'
                    ? 'bg-sky-950/40 border-sky-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-100">
                      Retro 2D Breakout Arcade Game
                    </span>
                  </div>
                  {selectedTemplate === 'arcade' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  Playable 2D Tkinter Canvas game with paddle movement, brick collision, game loop, and score tracking.
                </p>
              </div>

              <div
                onClick={() => setSelectedTemplate('cleaner')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === 'cleaner'
                    ? 'bg-sky-950/40 border-sky-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-100">
                      Multi-Threaded System Utility
                    </span>
                  </div>
                  {selectedTemplate === 'cleaner' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  Tkinter treeview, progressbar, threading, and system file manipulation.
                </p>
              </div>

              <div
                onClick={() => setSelectedTemplate('blank')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === 'blank'
                    ? 'bg-sky-950/40 border-sky-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-100">
                      Minimal Python Script (.pyw)
                    </span>
                  </div>
                  {selectedTemplate === 'blank' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  Clean starter with entry script, pywstudio.json metadata, and requirements.txt.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
