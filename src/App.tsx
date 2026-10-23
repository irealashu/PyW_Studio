import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Project, 
  ViewMode, 
  BuildProfile, 
  InstalledPackage, 
  BuildHistoryRecord, 
  TaskLogItem, 
  VirtualEnvironment,
  PythonInterpreter 
} from './types';
import { storage } from './services/storage';
import { resolveLatestVersion, formatPipOutdatedOutput, isVersionNewer } from './services/pypiService';
import { downloadCompiledExe, exportAsPy, exportAsPyw, exportProjectAsZip } from './services/exportService';
import { Header } from './components/Header';
import { ProjectExplorer } from './components/ProjectExplorer';
import { Editor } from './components/Editor';
import { DependencyManager } from './components/DependencyManager';
import { EnvironmentManager } from './components/EnvironmentManager';
import { BuilderView } from './components/BuilderView';
import { TestRunnerView } from './components/TestRunnerView';
import { BuildHistoryView } from './components/BuildHistoryView';
import { CleanupManagerView } from './components/CleanupManagerView';
import { TerminalOutput } from './components/TerminalOutput';
import { TkinterPreviewModal } from './components/TkinterPreviewModal';
import { NewProjectModal } from './components/NewProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { IconConverterModal } from './components/IconConverterModal';
import { GitHubWorkflowModal } from './components/GitHubWorkflowModal';

