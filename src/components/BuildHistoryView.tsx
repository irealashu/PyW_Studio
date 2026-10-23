import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BuildHistoryRecord } from '../types';

interface BuildHistoryViewProps {
  history: BuildHistoryRecord[];
  onClearHistory: () => void;
  onDownloadArtifact: (record: BuildHistoryRecord) => void;
}

export const BuildHistoryView: React.FC<BuildHistoryViewProps> = ({
  history,
  onClearHistory,
  onDownloadArtifact,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const selectedRecord = history.find((h) => h.id === selectedRecordId);

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" />
              Build History & Verified Artifact Reports
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Audit log of previous PyInstaller packaging runs, verified PE32+ executable outputs, bundle sizes, and SHA256 checksums.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear build history records? Generated artifacts on disk are preserved.')) {
                  onClearHistory();
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Executables Packaged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Go to the PyInstaller EXE Builder tab and run a build to generate verified Windows desktop executables and inspection reports.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* History List */}
            <div className="space-y-3 lg:col-span-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Packaging Records ({history.length})
              </span>
              <div className="space-y-2">
                {history.map((record) => {
                  const isSelected = record.id === selectedRecordId;
                  const isSuccess = record.status === 'success';

                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedRecordId(record.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-sky-500 shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          {isSuccess ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {record.artifactName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {record.durationSeconds}s
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span className="truncate">{record.profileName}</span>
                        <span className="font-mono text-sky-400 text-[10px]">{record.artifactSize}</span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {record.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Record Detail & Logs */}
            <div className="lg:col-span-2">
              {selectedRecord ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">
                          {selectedRecord.artifactName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Verified PE32+ Artifact
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Built for project <strong className="text-slate-200">{selectedRecord.projectName}</strong> using profile <strong className="text-slate-200">{selectedRecord.profileName}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => onDownloadArtifact(selectedRecord)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Executable</span>
                    </button>
                  </div>

                  {/* Metadata Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Artifact Size</span>
                      <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">
                        {selectedRecord.artifactSize}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Packaging Mode</span>
                      <span className="text-xs font-mono text-sky-400 mt-0.5 block capitalize">
                        {selectedRecord.mode === 'onefile' ? 'One-File (--onefile)' : 'One-Folder (--onedir)'}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">PyInstaller</span>
                      <span className="text-xs font-mono text-emerald-400 mt-0.5 block">
                        v{selectedRecord.pyinstallerVersion}
                      </span>
                    </div>
                  </div>

                  {/* SHA256 Checksum Bar */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">SHA-256 Checksum (Integrity Verification):</span>
                      <button
                        onClick={() => handleCopySha(selectedRecord.sha256)}
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-[10px]"
                      >
                        {copiedSha === selectedRecord.sha256 ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Hash</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 break-all block">
                      {selectedRecord.sha256}
                    </code>
                  </div>

                  {/* Build Process Logs */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      PyInstaller Execution Output Log
                    </span>
                    <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-64 border border-slate-800/80 leading-relaxed">
                      {selectedRecord.logs.join('\n')}
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
