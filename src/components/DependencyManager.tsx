import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  ArrowUpCircle, 
  RefreshCw, 
  FileDown, 
  FileUp, 
  Search, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Project, InstalledPackage } from '../types';

interface DependencyManagerProps {
  project: Project;
  onInstallPackage: (pkgString: string) => void;
  onUninstallPackage: (pkgName: string) => void;
  onUpgradePackage: (pkgName: string) => void;
  onSyncWithRequirements: () => void;
  onExportToRequirements: () => void;
  isInstalling: boolean;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({
  project,
  onInstallPackage,
  onUninstallPackage,
  onUpgradePackage,
  onSyncWithRequirements,
  onExportToRequirements,
  isInstalling,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPackageInput, setNewPackageInput] = useState('');

  const filteredPackages = project.installedPackages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInstallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackageInput.trim()) return;
    onInstallPackage(newPackageInput.trim());
    setNewPackageInput('');
  };

  const QUICK_INSTALLS = [
    'requests>=2.31.0',
    'Pillow>=10.2.0',
    'ttkbootstrap>=1.10.1',
    'pyinstaller>=6.5.0',
    'psutil>=5.9.8',
    'fastapi',
    'pydantic>=2.0.0',
    'cryptography',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header & Isolation Notice */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-400" />
              Dependency & Pip Package Manager
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Project packages are isolated in virtual environment{' '}
              <code className="text-sky-300 font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                {project.environmentId}
              </code>
              . Global Python is never modified.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSyncWithRequirements}
              title="Install packages from requirements.txt"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400" />
              <span>Sync from requirements.txt</span>
            </button>
            <button
              onClick={onExportToRequirements}
              title="Export pinned packages to requirements.txt"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <FileUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export to requirements.txt</span>
            </button>
          </div>
        </div>

        {/* Install Input Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Install New Package (pip install)
          </span>
          <form onSubmit={handleInstallSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. requests, Pillow>=10.0, ttkbootstrap, pyinstaller"
              value={newPackageInput}
              onChange={(e) => setNewPackageInput(e.target.value)}
              disabled={isInstalling}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={isInstalling || !newPackageInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isInstalling ? 'Installing...' : 'Install Package'}</span>
            </button>
          </form>

          {/* Quick recommendations */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 pt-1">
            <span className="text-slate-500">Popular packages:</span>
            {QUICK_INSTALLS.map((pkg) => (
              <button
                key={pkg}
                type="button"
                onClick={() => onInstallPackage(pkg)}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-sky-300 border border-slate-700/50 font-mono transition-colors"
              >
                + {pkg}
              </button>
            ))}
          </div>
        </div>

        {/* Package Search & Stats Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search installed packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Total Packages: <strong className="text-slate-200">{project.installedPackages.length}</strong>
            </span>
            <span>•</span>
            <span>
              Virtual Env Size:{' '}
              <strong className="text-slate-200">
                {project.installedPackages.reduce((acc, p) => acc + parseFloat(p.size), 0).toFixed(1)} MB
              </strong>
            </span>
          </div>
        </div>

        {/* Installed Packages Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Package</th>
                <th className="px-4 py-3 font-semibold">Installed Version</th>
                <th className="px-4 py-3 font-semibold">License</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No packages match your search filter.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  const hasUpdate = pkg.latestVersion && pkg.latestVersion !== pkg.version;
                  return (
                    <tr key={pkg.name} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-200 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="font-mono text-slate-100">{pkg.name}</span>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-300">
                        {pkg.version}
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {pkg.license || 'MIT'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {hasUpdate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <ArrowUpCircle className="w-3 h-3" />
                            {pkg.latestVersion} available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Up to date
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-400">{pkg.size}</td>

                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={pkg.description}>
                        {pkg.description}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasUpdate && (
                            <button
                              onClick={() => onUpgradePackage(pkg.name)}
                              title="Upgrade to latest version"
                              className="p-1 rounded text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition-colors cursor-pointer"
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Uninstall package "${pkg.name}" from ${project.environmentId}?`)) {
                                onUninstallPackage(pkg.name);
                              }
                            }}
                            title="Uninstall package (pip uninstall)"
                            className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
