import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck
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
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <History className="w-6 h-6 text-sky-400" />
              Build & Packaging History
            </h2>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Audit log of previous PyInstaller packaging runs, compiled executables, and checksums.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear build history records? Generated files on disk remain preserved.')) {
                  onClearHistory();
                }
              }}
              className="text-xs text-zinc-400 hover:text-rose-400 px-3.5 py-2 rounded-lg hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
            <History className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-zinc-200">No Executables Packaged Yet</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Run a build in the Build EXE tab to generate standalone Windows executables and verification reports.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* History List */}
            <div className="space-y-3 lg:col-span-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Records ({history.length})
              </span>
              <div className="space-y-2.5">
                {history.map((record) => {
                  const isSelected = record.id === selectedRecordId;
                  const isSuccess = record.status === 'success';

                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedRecordId(record.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-900 border-sky-500 shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 truncate">
                          {isSuccess ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="text-sm font-semibold text-zinc-100 truncate">
                            {record.artifactName}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-400">
                          {record.durationSeconds}s
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                        <span className="truncate">{record.profileName}</span>
                        <span className="font-mono text-sky-400">{record.artifactSize}</span>
                      </div>

                      <div className="text-xs text-zinc-500 font-mono mt-1">
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
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-zinc-100">
                          {selectedRecord.artifactName}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Verified PE32+
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Project: <strong className="text-zinc-200">{selectedRecord.projectName}</strong> • Profile: <strong className="text-zinc-200">{selectedRecord.profileName}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => onDownloadArtifact(selectedRecord)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>

                  {/* Metadata Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
                      <span className="text-xs uppercase font-medium text-zinc-400 block">Size</span>
                      <span className="text-sm font-mono font-bold text-zinc-100 mt-1 block">
                        {selectedRecord.artifactSize}
                      </span>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
                      <span className="text-xs uppercase font-medium text-zinc-400 block">Mode</span>
                      <span className="text-sm font-mono text-sky-400 mt-1 block capitalize">
                        {selectedRecord.mode}
                      </span>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
                      <span className="text-xs uppercase font-medium text-zinc-400 block">PyInstaller</span>
                      <span className="text-sm font-mono text-emerald-400 mt-1 block">
                        v{selectedRecord.pyinstallerVersion}
                      </span>
                    </div>
                  </div>

                  {/* SHA256 Checksum Bar */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-300">SHA-256 Checksum:</span>
                      <button
                        onClick={() => handleCopySha(selectedRecord.sha256)}
                        className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-xs cursor-pointer"
                      >
                        {copiedSha === selectedRecord.sha256 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Hash</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-xs font-mono text-zinc-400 break-all block">
                      {selectedRecord.sha256}
                    </code>
                  </div>

                  {/* Build Process Logs */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Output Log
                    </span>
                    <pre className="text-xs font-mono text-zinc-300 bg-zinc-950 p-4 rounded-lg overflow-x-auto max-h-60 border border-zinc-800 leading-relaxed">
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
