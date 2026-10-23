import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  ArrowUpCircle, 
  FileDown, 
  FileUp, 
  Search, 
  CheckCircle2
} from 'lucide-react';
import { Project } from '../types';

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
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header & Isolation Notice */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <Package className="w-6 h-6 text-sky-400" />
              Python Package Dependencies
            </h2>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Virtual environment packages isolated in{' '}
              <code className="text-zinc-200 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {project.environmentId}
              </code>
              . System Python remains untouched.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSyncWithRequirements}
              title="Install packages from requirements.txt"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-sm font-medium border border-zinc-700/80 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-sky-400" />
              <span>Sync requirements.txt</span>
            </button>
            <button
              onClick={onExportToRequirements}
              title="Export pinned packages to requirements.txt"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-sm font-medium border border-zinc-700/80 transition-colors cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-emerald-400" />
              <span>Export requirements.txt</span>
            </button>
          </div>
        </div>

        {/* Install Input Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <span className="text-sm font-semibold text-zinc-200 block">
            Install Package (pip install)
          </span>
          <form onSubmit={handleInstallSubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. requests, Pillow>=10.0, ttkbootstrap, pyinstaller"
              value={newPackageInput}
              onChange={(e) => setNewPackageInput(e.target.value)}
              disabled={isInstalling}
              className="flex-1 h-11 bg-zinc-950 border border-zinc-700 rounded-lg px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={isInstalling || !newPackageInput.trim()}
              className="flex items-center gap-2 px-5 h-11 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isInstalling ? 'Installing...' : 'Install'}</span>
            </button>
          </form>

          {/* Quick recommendations */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400 pt-1">
            <span className="text-zinc-400 font-medium">Suggested:</span>
            {QUICK_INSTALLS.map((pkg) => (
              <button
                key={pkg}
                type="button"
                onClick={() => onInstallPackage(pkg)}
                className="px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-sky-300 border border-zinc-800 font-mono text-xs transition-colors cursor-pointer"
              >
                + {pkg}
              </button>
            ))}
          </div>
        </div>

        {/* Package Search & Stats Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>
              Installed Packages: <strong className="text-zinc-200">{project.installedPackages.length}</strong>
            </span>
            <span>•</span>
            <span>
              Total Size:{' '}
              <strong className="text-zinc-200">
                {project.installedPackages.reduce((acc, p) => acc + parseFloat(p.size), 0).toFixed(1)} MB
              </strong>
            </span>
          </div>
        </div>

        {/* Installed Packages Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Package</th>
                <th className="px-5 py-3.5 font-semibold">Version</th>
                <th className="px-5 py-3.5 font-semibold">License</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Size</th>
                <th className="px-5 py-3.5 font-semibold">Description</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-zinc-500 text-sm">
                    No packages match your search filter.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  const hasUpdate = pkg.latestVersion && pkg.latestVersion !== pkg.version;
                  return (
                    <tr key={pkg.name} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-zinc-100 flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-mono text-zinc-100">{pkg.name}</span>
                      </td>

                      <td className="px-5 py-4 font-mono text-zinc-300">
                        {pkg.version}
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {pkg.license || 'MIT'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {hasUpdate ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            {pkg.latestVersion} available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Up to date
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-zinc-400">{pkg.size}</td>

                      <td className="px-5 py-4 text-zinc-400 max-w-xs truncate" title={pkg.description}>
                        {pkg.description}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasUpdate && (
                            <button
                              onClick={() => onUpgradePackage(pkg.name)}
                              title="Upgrade to latest version"
                              className="p-1.5 rounded-md text-amber-400 hover:bg-zinc-800 hover:text-amber-300 transition-colors cursor-pointer"
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
                            title="Uninstall package"
                            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 transition-colors cursor-pointer"
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
