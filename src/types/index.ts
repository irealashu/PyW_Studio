export type ViewMode = 
  | 'editor' 
  | 'dependencies' 
  | 'environment' 
  | 'builder' 
  | 'tests'
  | 'history' 
  | 'cleanup' 
  | 'settings';

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: 'python' | 'text' | 'json' | 'markdown';
  isEntryScript?: boolean;
  isModified?: boolean;
  originalContent?: string;
}

export interface WindowsMetadata {
  fileVersion: string;
  productVersion: string;
  companyName: string;
  fileDescription: string;
  copyright: string;
  dpiAware: boolean;
}

export interface BuildProfile {
  id: string;
  name: string;
  mode: 'onefile' | 'onedir';
  console: boolean; // false = windowed/noconsole, true = console visible
  icon: string;
  outputName: string;
  outputDir: string;
  cleanBuild: boolean;
  upxCompression: boolean;
  hiddenImports: string[];
  addData: string[];
  exclusions: string[];
  metadata?: WindowsMetadata;
  customSpecMode?: boolean;
  customSpecContent?: string;
}

export interface InstalledPackage {
  name: string;
  version: string;
  latestVersion?: string;
  size: string;
  description: string;
  installedAt: string;
  license?: string;
  vulnerabilityStatus?: 'secure' | 'warning';
}

export interface PythonInterpreter {
  id: string;
  name: string;
  version: string;
  path: string;
  arch: string;
  tkinterAvailable: boolean;
  isValid: boolean;
}

export interface VirtualEnvironment {
  id: string;
  name: string;
  path: string;
  pythonVersion: string;
  mode: 'persistent' | 'temporary';
  status: 'ready' | 'creating' | 'error';
  packageCount: number;
  totalSizeMb: number;
  createdAt: string;
  isLocked: boolean;
}

export interface BuildHistoryRecord {
  id: string;
  timestamp: string;
  projectName: string;
  profileName: string;
  mode: 'onefile' | 'onedir';
  status: 'success' | 'failed' | 'cancelled';
  durationSeconds: number;
  artifactName: string;
  artifactPath: string;
  artifactSize: string;
  sha256: string;
  bundledPackagesCount: number;
  pyinstallerVersion: string;
  logs: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  entryScript: string;
  pythonExecutableId: string;
  environmentMode: 'persistent' | 'temporary';
  environmentId: string;
  requirementsFile: string;
  outputDirectory: string;
  files: Record<string, ProjectFile>;
  activeFile: string;
  buildProfiles: BuildProfile[];
  activeProfileId: string;
  installedPackages: InstalledPackage[];
  lastModified: string;
}

export interface TaskLogItem {
  id: string;
  type: 'run' | 'build' | 'pip' | 'venv' | 'cleanup' | 'test';
  title: string;
  startTime: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  duration?: string;
  logs: { text: string; stream: 'stdout' | 'stderr' | 'system' }[];
}

export interface TestCase {
  id: string;
  suite: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'idle';
  durationMs: number;
  error?: string;
}

export interface SyntaxDiagnostic {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}