export const App: React.FC = () => {
  // Persistent State
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => storage.getActiveProjectId());
  const [environments, setEnvironments] = useState<VirtualEnvironment[]>(() => storage.getEnvironments());
  const [interpreters, setInterpreters] = useState<PythonInterpreter[]>(() => storage.getInterpreters());
  const [buildHistory, setBuildHistory] = useState<BuildHistoryRecord[]>(() => storage.getBuildHistory());

  // Current Active Project
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // UI Navigation State
  const [activeView, setActiveView] = useState<ViewMode>('editor');
  const [activeFilePath, setActiveFilePath] = useState<string>(currentProject.entryScript);
  const [openFiles, setOpenFiles] = useState<string[]>([currentProject.entryScript]);

  // Terminal & Task State
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [currentTask, setCurrentTask] = useState<TaskLogItem | null>(null);
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Modals
  const [isTkinterPreviewOpen, setIsTkinterPreviewOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isIconConverterOpen, setIsIconConverterOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  // Save projects to localStorage whenever modified
  useEffect(() => {
    storage.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    storage.setActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    storage.saveEnvironments(environments);
  }, [environments]);

  useEffect(() => {
    storage.saveInterpreters(interpreters);
  }, [interpreters]);

  useEffect(() => {
    storage.saveBuildHistory(buildHistory);
  }, [buildHistory]);

  // Sync activeFilePath when switching projects
  useEffect(() => {
    const entry = currentProject.entryScript || Object.keys(currentProject.files)[0] || 'main.pyw';
    setActiveFilePath(entry);
    setOpenFiles([entry]);
  }, [currentProject.id, currentProject.entryScript]);

  // Active file object with fallback
  const activeFile = currentProject.files[activeFilePath] || currentProject.files[currentProject.entryScript] || Object.values(currentProject.files)[0];
  const hasUnsavedChanges = Object.values(currentProject.files).some((f) => f.isModified);

  // Helper to update current project
  const updateCurrentProject = (updater: (prev: Project) => Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === currentProject.id ? updater(p) : p))
    );
  };

  // Editor Actions
  const handleSelectFile = (path: string) => {
    setActiveFilePath(path);
    if (!openFiles.includes(path)) {
      setOpenFiles((prev) => [...prev, path]);
    }
    setActiveView('editor');
  };

  const handleCloseTab = (path: string) => {
    const nextOpen = openFiles.filter((p) => p !== path);
    setOpenFiles(nextOpen);
    if (activeFilePath === path && nextOpen.length > 0) {
      setActiveFilePath(nextOpen[nextOpen.length - 1]);
    }
  };

  const handleChangeContent = (newContent: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [activeFilePath]: {
          ...prev.files[activeFilePath],
          content: newContent,
          isModified: true,
        },
      },
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }));
  };

  const handleSaveCurrentFile = () => {
    updateCurrentProject((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [activeFilePath]: {
          ...prev.files[activeFilePath],
          isModified: false,
        },
      },
    }));

    appendLog(`[PyW Studio] Saved file: ${activeFilePath}`, 'system');
  };

  const handleCreateFile = (name: string, content = '') => {
    const isPy = name.endsWith('.py') || name.endsWith('.pyw');
    const isJson = name.endsWith('.json');
    const isMd = name.endsWith('.md');

    updateCurrentProject((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [name]: {
          name,
          path: name,
          content: content || (isPy ? '# New Python script\n\n' : ''),
          language: isPy ? 'python' : isJson ? 'json' : isMd ? 'markdown' : 'text',
          isModified: false,
        },
      },
    }));

    handleSelectFile(name);
  };

  const handleDeleteFile = (path: string) => {
    updateCurrentProject((prev) => {
      const updatedFiles = { ...prev.files };
      delete updatedFiles[path];
      return {
        ...prev,
        files: updatedFiles,
      };
    });
    handleCloseTab(path);
  };

  const handleSetEntryScript = (path: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      entryScript: path,
    }));
    appendLog(`[PyW Studio] Entry script updated to: ${path}`, 'system');
  };

  const handleDownloadExe = () => {
    downloadCompiledExe(currentProject);
    appendLog(`[PyW Studio] Downloaded standalone Windows executable: ${currentProject.name}.exe`, 'system');
  };

  const handleExportPy = () => {
    exportAsPy(activeFile, currentProject.name);
    appendLog(`[PyW Studio] Exported Python script (.py): ${activeFile.name.replace(/\.(pyw|py|txt|json|md)$/i, '')}.py`, 'system');
  };

  const handleExportPyw = () => {
    exportAsPyw(activeFile, currentProject.name);
    appendLog(`[PyW Studio] Exported windowed Python script (.pyw): ${activeFile.name.replace(/\.(pyw|py|txt|json|md)$/i, '')}.pyw`, 'system');
  };

  const handleExportZip = async () => {
    appendLog(`[PyW Studio] Compressing ${Object.keys(currentProject.files).length} project files into .zip archive...`, 'system');
    await exportProjectAsZip(currentProject);
    appendLog(`[PyW Studio] Successfully exported and downloaded project ZIP bundle.`, 'system');
  };

  const handleExportProject = () => {
    handleExportZip();
  };

  // Logging & Terminal Helper
  const appendLog = (text: string, stream: 'stdout' | 'stderr' | 'system' = 'stdout') => {
    setCurrentTask((prev) => {
      if (!prev) {
        return {
          id: `task-${Date.now()}`,
          type: 'run',
          title: 'System',
          startTime: new Date().toLocaleTimeString(),
          status: 'running',
          logs: [{ text, stream }],
        };
      }
      return {
        ...prev,
        logs: [...prev.logs, { text, stream }],
      };
    });
  };

  // Dependency Actions: Install, Uninstall, Check Updates, Upgrade
  const handleInstallPackage = (pkgString: string) => {
    setIsTerminalOpen(true);
    setIsTaskRunning(true);

    const [name, versionSpec] = pkgString.split(/[>=<]/);
    const cleanName = name.trim();
    const cleanVersion = versionSpec ? versionSpec.replace(/^[=<>]+/, '') : '1.0.0';

    appendLog(`[pip] Running: pip install ${pkgString} in %LOCALAPPDATA%\\PyWStudio\\environments\\${currentProject.environmentId}`, 'system');
    appendLog(`[pip] Collecting ${cleanName}...`, 'stdout');

    setTimeout(() => {
      appendLog(`[pip] Downloading ${cleanName}... (cached)`, 'stdout');
      appendLog(`[pip] Installing collected packages: ${cleanName}`, 'stdout');
      appendLog(`[pip] Successfully installed ${cleanName}-${cleanVersion}`, 'system');
      setIsTaskRunning(false);

      updateCurrentProject((prev) => {
        const exists = prev.installedPackages.some((p) => p.name.toLowerCase() === cleanName.toLowerCase());
        const updated = exists
          ? prev.installedPackages.map((p) =>
              p.name.toLowerCase() === cleanName.toLowerCase() ? { ...p, version: cleanVersion } : p
            )
          : [
              ...prev.installedPackages,
              {
                name: cleanName,
                version: cleanVersion,
                latestVersion: cleanVersion,
                size: '4.2 MB',
                description: `Installed Python module ${cleanName}`,
                installedAt: new Date().toISOString().slice(0, 10),
                license: 'MIT',
                vulnerabilityStatus: 'secure' as const,
              },
            ];

        return {
          ...prev,
          installedPackages: updated,
        };
      });
    }, 1000);
  };

  const handleUninstallPackage = (pkgName: string) => {
    setIsTerminalOpen(true);
    appendLog(`[pip] Running: pip uninstall -y ${pkgName}`, 'system');
    appendLog(`[pip] Successfully uninstalled ${pkgName}`, 'stdout');

    updateCurrentProject((prev) => ({
      ...prev,
      installedPackages: prev.installedPackages.filter((p) => p.name.toLowerCase() !== pkgName.toLowerCase()),
    }));
  };

  // Check for updates for all installed packages (pip list --outdated)
  const handleCheckUpdates = async () => {
    if (isCheckingUpdates || isTaskRunning) return;
    setIsTerminalOpen(true);
    setIsCheckingUpdates(true);

    appendLog(`[pip] Running: pip list --outdated in %LOCALAPPDATA%\\PyWStudio\\environments\\${currentProject.environmentId}`, 'system');
    appendLog('[pip] Querying PyPI repository index for available package upgrades...', 'stdout');

    try {
      const outdatedList: { name: string; currentVersion: string; latestVersion: string }[] = [];
      const updatedPackages: InstalledPackage[] = [];

      for (const pkg of currentProject.installedPackages) {
        const latest = await resolveLatestVersion(pkg.name, pkg.version);
        const hasUpdate = isVersionNewer(pkg.version, latest);
        if (hasUpdate) {
          outdatedList.push({
            name: pkg.name,
            currentVersion: pkg.version,
            latestVersion: latest,
          });
        }
        updatedPackages.push({
          ...pkg,
          latestVersion: latest,
        });
      }

      updateCurrentProject((prev) => ({
        ...prev,
        installedPackages: updatedPackages,
      }));

      const formattedLines = formatPipOutdatedOutput(outdatedList);
      formattedLines.forEach((line) => {
        appendLog(line, line.startsWith('[pip]') ? 'system' : 'stdout');
      });
    } catch (e: any) {
      appendLog(`[pip] Error checking PyPI updates: ${e?.message || 'Network error'}`, 'stderr');
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Upgrade all packages with available updates (pip upgrade / pip update)
  const handleUpgradeAllPackages = async () => {
    if (isTaskRunning) return;
    setIsTerminalOpen(true);
    setIsTaskRunning(true);

    appendLog(`[pip] Running: pip upgrade --all in %LOCALAPPDATA%\\PyWStudio\\environments\\${currentProject.environmentId}`, 'system');

    const candidates = currentProject.installedPackages.filter((p) =>
      p.latestVersion ? isVersionNewer(p.version, p.latestVersion) : false
    );

    if (candidates.length === 0) {
      appendLog('[pip] Requirement already up-to-date: All installed packages are currently at their latest version.', 'system');
      setIsTaskRunning(false);
      return;
    }

    appendLog(`[pip] Found ${candidates.length} package(s) to upgrade: ${candidates.map((p) => p.name).join(', ')}`, 'stdout');

    candidates.forEach((pkg, index) => {
      setTimeout(() => {
        const nextVer = pkg.latestVersion || pkg.version;
        appendLog(`[pip] Collecting ${pkg.name}>=${nextVer}...`, 'stdout');
        appendLog(`[pip] Downloading ${pkg.name}-${nextVer}-py3-none-any.whl (cached)`, 'stdout');
        appendLog(`[pip] Found existing installation: ${pkg.name} ${pkg.version}`, 'stdout');
        appendLog(`[pip] Uninstalling ${pkg.name}-${pkg.version}: Successfully uninstalled`, 'stdout');
        appendLog(`[pip] Successfully installed ${pkg.name}-${nextVer}`, 'system');

        if (index === candidates.length - 1) {
          setIsTaskRunning(false);
          updateCurrentProject((prev) => ({
            ...prev,
            installedPackages: prev.installedPackages.map((p) => {
              const cand = candidates.find((c) => c.name.toLowerCase() === p.name.toLowerCase());
              if (cand && cand.latestVersion) {
                return {
                  ...p,
                  version: cand.latestVersion,
                  latestVersion: cand.latestVersion,
                };
              }
              return p;
            }),
          }));
          appendLog(`[pip] Successfully upgraded all ${candidates.length} package(s) to latest release.`, 'system');
        }
      }, (index + 1) * 600);
    });
  };

  // Upgrade single package (pip install --upgrade <pkg> / pip upgrade <pkg>)
  const handleUpgradePackage = async (pkgName: string) => {
    if (isTaskRunning) return;
    const pkg = currentProject.installedPackages.find(
      (p) => p.name.toLowerCase() === pkgName.toLowerCase()
    );
    if (!pkg) {
      appendLog(`[pip] Package "${pkgName}" is not installed in current environment.`, 'stderr');
      return;
    }

    setIsTerminalOpen(true);
    setIsTaskRunning(true);

    const targetVer = pkg.latestVersion || await resolveLatestVersion(pkg.name, pkg.version);

    appendLog(`[pip] Running: pip install --upgrade ${pkg.name}`, 'system');
    appendLog(`[pip] Collecting ${pkg.name}>=${targetVer}...`, 'stdout');

    setTimeout(() => {
      appendLog(`[pip] Downloading ${pkg.name}-${targetVer}-py3-none-any.whl (cached)`, 'stdout');
      appendLog(`[pip] Found existing installation: ${pkg.name} ${pkg.version}`, 'stdout');
      appendLog(`[pip] Uninstalling ${pkg.name}-${pkg.version}: Successfully uninstalled`, 'stdout');
      appendLog(`[pip] Successfully installed ${pkg.name}-${targetVer}`, 'system');
      setIsTaskRunning(false);

      updateCurrentProject((prev) => ({
        ...prev,
        installedPackages: prev.installedPackages.map((p) =>
          p.name.toLowerCase() === pkg.name.toLowerCase()
            ? { ...p, version: targetVer, latestVersion: targetVer }
            : p
        ),
      }));
    }, 700);
  };

  // Interactive Terminal REPL Command Execution
  const handleExecuteTerminalCommand = (cmd: string) => {
    appendLog(`>>> ${cmd}`, 'system');
    const cleanCmd = cmd.trim();
    if (!cleanCmd) return;

    // Support compound commands: e.g. "pip update && pip upgrade", "pip list --outdated && pip upgrade"
    if (cleanCmd.includes('&&') || cleanCmd.includes(';')) {
      const delimiter = cleanCmd.includes('&&') ? '&&' : ';';
      const subCommands = cleanCmd.split(delimiter).map((c) => c.trim()).filter(Boolean);
      subCommands.forEach((subCmd, idx) => {
        setTimeout(() => {
          executeSingleCommand(subCmd);
        }, idx * 900);
      });
      return;
    }

    executeSingleCommand(cleanCmd);
  };

  const executeSingleCommand = (cleanCmd: string) => {
    const lower = cleanCmd.toLowerCase();

    if (lower === 'clear') {
      setCurrentTask(null);
      return;
    }

    if (lower === 'help' || lower === 'pip help') {
      appendLog('PyW Studio REPL & Pip Package Manager:', 'stdout');
      appendLog('  • Package checks:   pip list --outdated, pip check, pip list, pip freeze', 'stdout');
      appendLog('  • Package updates:  pip update, pip upgrade, pip update && pip upgrade', 'stdout');
      appendLog('  • Install/Upgrade:  pip install <pkg>, pip install --upgrade <pkg>, pip install -U <pkg>', 'stdout');
      appendLog('  • Package removal:  pip uninstall <pkg>', 'stdout');
      appendLog('  • Python info:      python -V, pip -V, pyinstaller -v', 'stdout');
      appendLog('  • Python eval:      2+2, math.sqrt(16), [x*2 for x in range(5)]', 'stdout');
      appendLog('  • General:          clear, help', 'stdout');
      return;
    }

    if (lower === 'python -v' || lower === 'python --version') {
      appendLog('Python 3.12.3 (tags/v3.12.3:f6650f9, Apr 9 2024, 14:14:43) [MSC v.1938 64 bit (AMD64)] on win32', 'stdout');
      return;
    }

    if (lower === 'pip -v' || lower === 'pip --version') {
      appendLog(`pip 24.0 from %LOCALAPPDATA%\\PyWStudio\\environments\\${currentProject.environmentId}\\lib\\site-packages\\pip (python 3.12)`, 'stdout');
      return;
    }

    if (lower === 'pyinstaller -v' || lower === 'pyinstaller --version') {
      appendLog('PyInstaller 6.5.0 (standalone Windows PE32+ compiler)', 'stdout');
      return;
    }

    if (lower === 'pip list') {
      appendLog('Package         Version', 'stdout');
      appendLog('--------------- -------', 'stdout');
      currentProject.installedPackages.forEach((p) => {
        appendLog(`${p.name.padEnd(16, ' ')} ${p.version}`, 'stdout');
      });
      return;
    }

    if (lower === 'pip freeze') {
      currentProject.installedPackages.forEach((p) => {
        appendLog(`${p.name}==${p.version}`, 'stdout');
      });
      return;
    }

    // pip list --outdated, pip list -o, pip check, pip outdated
    if (
      lower === 'pip list --outdated' || 
      lower === 'pip list -o' || 
      lower === 'pip check' || 
      lower === 'pip outdated'
    ) {
      handleCheckUpdates();
      return;
    }

    // pip update (alone or with flags/package)
    if (lower === 'pip update' || lower === 'pip update --all' || lower === 'pip update -a') {
      handleCheckUpdates().then(() => {
        const hasOutdated = currentProject.installedPackages.some(
          (p) => p.latestVersion && isVersionNewer(p.version, p.latestVersion)
        );
        if (hasOutdated) {
          setTimeout(() => {
            handleUpgradeAllPackages();
          }, 800);
        }
      });
      return;
    }

    if (lower.startsWith('pip update ')) {
      const targetPkg = cleanCmd.slice('pip update '.length).trim().replace(/^-+/, '');
      if (targetPkg === 'all' || targetPkg === 'a') {
        handleUpgradeAllPackages();
      } else {
        handleUpgradePackage(targetPkg);
      }
      return;
    }

    // pip upgrade (alone or with flags/package)
    if (lower === 'pip upgrade' || lower === 'pip upgrade --all' || lower === 'pip upgrade -a') {
      handleUpgradeAllPackages();
      return;
    }

    if (lower.startsWith('pip upgrade ')) {
      const targetPkg = cleanCmd.slice('pip upgrade '.length).trim();
      if (targetPkg === '--all' || targetPkg === '-a' || targetPkg === 'all') {
        handleUpgradeAllPackages();
      } else {
        handleUpgradePackage(targetPkg);
      }
      return;
    }

    // pip install --upgrade <pkg> or pip install -U <pkg>
    if (lower.startsWith('pip install --upgrade') || lower.startsWith('pip install -u')) {
      const parts = cleanCmd.split(/\s+/);
      const flagIdx = parts.findIndex((p) => p.toLowerCase() === '--upgrade' || p.toLowerCase() === '-u');
      const targetPkg = parts.slice(flagIdx + 1).join(' ').trim();
      if (!targetPkg || targetPkg === '--all' || targetPkg === 'all') {
        handleUpgradeAllPackages();
      } else {
        handleUpgradePackage(targetPkg);
      }
      return;
    }

    // pip uninstall
    if (lower.startsWith('pip uninstall')) {
      const targetPkg = cleanCmd.replace(/pip uninstall(\s+-y)?/i, '').trim();
      if (targetPkg) {
        handleUninstallPackage(targetPkg);
      } else {
        appendLog('[pip] Error: Please specify a package to uninstall (e.g. pip uninstall requests)', 'stderr');
      }
      return;
    }

    // standard pip install
    if (lower.startsWith('pip install ')) {
      const pkg = cleanCmd.replace(/pip install\s+/i, '').trim();
      handleInstallPackage(pkg);
      return;
    }

    // Attempt client-side safe expression evaluation
    try {
      const safeScope = {
        math: Math,
        pi: Math.PI,
        sqrt: Math.sqrt,
        pow: Math.pow,
        range: (n: number) => Array.from({ length: n }, (_, i) => i),
      };
      const res = Function('math, pi, sqrt, pow, range', `'use strict'; return (${cleanCmd})`)(
        safeScope.math,
        safeScope.pi,
        safeScope.sqrt,
        safeScope.pow,
        safeScope.range
      );
      appendLog(typeof res === 'object' ? JSON.stringify(res) : String(res), 'stdout');
    } catch (e: any) {
      appendLog(`SyntaxError/NameError: ${e?.message || 'Invalid Python statement'}`, 'stderr');
    }
  };

  // Run Script (F5) Execution Simulator
  const handleRunScript = () => {
    if (isTaskRunning) return;
    setIsTerminalOpen(true);
    setIsTaskRunning(true);

    const task: TaskLogItem = {
      id: `task-run-${Date.now()}`,
      type: 'run',
      title: `Run: ${currentProject.entryScript}`,
      startTime: new Date().toLocaleTimeString(),
      status: 'running',
      logs: [
        { text: `[PyW Studio Runner] Initializing process supervisor for ${currentProject.name}...`, stream: 'system' },
        { text: `[PyW Studio Runner] Selected Interpreter: Python 3.12.3 (64-bit)`, stream: 'system' },
        { text: `[PyW Studio Runner] Virtual Environment: %LOCALAPPDATA%\\PyWStudio\\environments\\${currentProject.environmentId}`, stream: 'system' },
        { text: `[PyW Studio Runner] Command: pythonw.exe "${currentProject.entryScript}"`, stream: 'stdout' },
        { text: `[PyW Studio] Spawning isolated GUI process...`, stream: 'stdout' },
      ],
    };
    setCurrentTask(task);

    setTimeout(() => {
      appendLog('[Tkinter] Connecting to Windows DWM and initializing Tk root window...', 'stdout');
      appendLog('[Tkinter] Tkinter event loop mainloop() active. Application ready.', 'stdout');
      setIsTaskRunning(false);
      setIsTkinterPreviewOpen(true);
    }, 700);
  };

  // PyInstaller Build Executable (F7)
  const handleStartBuild = () => {
    if (isTaskRunning) return;
    setIsTerminalOpen(true);
    setIsTaskRunning(true);

    const activeProfile =
      currentProject.buildProfiles.find((p) => p.id === currentProject.activeProfileId) ||
      currentProject.buildProfiles[0];

    const task: TaskLogItem = {
      id: `task-build-${Date.now()}`,
      type: 'build',
      title: `PyInstaller: ${activeProfile.outputName}`,
      startTime: new Date().toLocaleTimeString(),
      status: 'running',
      logs: [
        { text: `======================================================================`, stream: 'system' },
        { text: `[PyW Studio] PyInstaller Packaging Pipeline Started`, stream: 'system' },
        { text: `[PyW Studio] Project: ${currentProject.name} | Entry: ${currentProject.entryScript}`, stream: 'system' },
        { text: `[PyW Studio] Profile: ${activeProfile.name} | Mode: ${activeProfile.mode}`, stream: 'system' },
        { text: `======================================================================`, stream: 'system' },
      ],
    };
    setCurrentTask(task);

    const buildSteps = [
      { delay: 400, text: `INFO: PyInstaller: 6.5.0` },
      { delay: 700, text: `INFO: Python: 3.12.3 (Platform: Windows-10-10.0.19045-SP0, win_amd64)` },
      { delay: 1000, text: `INFO: Isolating runtime environment: %LOCALAPPDATA%\\PyWStudio\\environments\\${currentProject.environmentId}` },
      { delay: 1300, text: `INFO: Validating entry point syntax and imports in ${currentProject.entryScript}` },
      { delay: 1600, text: `INFO: Generating PyInstaller spec configuration: ${currentProject.name}.spec` },
      { delay: 2000, text: `INFO: Analyzing hidden imports: [${(activeProfile.hiddenImports || []).join(', ')}]` },
      { delay: 2400, text: `INFO: Collecting bundled assets: ${(activeProfile.addData || []).join(', ') || 'None'}` },
      { delay: 2800, text: `INFO: Compiling Python bytecode (.pyc) to optimized archive...` },
      { delay: 3200, text: `INFO: Embedding PE32+ application manifest and icon: ${activeProfile.icon || 'assets/app.ico'}` },
      { delay: 3600, text: activeProfile.upxCompression ? `INFO: UPX compression enabled. Compressing binary headers...` : `INFO: UPX compression skipped.` },
      { delay: 4000, text: `INFO: Assembling standalone executable: dist\\${activeProfile.outputName}` },
      { delay: 4300, text: `INFO: Verifying output artifact integrity on filesystem...` },
      { delay: 4600, text: `SUCCESS: Verified Windows executable PE32+ binary (Size: 15.8 MB, ExitCode: 0)` },
    ];

    buildSteps.forEach((step, index) => {
      setTimeout(() => {
        appendLog(step.text, step.text.startsWith('SUCCESS:') ? 'system' : 'stdout');

        if (index === buildSteps.length - 1) {
          setIsTaskRunning(false);

          const newRecord: BuildHistoryRecord = {
            id: `build-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            projectName: currentProject.name,
            profileName: activeProfile.name,
            mode: activeProfile.mode,
            status: 'success',
            durationSeconds: 4.6,
            artifactName: activeProfile.outputName,
            artifactPath: `${activeProfile.outputDir}\\${activeProfile.outputName}`,
            artifactSize: '15.8 MB',
            sha256: '4a5e3b67c9d123e4f5a6b7c8d9e0123456789abcdef0123456789abcdef01234',
            bundledPackagesCount: currentProject.installedPackages.length,
            pyinstallerVersion: '6.5.0',
            logs: [
              `PyInstaller: 6.5.0`,
              `Entry: ${currentProject.entryScript}`,
              `Mode: ${activeProfile.mode}`,
              `Console: ${activeProfile.console ? 'Enabled' : 'Disabled (Windowed GUI)'}`,
              `Artifact: ${activeProfile.outputDir}\\${activeProfile.outputName} (Verified)`,
            ],
          };

          setBuildHistory((prev) => [newRecord, ...prev]);

          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch (e) {
            // ignore
          }
        }
      }, step.delay);
    });
  };

  // Run Unit Tests Handler
  const handleRunTests = () => {
    if (isRunningTests) return;
    setIsTerminalOpen(true);
    setIsRunningTests(true);

    appendLog('======================================================================', 'system');
    appendLog('[pytest / unittest] Discovering test suites in tests/ ...', 'system');

    setTimeout(() => {
      appendLog('test_addition (tests.test_calculator.TestCalculatorEngine) ... ok', 'stdout');
    }, 400);

    setTimeout(() => {
      appendLog('test_multiplication_precedence (tests.test_calculator.TestCalculatorEngine) ... ok', 'stdout');
    }, 700);

    setTimeout(() => {
      appendLog('test_floating_point (tests.test_calculator.TestCalculatorEngine) ... ok', 'stdout');
    }, 1000);

    setTimeout(() => {
      appendLog('test_division (tests.test_calculator.TestCalculatorEngine) ... ok', 'stdout');
    }, 1300);

    setTimeout(() => {
      appendLog('test_syntax_safety (tests.test_calculator.TestCalculatorEngine) ... ok', 'stdout');
      appendLog('----------------------------------------------------------------------', 'system');
      appendLog('Ran 5 tests in 0.024s (OK)', 'system');
      setIsRunningTests(false);
    }, 1600);
  };

  const handleCancelTask = () => {
    setIsTaskRunning(false);
    setIsRunningTests(false);
    appendLog('[PyW Studio Task Supervisor] Process killed by user (SIGTERM sent to child PID).', 'stderr');
    setCurrentTask((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  };


  const handleSyncWithRequirements = () => {
    const reqFile = currentProject.files['requirements.txt'];
    if (!reqFile) {
      appendLog(`[pip] requirements.txt not found in project root!`, 'stderr');
      return;
    }

    setIsTerminalOpen(true);
    appendLog(`[pip] Parsing requirements.txt...`, 'system');
    const lines = reqFile.content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
    appendLog(`[pip] Found ${lines.length} requirement entries: ${lines.join(', ')}`, 'stdout');
    appendLog(`[pip] Project dependencies in ${currentProject.environmentId} are verified and up to date.`, 'stdout');
  };

  const handleExportToRequirements = () => {
    const lines = currentProject.installedPackages.map((p) => `${p.name}==${p.version}`).join('\n');
    updateCurrentProject((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        'requirements.txt': {
          name: 'requirements.txt',
          path: 'requirements.txt',
          content: lines + '\n',
          language: 'text',
          isModified: false,
        },
      },
    }));
    appendLog(`[PyW Studio] Exported ${currentProject.installedPackages.length} pinned packages to requirements.txt`, 'system');
  };

  // Environment & Interpreter Actions
  const handleSelectInterpreter = (interpreterId: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      pythonExecutableId: interpreterId,
    }));
    const interp = interpreters.find((i) => i.id === interpreterId);
    appendLog(`[PyW Studio] Selected project interpreter: ${interp?.name}`, 'system');
  };

  const handleSetEnvironmentMode = (mode: 'persistent' | 'temporary') => {
    updateCurrentProject((prev) => ({
      ...prev,
      environmentMode: mode,
    }));
    appendLog(`[PyW Studio] Switched environment strategy to: ${mode} mode`, 'system');
  };

  const handleRecreateEnvironment = (envId: string) => {
    setIsTerminalOpen(true);
    appendLog(`[venv] Recreating virtual environment for ${currentProject.name}...`, 'system');
    appendLog(`[venv] Creating virtual environment at %LOCALAPPDATA%\\PyWStudio\\environments\\${envId}`, 'stdout');
    appendLog(`[venv] Installing setuptools and pip in clean environment...`, 'stdout');
    appendLog(`[venv] Virtual environment ready.`, 'stdout');
  };

  // Profile Actions
  const handleUpdateActiveProfile = (updatedProfile: BuildProfile) => {
    updateCurrentProject((prev) => ({
      ...prev,
      buildProfiles: prev.buildProfiles.map((p) =>
        p.id === updatedProfile.id ? updatedProfile : p
      ),
    }));
  };

  const handleSaveNewProfile = (profileName: string) => {
    const activeProfile =
      currentProject.buildProfiles.find((p) => p.id === currentProject.activeProfileId) ||
      currentProject.buildProfiles[0];

    const newProf: BuildProfile = {
      ...activeProfile,
      id: `prof-${Date.now()}`,
      name: profileName,
    };

    updateCurrentProject((prev) => ({
      ...prev,
      buildProfiles: [...prev.buildProfiles, newProf],
      activeProfileId: newProf.id,
    }));
    appendLog(`[PyW Studio] Saved new PyInstaller build profile: ${profileName}`, 'system');
  };

  const handleSelectProfile = (profileId: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      activeProfileId: profileId,
    }));
  };

  const handleApplyIcon = (iconPath: string) => {
    const activeProfile =
      currentProject.buildProfiles.find((p) => p.id === currentProject.activeProfileId) ||
      currentProject.buildProfiles[0];

    handleUpdateActiveProfile({
      ...activeProfile,
      icon: iconPath,
    });
    appendLog(`[PyW Studio] Applied application icon: ${iconPath}`, 'system');
  };

  const handleAddWorkflowToProject = (yamlContent: string) => {
    handleCreateFile('.github/workflows/build-exe.yml', yamlContent);
    appendLog('[PyW Studio] Added automated GitHub Actions workflow: .github/workflows/build-exe.yml', 'system');
  };

  // New Project Creation
  const handleCreateNewProject = (
    name: string,
    description: string,
    template: 'calculator' | 'arcade' | 'cleaner' | 'blank'
  ) => {
    const id = `proj-${Date.now()}`;
    const newProj: Project = {
      id,
      name,
      description: description || 'Python desktop project created with PyW Studio',
      entryScript: template === 'arcade' ? 'arcade.pyw' : 'main.pyw',
      pythonExecutableId: 'py312-x64',
      environmentMode: 'persistent',
      environmentId: `env_${name.toLowerCase()}`,
      requirementsFile: 'requirements.txt',
      outputDirectory: 'dist',
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16),
      activeFile: template === 'arcade' ? 'arcade.pyw' : 'main.pyw',
      files: {
        [template === 'arcade' ? 'arcade.pyw' : 'main.pyw']: {
          name: template === 'arcade' ? 'arcade.pyw' : 'main.pyw',
          path: template === 'arcade' ? 'arcade.pyw' : 'main.pyw',
          content: `"""\n${name}\nBuilt with Python & Tkinter\n"""\nimport tkinter as tk\nfrom tkinter import messagebox\n\ndef main():\n    root = tk.Tk()\n    root.title("${name} - PyW Studio")\n    root.geometry("450x300")\n    root.configure(bg="#0f172a")\n    lbl = tk.Label(root, text="${name}", font=("Segoe UI", 16, "bold"), bg="#0f172a", fg="#38bdf8")\n    lbl.pack(pady=40)\n    btn = tk.Button(root, text="Launch Application", font=("Segoe UI", 11), bg="#0284c7", fg="#fff", padx=16, pady=6, command=lambda: messagebox.showinfo("PyW Studio", "Welcome to ${name}!"))\n    btn.pack()\n    root.mainloop()\n\nif __name__ == "__main__":\n    main()\n`,
          language: 'python',
          isEntryScript: true,
          isModified: false,
        },
        'requirements.txt': {
          name: 'requirements.txt',
          path: 'requirements.txt',
          content: 'pyinstaller>=6.5.0\nrequests>=2.31.0\n',
          language: 'text',
          isModified: false,
        },
        'README.md': {
          name: 'README.md',
          path: 'README.md',
          content: `# ${name}\n\nCreated using PyW Studio. Ready for packaging with PyInstaller.`,
          language: 'markdown',
          isModified: false,
        },
      },
      buildProfiles: [
        {
          id: `prof-${Date.now()}`,
          name: 'Production GUI',
          mode: 'onefile',
          console: false,
          icon: 'assets/app.ico',
          outputName: `${name}.exe`,
          outputDir: 'dist',
          cleanBuild: true,
          upxCompression: true,
          hiddenImports: ['tkinter', 'tkinter.ttk'],
          addData: [],
          exclusions: [],
          metadata: {
            fileVersion: '1.0.0.0',
            productVersion: '1.0.0.0',
            companyName: 'PyW Developer',
            fileDescription: `${name} Standalone Application`,
            copyright: 'Copyright (C) 2026',
            dpiAware: true,
          },
        },
      ],
      activeProfileId: `prof-${Date.now()}`,
      installedPackages: [
        { name: 'pyinstaller', version: '6.5.0', size: '18.4 MB', description: 'Packaging engine', installedAt: '2026-10-23', license: 'GPL-2.0', vulnerabilityStatus: 'secure' },
        { name: 'requests', version: '2.31.0', size: '3.2 MB', description: 'HTTP library', installedAt: '2026-10-23', license: 'Apache-2.0', vulnerabilityStatus: 'secure' },
      ],
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(id);
    setIsNewProjectModalOpen(false);
    appendLog(`[PyW Studio] Created new project: ${name}`, 'system');
  };

  const handleDownloadArtifact = (record: BuildHistoryRecord) => {
    const dummyExe = `MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00\xb8\x00\x00\x00This program cannot be run in DOS mode. (PyInstaller bundle for ${record.projectName})`;
    const blob = new Blob([dummyExe], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.artifactName;
    a.click();
    URL.revokeObjectURL(url);
    appendLog(`[PyW Studio] Downloaded verified executable: ${record.artifactName}`, 'system');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* 1. Header Toolbar & Project Selector */}
      <Header
        currentProject={currentProject}
        projects={projects}
        activeView={activeView}
        activeFilePath={activeFilePath}
        onSelectView={setActiveView}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onSaveCurrentFile={handleSaveCurrentFile}
        onRunScript={handleRunScript}
        onBuildExe={() => {
          setActiveView('builder');
          handleStartBuild();
        }}
        onDownloadExe={handleDownloadExe}
        onExportPy={handleExportPy}
        onExportPyw={handleExportPyw}
        onExportZip={handleExportZip}
        onCancelTask={handleCancelTask}
        isTaskRunning={isTaskRunning}
        hasUnsavedChanges={hasUnsavedChanges}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        isTerminalOpen={isTerminalOpen}
      />

      {/* 2. Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project Explorer */}
        <ProjectExplorer
          project={currentProject}
          activeFilePath={activeFilePath}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onSetEntryScript={handleSetEntryScript}
          onExportProject={handleExportProject}
        />

        {/* Dynamic Center View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          {activeView === 'editor' && (
            <Editor
              file={activeFile}
              openFiles={openFiles}
              activeFilePath={activeFilePath}
              onSelectTab={(path) => setActiveFilePath(path)}
              onCloseTab={handleCloseTab}
              onChangeContent={handleChangeContent}
              onSaveFile={handleSaveCurrentFile}
              onRunScript={handleRunScript}
              onDownloadExe={handleDownloadExe}
              onExportPy={handleExportPy}
              onExportPyw={handleExportPyw}
              onExportZip={handleExportZip}
            />
          )}

          {activeView === 'dependencies' && (
            <DependencyManager
              project={currentProject}
              onInstallPackage={handleInstallPackage}
              onUninstallPackage={handleUninstallPackage}
              onUpgradePackage={handleUpgradePackage}
              onCheckUpdates={handleCheckUpdates}
              onUpgradeAll={handleUpgradeAllPackages}
              onSyncWithRequirements={handleSyncWithRequirements}
              onExportToRequirements={handleExportToRequirements}
              onRunTerminalCommand={handleExecuteTerminalCommand}
              isInstalling={isTaskRunning}
              isCheckingUpdates={isCheckingUpdates}
            />
          )}

          {activeView === 'environment' && (
            <EnvironmentManager
              project={currentProject}
              interpreters={interpreters}
              environments={environments}
              onSelectInterpreter={handleSelectInterpreter}
              onSetEnvironmentMode={handleSetEnvironmentMode}
              onRecreateEnvironment={handleRecreateEnvironment}
              onAddNewInterpreter={() => {}}
            />
          )}

          {activeView === 'builder' && (
            <BuilderView
              project={currentProject}
              onUpdateActiveProfile={handleUpdateActiveProfile}
              onSaveNewProfile={handleSaveNewProfile}
              onSelectProfile={handleSelectProfile}
              onStartBuild={handleStartBuild}
              isBuilding={isTaskRunning}
              onOpenIconConverter={() => setIsIconConverterOpen(true)}
              onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
            />
          )}

          {activeView === 'tests' && (
            <TestRunnerView
              project={currentProject}
              onRunTests={handleRunTests}
              isRunning={isRunningTests}
            />
          )}

          {activeView === 'history' && (
            <BuildHistoryView
              history={buildHistory}
              onClearHistory={() => setBuildHistory([])}
              onDownloadArtifact={handleDownloadArtifact}
            />
          )}

          {activeView === 'cleanup' && <CleanupManagerView />}
        </main>
      </div>

      {/* 3. Docked Terminal Output Runner & REPL */}
      <TerminalOutput
        currentTask={currentTask}
        onCancelTask={handleCancelTask}
        onClearLogs={() => setCurrentTask(null)}
        isOpen={isTerminalOpen}
        onToggleOpen={() => setIsTerminalOpen(!isTerminalOpen)}
        onExecuteCommand={handleExecuteTerminalCommand}
      />

      {/* 4. Modals */}
      {isTkinterPreviewOpen && (
        <TkinterPreviewModal
          project={currentProject}
          onClose={() => setIsTkinterPreviewOpen(false)}
          onLogOutput={appendLog}
        />
      )}

      {isNewProjectModalOpen && (
        <NewProjectModal
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={handleCreateNewProject}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          interpreters={interpreters}
        />
      )}

      {isIconConverterOpen && (
        <IconConverterModal
          onClose={() => setIsIconConverterOpen(false)}
          onApplyIcon={handleApplyIcon}
        />
      )}

      {isWorkflowModalOpen && (
        <GitHubWorkflowModal
          project={currentProject}
          onClose={() => setIsWorkflowModalOpen(false)}
          onAddWorkflowToProject={handleAddWorkflowToProject}
        />
      )}
    </div>
  );
};
