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
import { Header } from './components/Header';
import { ProjectExplorer } from './components/ProjectExplorer';
import { Editor } from './components/Editor';
import { DependencyManager } from './components/DependencyManager';
import { EnvironmentManager } from './components/EnvironmentManager';
import { BuilderView } from './components/BuilderView';
import { BuildHistoryView } from './components/BuildHistoryView';
import { CleanupManagerView } from './components/CleanupManagerView';
import { TerminalOutput } from './components/TerminalOutput';
import { TkinterPreviewModal } from './components/TkinterPreviewModal';
import { NewProjectModal } from './components/NewProjectModal';
import { SettingsModal } from './components/SettingsModal';

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
  const taskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [isTkinterPreviewOpen, setIsTkinterPreviewOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
    setActiveFilePath(currentProject.entryScript);
    setOpenFiles([currentProject.entryScript]);
  }, [currentProject.id, currentProject.entryScript]);

  // Active file object
  const activeFile = currentProject.files[activeFilePath] || currentProject.files[currentProject.entryScript];
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

  const handleExportProject = () => {
    // Combine files into a downloadable summary or individual file
    const content = Object.values(currentProject.files)
      .map((f) => `### --- FILE: ${f.path} ---\n${f.content}\n\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
    appendLog(`[PyW Studio] Exported project bundle for ${currentProject.name}`, 'system');
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

    // Simulate process startup and launch interactive Tkinter GUI Preview
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
      { delay: 3200, text: `INFO: Embedding PE32+ application manifest and icon: ${activeProfile.icon || 'default.ico'}` },
      { delay: 3600, text: activeProfile.upxCompression ? `INFO: UPX compression enabled. Compressing binary headers...` : `INFO: UPX compression skipped.` },
      { delay: 4000, text: `INFO: Assembling standalone executable: dist\\${activeProfile.outputName}` },
      { delay: 4300, text: `INFO: Verifying output artifact integrity on filesystem...` },
      { delay: 4600, text: `SUCCESS: Verified Windows executable PE32+ binary (Size: 15.8 MB, ExitCode: 0)` },
    ];

    buildSteps.forEach((step, index) => {
      setTimeout(() => {
        appendLog(step.text, step.text.startsWith('SUCCESS:') ? 'system' : 'stdout');

        // Final step completion
        if (index === buildSteps.length - 1) {
          setIsTaskRunning(false);

          // Add to Build History
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

          // Trigger Confetti!
          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch (e) {
            // ignore if canvas-confetti unavailable
          }
        }
      }, step.delay);
    });
  };

  const handleCancelTask = () => {
    setIsTaskRunning(false);
    appendLog('[PyW Studio Task Supervisor] Process killed by user (SIGTERM sent to child PID).', 'stderr');
    setCurrentTask((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  };

  // Dependency Actions
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
      installedPackages: prev.installedPackages.filter((p) => p.name !== pkgName),
    }));
  };

  const handleUpgradePackage = (pkgName: string) => {
    const pkg = currentProject.installedPackages.find((p) => p.name === pkgName);
    if (!pkg || !pkg.latestVersion) return;
    setIsTerminalOpen(true);
    appendLog(`[pip] Running: pip install --upgrade ${pkgName}`, 'system');
    appendLog(`[pip] Upgraded ${pkgName}: ${pkg.version} -> ${pkg.latestVersion}`, 'stdout');

    updateCurrentProject((prev) => ({
      ...prev,
      installedPackages: prev.installedPackages.map((p) =>
        p.name === pkgName ? { ...p, version: p.latestVersion! } : p
      ),
    }));
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

  // New Project Creation
  const handleCreateNewProject = (
    name: string,
    description: string,
    template: 'calculator' | 'cleaner' | 'blank'
  ) => {
    const id = `proj-${Date.now()}`;
    const newProj: Project = {
      id,
      name,
      description: description || 'Python desktop project created with PyW Studio',
      entryScript: 'main.pyw',
      pythonExecutableId: 'py312-x64',
      environmentMode: 'persistent',
      environmentId: `env_${name.toLowerCase()}`,
      requirementsFile: 'requirements.txt',
      outputDirectory: 'dist',
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16),
      activeFile: 'main.pyw',
      files: {
        'main.pyw': {
          name: 'main.pyw',
          path: 'main.pyw',
          content: `"""
${name}
Built with Python & Tkinter / ttk
"""
import sys
import tkinter as tk
from tkinter import ttk, messagebox

def main():
    root = tk.Tk()
    root.title("${name} - PyW Studio")
    root.geometry("450x300")
    root.configure(bg="#0f172a")

    lbl = tk.Label(root, text="${name}", font=("Segoe UI", 16, "bold"), bg="#0f172a", fg="#38bdf8")
    lbl.pack(pady=40)

    btn = tk.Button(root, text="Click Me", font=("Segoe UI", 11), bg="#0284c7", fg="#fff", padx=16, pady=6, command=lambda: messagebox.showinfo("PyW Studio", "Hello from ${name}!"))
    btn.pack()

    root.mainloop()

if __name__ == "__main__":
    main()
`,
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
          icon: '',
          outputName: `${name}.exe`,
          outputDir: 'dist',
          cleanBuild: true,
          upxCompression: true,
          hiddenImports: ['tkinter', 'tkinter.ttk'],
          addData: [],
          exclusions: [],
        },
      ],
      activeProfileId: `prof-${Date.now()}`,
      installedPackages: [
        { name: 'pyinstaller', version: '6.5.0', size: '18.4 MB', description: 'Packaging engine', installedAt: '2026-10-23' },
        { name: 'requests', version: '2.31.0', size: '3.2 MB', description: 'HTTP library', installedAt: '2026-10-23' },
      ],
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(id);
    setIsNewProjectModalOpen(false);
    appendLog(`[PyW Studio] Created new project: ${name}`, 'system');
  };

  const handleDownloadArtifact = (record: BuildHistoryRecord) => {
    // Generate simulated executable bundle
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
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Toolbar & Project Selector */}
      <Header
        currentProject={currentProject}
        projects={projects}
        activeView={activeView}
        onSelectView={setActiveView}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onSaveCurrentFile={handleSaveCurrentFile}
        onRunScript={handleRunScript}
        onBuildExe={() => {
          setActiveView('builder');
          handleStartBuild();
        }}
        onCancelTask={handleCancelTask}
        isTaskRunning={isTaskRunning}
        hasUnsavedChanges={hasUnsavedChanges}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        isTerminalOpen={isTerminalOpen}
      />

      {/* 2. Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project Explorer is visible when on Editor view or always docked */}
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
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
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
            />
          )}

          {activeView === 'dependencies' && (
            <DependencyManager
              project={currentProject}
              onInstallPackage={handleInstallPackage}
              onUninstallPackage={handleUninstallPackage}
              onUpgradePackage={handleUpgradePackage}
              onSyncWithRequirements={handleSyncWithRequirements}
              onExportToRequirements={handleExportToRequirements}
              isInstalling={isTaskRunning}
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

      {/* 3. Docked Terminal Output Runner */}
      <TerminalOutput
        currentTask={currentTask}
        onCancelTask={handleCancelTask}
        onClearLogs={() => setCurrentTask(null)}
        isOpen={isTerminalOpen}
        onToggleOpen={() => setIsTerminalOpen(!isTerminalOpen)}
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
    </div>
  );
};
