import { Project, VirtualEnvironment, PythonInterpreter, BuildHistoryRecord, TaskLogItem } from '../types';
import { INITIAL_PROJECTS, INITIAL_ENVIRONMENTS, DEFAULT_INTERPRETERS } from '../data/defaultProjects';

const STORAGE_KEYS = {
  PROJECTS: 'pyw_studio_projects_v2',
  ACTIVE_PROJECT: 'pyw_studio_active_project_id',
  ENVIRONMENTS: 'pyw_studio_environments_v2',
  INTERPRETERS: 'pyw_studio_interpreters_v2',
  BUILD_HISTORY: 'pyw_studio_build_history_v2',
  SETTINGS: 'pyw_studio_settings_v2',
};

export const storage = {
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load projects from storage', e);
    }
    return INITIAL_PROJECTS;
  },

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to storage', e);
    }
  },

  getActiveProjectId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT) || INITIAL_PROJECTS[0].id;
  },

  setActiveProjectId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id);
  },

  getEnvironments(): VirtualEnvironment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load environments', e);
    }
    return INITIAL_ENVIRONMENTS;
  },

  saveEnvironments(envs: VirtualEnvironment[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify(envs));
    } catch (e) {
      console.error('Failed to save environments', e);
    }
  },

  getInterpreters(): PythonInterpreter[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERPRETERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load interpreters', e);
    }
    return DEFAULT_INTERPRETERS;
  },

  saveInterpreters(interpreters: PythonInterpreter[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INTERPRETERS, JSON.stringify(interpreters));
    } catch (e) {
      console.error('Failed to save interpreters', e);
    }
  },

  getBuildHistory(): BuildHistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUILD_HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load build history', e);
    }
    return [
      {
        id: 'hist-1',
        timestamp: '2026-10-22 17:34:10',
        projectName: 'ModernCalculator',
        profileName: 'Production GUI (One-File)',
        mode: 'onefile',
        status: 'success',
        durationSeconds: 14.2,
        artifactName: 'ModernCalculator.exe',
        artifactPath: 'dist\\ModernCalculator.exe',
        artifactSize: '15.4 MB',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        bundledPackagesCount: 6,
        pyinstallerVersion: '6.5.0',
        logs: [
          'INFO: PyInstaller: 6.5.0',
          'INFO: Python: 3.12.3 (win_amd64)',
          'INFO: Building binary distribution for ModernCalculator.exe',
          'INFO: Writing RT_ICON to ModernCalculator.exe (app.ico)',
          'INFO: UPX compression: Enabled (Reduced size by 34%)',
          'INFO: Verification passed. PE32+ Windows executable verified.',
        ],
      },
    ];
  },

  saveBuildHistory(history: BuildHistoryRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUILD_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save build history', e);
    }
  },
};
