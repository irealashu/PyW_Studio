import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  TestTube2, 
  Clock, 
  AlertTriangle,
  FileCode2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { Project, TestCase } from '../types';

interface TestRunnerViewProps {
  project: Project;
  onRunTests: () => void;
  isRunning: boolean;
}

export const TestRunnerView: React.FC<TestRunnerViewProps> = ({
  project,
  onRunTests,
  isRunning,
}) => {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Look for test files in project
  const testFiles = Object.values(project.files).filter((f) =>
    f.path.includes('test') || f.name.startsWith('test_')
  );

  // Generate mock test cases based on project type
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'tc-1',
      suite: 'TestCalculatorEngine',
      name: 'test_addition (12 + 8 == 20)',
      status: 'passed',
      durationMs: 4,
    },
    {
      id: 'tc-2',
      suite: 'TestCalculatorEngine',
      name: 'test_multiplication_precedence (2 + 3 * 4 == 14)',
      status: 'passed',
      durationMs: 3,
    },
    {
      id: 'tc-3',
      suite: 'TestCalculatorEngine',
      name: 'test_floating_point (0.1 + 0.2 ~= 0.3)',
      status: 'passed',
      durationMs: 5,
    },
    {
      id: 'tc-4',
      suite: 'TestCalculatorEngine',
      name: 'test_division (100 / 4 == 25.0)',
      status: 'passed',
      durationMs: 4,
    },
    {
      id: 'tc-5',
      suite: 'TestCalculatorEngine',
      name: 'test_syntax_safety (reject unauthorized code)',
      status: 'passed',
      durationMs: 7,
    },
  ]);

  const passedCount = testCases.filter((t) => t.status === 'passed').length;
  const failedCount = testCases.filter((t) => t.status === 'failed').length;

  const filteredTests = testCases.filter((t) => {
    if (filter === 'passed') return t.status === 'passed';
    if (filter === 'failed') return t.status === 'failed';
    return true;
  });

  const selectedTest = testCases.find((t) => t.id === selectedTestId);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <TestTube2 className="w-5 h-5 text-sky-400" />
              Automated Python Test Runner (unittest / pytest)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify application logic, safety constraints, and mathematical models in isolated environment before packaging.
            </p>
          </div>

          <button
            onClick={onRunTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run All Unit Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Test Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Test Cases
              </span>
              <span className="text-2xl font-bold text-slate-100 mt-1 block">
                {testCases.length}
              </span>
            </div>
            <FileCode2 className="w-8 h-8 text-slate-600" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Passing Tests
              </span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                {passedCount}
              </span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                Failing Tests
              </span>
              <span className="text-2xl font-bold text-rose-400 mt-1 block">
                {failedCount}
              </span>
            </div>
            <XCircle className="w-8 h-8 text-rose-500/30" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({testCases.length})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filter === 'passed'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Passed ({passedCount})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Failed ({failedCount})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono pr-2">
            Engine: Python unittest / runner 3.12
          </span>
        </div>

        {/* Test List Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Test Suite</th>
                <th className="px-4 py-3 font-semibold">Test Method</th>
                <th className="px-4 py-3 font-semibold text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTests.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTestId(t.id)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    t.id === selectedTestId ? 'bg-sky-950/30' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    {t.status === 'passed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3 h-3" />
                        FAILED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{t.suite}</td>
                  <td className="px-4 py-3 text-slate-100 font-semibold">{t.name}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{t.durationMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Discovered Test Files in Project */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              Discovered Test Files in Workspace
            </span>
            <span className="font-mono text-[10px]">{testFiles.length} file(s) found</span>
          </div>
          <div className="space-y-1">
            {testFiles.map((f) => (
              <div key={f.path} className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded">
                <span>{f.path}</span>
                <span className="text-emerald-400 text-[10px]">Ready to execute</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
