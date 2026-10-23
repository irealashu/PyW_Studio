import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  ArrowUpCircle, 
  FileDown, 
  FileUp, 
  Search, 
  CheckCircle2,
  RefreshCw,
  Terminal,
  AlertCircle,
  Filter
} from 'lucide-react';
import { Project } from '../types';
import { isVersionNewer } from '../services/pypiService';

interface DependencyManagerProps {
  project: Project;
  onInstallPackage: (pkgString: string) => void;
  onUninstallPackage: (pkgName: string) => void;
  onUpgradePackage: (pkgName: string) => void;
  onCheckUpdates: () => void;
  onUpgradeAll: () => void;
  onSyncWithRequirements: () => void;
  onExportToRequirements: () => void;
  onRunTerminalCommand?: (cmd: string) => void;
  isInstalling: boolean;
  isCheckingUpdates?: boolean;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({
  project,
  onInstallPackage,
  onUninstallPackage,
  onUpgradePackage,
  onCheckUpdates,
  onUpgradeAll,
  onSyncWithRequirements,
  onExportToRequirements,
  onRunTerminalCommand,
  isInstalling,
  isCheckingUpdates = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPackageInput, setNewPackageInput] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'outdated' | 'uptodate'>('all');

  const outdatedPackages = project.installedPackages.filter((pkg) =>
    pkg.latestVersion ? isVersionNewer(pkg.version, pkg.latestVersion) : false
  );

  const filteredPackages = project.installedPackages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const hasUpdate = pkg.latestVersion ? isVersionNewer(pkg.version, pkg.latestVersion) : false;
    if (filterMode === 'outdated') return hasUpdate;
    if (filterMode === 'uptodate') return !hasUpdate;
    return true;
  });

  const handleInstallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackageInput.trim()) return;
    onInstallPackage(newPackageInput.trim());
    setNewPackageInput('');
  };

  const QUICK_INSTALLS = [
    'requests>=2.32.3',
    'Pillow>=11.0.0',
    'ttkbootstrap>=1.10.1',
    'pyinstaller>=6.11.1',
    'psutil>=6.1.0',
  ];

  const QUICK_CLI_COMMANDS = [
    { label: 'pip list --outdated', cmd: 'pip list --outdated' },
    { label: 'pip update', cmd: 'pip update' },
    { label: 'pip upgrade', cmd: 'pip upgrade' },
    { label: 'pip update && pip upgrade', cmd: 'pip update && pip upgrade' },
  ];

  const totalSizeMb = project.installedPackages
    .reduce((acc, p) => acc + (parseFloat(p.size) || 0), 0)
    .toFixed(1);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto p-6 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header & Actions Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <Package className="w-6 h-6 text-sky-400" />
              Python Package Dependencies
            </h2>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Environment packages isolated in{' '}
              <code className="text-zinc-200 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {project.environmentId}
              </code>
              . System Python remains untouched.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Manual Click: Check for Updates */}
            <button
              onClick={onCheckUpdates}
              disabled={isCheckingUpdates || isInstalling}
              title="Query PyPI index for package updates (pip list --outdated)"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-zinc-200 text-sm font-medium border border-zinc-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdates ? 'Checking PyPI...' : 'Check Updates'}</span>
            </button>

            {/* Manual Click: Upgrade All Packages */}
            <button
              onClick={onUpgradeAll}
              disabled={isInstalling || isCheckingUpdates || outdatedPackages.length === 0}
              title="Upgrade all outdated packages to their latest version (pip upgrade --all)"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                outdatedPackages.length > 0
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 cursor-not-allowed opacity-60'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 text-white" />
              <span>
                {outdatedPackages.length > 0
                  ? `Upgrade All (${outdatedPackages.length})`
                  : 'Upgrade All'}
              </span>
            </button>

            <button
              onClick={onSyncWithRequirements}
              title="Install packages from requirements.txt"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-sm font-medium border border-zinc-800 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-sky-400" />
              <span>Sync</span>
            </button>

            <button
              onClick={onExportToRequirements}
              title="Export pinned packages to requirements.txt"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-sm font-medium border border-zinc-800 transition-colors cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-emerald-400" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Update Notification Banner (if any updates available) */}
        {outdatedPackages.length > 0 && (
          <div className="bg-sky-950/40 border border-sky-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-sky-200">
                  {outdatedPackages.length} package update{outdatedPackages.length > 1 ? 's' : ''} available on PyPI
                </div>
                <div className="text-xs text-sky-300/80 mt-0.5 font-mono">
                  Packages: {outdatedPackages.map((p) => `${p.name} (${p.version} → ${p.latestVersion})`).join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onUpgradeAll}
                disabled={isInstalling}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Upgrade All Now (pip upgrade)</span>
              </button>
            </div>
          </div>
        )}

        {/* Install Input Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200 block">
              Package Installer & Command Runner
            </span>
            <span className="text-xs text-zinc-400">
              Virtual Environment pip 24.0
            </span>
          </div>

          <form onSubmit={handleInstallSubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. requests, Pillow>=11.0, ttkbootstrap, pyinstaller"
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

          {/* Quick recommendations & Quick CLI triggers */}
          <div className="space-y-2 pt-1 border-t border-zinc-800/60">
            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
              <span className="text-zinc-400 font-medium">Quick Install:</span>
              {QUICK_INSTALLS.map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => onInstallPackage(pkg)}
                  disabled={isInstalling}
                  className="px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-sky-300 border border-zinc-800 font-mono text-xs transition-colors cursor-pointer"
                >
                  + {pkg}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
              <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Pip CLI shortcuts:
              </span>
              {QUICK_CLI_COMMANDS.map((item) => (
                <button
                  key={item.cmd}
                  type="button"
                  onClick={() => onRunTerminalCommand?.(item.cmd)}
                  disabled={isInstalling}
                  className="px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-sky-300 hover:text-sky-200 border border-sky-900/50 hover:border-sky-700 font-mono text-xs transition-colors cursor-pointer"
                  title={`Run '${item.cmd}' in the interactive terminal`}
                >
                  $ {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Package Search, Filter Chips & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Search packages by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({project.installedPackages.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('outdated')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'outdated'
                    ? 'bg-zinc-800 text-amber-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Outdated</span>
                {outdatedPackages.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px]">
                    {outdatedPackages.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('uptodate')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  filterMode === 'uptodate'
                    ? 'bg-zinc-800 text-emerald-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Up to date
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-400 shrink-0">
            <span>
              Installed: <strong className="text-zinc-200">{project.installedPackages.length}</strong>
            </span>
            <span>•</span>
            <span>
              Total Size: <strong className="text-zinc-200">{totalSizeMb} MB</strong>
            </span>
          </div>
        </div>

        {/* Installed Packages Table */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950 border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-200">
              <tr>
                <th className="px-5 py-3.5 font-bold">Package</th>
                <th className="px-5 py-3.5 font-bold">Installed Version</th>
                <th className="px-5 py-3.5 font-bold">Latest Release</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold">Size</th>
                <th className="px-5 py-3.5 font-bold">Description</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500 text-sm">
                    {filterMode === 'outdated'
                      ? 'No outdated packages found! All installed packages are up to date.'
                      : 'No packages match your search filter.'}
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  const hasUpdate = pkg.latestVersion ? isVersionNewer(pkg.version, pkg.latestVersion) : false;
                  return (
                    <tr key={pkg.name} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-zinc-100 flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-mono text-zinc-100 font-medium">{pkg.name}</span>
                      </td>

                      <td className="px-5 py-4 font-mono text-zinc-300">
                        {pkg.version}
                      </td>

                      <td className="px-5 py-4 font-mono text-zinc-300">
                        {pkg.latestVersion ? (
                          <span className={hasUpdate ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>
                            {pkg.latestVersion}
                          </span>
                        ) : (
                          <span className="text-zinc-500">Checking...</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {hasUpdate ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            Update available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
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
                          {/* Manual Click: Upgrade specific package */}
                          {hasUpdate ? (
                            <button
                              onClick={() => onUpgradePackage(pkg.name)}
                              disabled={isInstalling}
                              title={`Run pip install --upgrade ${pkg.name} to update to ${pkg.latestVersion}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-medium transition-colors cursor-pointer"
                            >
                              <ArrowUpCircle className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpgradePackage(pkg.name)}
                              disabled={isInstalling}
                              title={`Force re-install or check update for ${pkg.name}`}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
                            >
                              Recheck
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Uninstall package "${pkg.name}" from ${project.environmentId}?`)) {
                                onUninstallPackage(pkg.name);
                              }
                            }}
                            disabled={isInstalling}
                            title="Uninstall package (pip uninstall)"
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
