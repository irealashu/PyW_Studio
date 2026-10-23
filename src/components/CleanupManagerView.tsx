import React, { useState } from 'react';
import { 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  HardDrive, 
  RefreshCw, 
  FolderX, 
  CheckCircle2, 
  FileWarning, 
  AlertTriangle 
} from 'lucide-react';

interface CleanupItem {
  id: string;
  name: string;
  category: 'build_temp' | 'pip_cache' | 'logs' | 'stale_staging';
  path: string;
  sizeMb: number;
  description: string;
  selected: boolean;
}

export const CleanupManagerView: React.FC = () => {
  const [items, setItems] = useState<CleanupItem[]>([
    {
      id: 'clean-1',
      name: 'PyInstaller Work Directory Cache',
      category: 'build_temp',
      path: '%LOCALAPPDATA%\\PyWStudio\\staging\\work_pyinstaller',
      sizeMb: 148.4,
      description: 'Intermediate C-extension object files and bootloader staging caches from prior packaging runs.',
      selected: true,
    },
    {
      id: 'clean-2',
      name: 'Pip Wheel & Package Download Cache',
      category: 'pip_cache',
      path: '%LOCALAPPDATA%\\PyWStudio\\cache\\pip_wheels',
      sizeMb: 86.2,
      description: 'Cached wheel archives downloaded during dependency installations. Safe to purge.',
      selected: true,
    },
    {
      id: 'clean-3',
      name: 'Old PyInstaller Build & Process Logs',
      category: 'logs',
      path: '%LOCALAPPDATA%\\PyWStudio\\logs\\archived',
      sizeMb: 12.8,
      description: 'Diagnostic output and subprocess stdout dumps older than 7 days.',
      selected: false,
    },
    {
      id: 'clean-4',
      name: 'Ephemeral Build Virtual Environments',
      category: 'stale_staging',
      path: '%LOCALAPPDATA%\\PyWStudio\\environments\\temp_build_staging',
      sizeMb: 64.0,
      description: 'Temporary virtual environments created for one-off clean builds that are no longer active.',
      selected: true,
    },
  ]);

  const [cleaning, setCleaning] = useState(false);
  const [cleanReport, setCleanReport] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectedTotalMb = items
    .filter((i) => i.selected)
    .reduce((acc, i) => acc + i.sizeMb, 0)
    .toFixed(1);

  const handleRunCleanup = () => {
    const targets = items.filter((i) => i.selected);
    if (targets.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to clean ${selectedTotalMb} MB of temporary PyW Studio files?\n\nNote: Source code, .pyw files, and project configs are 100% safe and will NEVER be touched.`
      )
    ) {
      return;
    }

    setCleaning(true);
    setTimeout(() => {
      setCleaning(false);
      setCleanReport(`Successfully purged ${selectedTotalMb} MB of managed temporary caches.`);
      setItems((prev) => prev.map((item) => (item.selected ? { ...item, sizeMb: 0 } : item)));
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-sky-400" />
            Managed Workspace & PyInstaller Cache Cleaner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Safely reclaim disk space by purging temporary PyInstaller build staging, pip caches, and stale temporary environments.
          </p>
        </div>

        {/* Safety Constitution Banner */}
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-emerald-300">PyW Studio Safety Guarantee (Non-Negotiable)</span>
            <p className="text-slate-300 leading-relaxed">
              Cleanup targets are strictly isolated to <code className="text-emerald-300 font-mono">%LOCALAPPDATA%\PyWStudio</code> managed folders. The cleanup manager <strong>NEVER</strong> modifies or deletes user source files (<code className="text-emerald-300 font-mono">.pyw</code>, <code className="text-emerald-300 font-mono">.py</code>), user-owned spec files, assets, or project configurations.
            </p>
          </div>
        </div>

        {cleanReport && (
          <div className="bg-sky-950/40 border border-sky-500/40 rounded-xl p-4 flex items-center justify-between text-xs text-sky-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>{cleanReport}</span>
            </div>
            <button
              onClick={() => setCleanReport(null)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Cleanup Selection List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Reclaimable Cache Categories</h3>
              <span className="text-[11px] text-slate-400">
                Selected for cleanup: <strong className="text-sky-300">{selectedTotalMb} MB</strong>
              </span>
            </div>

            <button
              onClick={handleRunCleanup}
              disabled={cleaning || parseFloat(selectedTotalMb) === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{cleaning ? 'Purging Staging...' : `Clean ${selectedTotalMb} MB Safe Files`}</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                  item.selected
                    ? 'bg-slate-950/80 border-sky-500/60'
                    : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-1 rounded border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{item.path}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {item.sizeMb.toFixed(1)} MB
                  </span>
                  <span className="text-[9px] block text-emerald-400">Safe to clean</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
