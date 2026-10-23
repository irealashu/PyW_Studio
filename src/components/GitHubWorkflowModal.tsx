import React, { useState } from 'react';
import { X, GitBranch, Copy, Check, FilePlus2, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface GitHubWorkflowModalProps {
  project: Project;
  onClose: () => void;
  onAddWorkflowToProject: (yamlContent: string) => void;
}

export const GitHubWorkflowModal: React.FC<GitHubWorkflowModalProps> = ({
  project,
  onClose,
  onAddWorkflowToProject,
}) => {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const activeProfile =
    project.buildProfiles.find((p) => p.id === project.activeProfileId) || project.buildProfiles[0];

  const workflowYaml = `# PyW Studio GitHub Actions Automated PyInstaller Release
name: Build & Package Windows Executable

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-windows-exe:
    runs-on: windows-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pyinstaller==6.5.0

      - name: Compile Windows Executable
        run: |
          pyinstaller ${activeProfile.mode === 'onefile' ? '--onefile' : '--onedir'} \\
                      ${activeProfile.console ? '--console' : '--windowed'} \\
                      --name="${activeProfile.outputName.replace('.exe', '')}" \\
                      --clean \\
                      "${project.entryScript}"

      - name: Upload Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${activeProfile.outputName}
          path: dist/${activeProfile.outputName}

      - name: Publish GitHub Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          files: dist/${activeProfile.outputName}
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFile = () => {
    onAddWorkflowToProject(workflowYaml);
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">
              GitHub Actions Automated CI/CD Release Workflow
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300">
          <p className="text-slate-400 leading-relaxed">
            Automatically compile <code className="text-sky-300 font-mono">{activeProfile.outputName}</code> on Windows runners and attach the verified executable to your GitHub Releases whenever you push a Git tag (e.g. <code className="text-emerald-400 font-mono">v1.0.0</code>).
          </p>

          <div className="relative">
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-72 leading-relaxed">
              {workflowYaml}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy YAML'}</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            File path: .github/workflows/build-exe.yml
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFile}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {added ? <Check className="w-3.5 h-3.5 text-white" /> : <FilePlus2 className="w-3.5 h-3.5" />}
              <span>{added ? 'Added to Project!' : 'Add to Project Files'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
