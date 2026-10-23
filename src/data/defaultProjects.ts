import { Project, PythonInterpreter, VirtualEnvironment } from '../types';

export const DEFAULT_INTERPRETERS: PythonInterpreter[] = [
  {
    id: 'py312-x64',
    name: 'Python 3.12 (64-bit)',
    version: '3.12.3',
    path: 'C:\\Python312\\python.exe',
    arch: 'win_amd64',
    tkinterAvailable: true,
    isValid: true,
  },
  {
    id: 'py311-x64',
    name: 'Python 3.11 (64-bit)',
    version: '3.11.8',
    path: 'C:\\Python311\\python.exe',
    arch: 'win_amd64',
    tkinterAvailable: true,
    isValid: true,
  },
];

export const INITIAL_ENVIRONMENTS: VirtualEnvironment[] = [
  {
    id: 'env-default',
    name: 'venv_app_py312',
    path: '%LOCALAPPDATA%\\PyWStudio\\environments\\venv_app_py312',
    pythonVersion: 'Python 3.12.3',
    mode: 'persistent',
    status: 'ready',
    packageCount: 3,
    totalSizeMb: 28.4,
    createdAt: '2026-10-23',
    isLocked: false,
  },
];

const MAIN_PYW_EXAMPLE = `"""
PyW Studio Desktop Application Example
Run with F5 or package into a standalone Windows .exe with PyInstaller.
"""
import sys
import tkinter as tk
from tkinter import ttk, messagebox

class Application:
    def __init__(self, root):
        self.root = root
        self.root.title("Desktop Utility")
        self.root.geometry("440x520")
        self.root.configure(bg="#09090b")

        self.value = 0
        self.setup_ui()

    def setup_ui(self):
        # Header banner
        header = tk.Frame(self.root, bg="#18181b", padx=20, pady=16)
        header.pack(fill=tk.X)

        title = tk.Label(
            header,
            text="PyW Studio Application",
            font=("Segoe UI", 14, "bold"),
            bg="#18181b",
            fg="#fafafa"
        )
        title.pack(anchor="w")

        subtitle = tk.Label(
            header,
            text="Python GUI Desktop Application",
            font=("Segoe UI", 10),
            bg="#18181b",
            fg="#a1a1aa"
        )
        subtitle.pack(anchor="w", pady=(2, 0))

        # Main content
        content = tk.Frame(self.root, bg="#09090b", padx=24, pady=24)
        content.pack(fill=tk.BOTH, expand=True)

        info_box = tk.Frame(content, bg="#18181b", padx=16, pady=16, highlightthickness=1, highlightbackground="#27272a")
        info_box.pack(fill=tk.X, pady=(0, 20))

        tk.Label(info_box, text="Current Counter Value", font=("Segoe UI", 10), bg="#18181b", fg="#a1a1aa").pack(anchor="w")
        self.counter_label = tk.Label(info_box, text="0", font=("Segoe UI", 28, "bold"), bg="#18181b", fg="#38bdf8")
        self.counter_label.pack(anchor="w", pady=(4, 0))

        # Actions
        btn_row = tk.Frame(content, bg="#09090b")
        btn_row.pack(fill=tk.X, pady=8)

        inc_btn = tk.Button(
            btn_row,
            text="Increment (+1)",
            font=("Segoe UI", 11, "bold"),
            bg="#0284c7",
            fg="#ffffff",
            activebackground="#0369a1",
            activeforeground="#ffffff",
            bd=0,
            padx=16,
            pady=10,
            cursor="hand2",
            command=self.increment
        )
        inc_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 6))

        reset_btn = tk.Button(
            btn_row,
            text="Reset",
            font=("Segoe UI", 11),
            bg="#27272a",
            fg="#e4e4e7",
            activebackground="#3f3f46",
            activeforeground="#ffffff",
            bd=0,
            padx=16,
            pady=10,
            cursor="hand2",
            command=self.reset
        )
        reset_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(6, 0))

        # Status text
        self.status = tk.Label(
            content,
            text="Ready. Click Increment to test Python event loop.",
            font=("Segoe UI", 10),
            bg="#09090b",
            fg="#71717a"
        )
        self.status.pack(pady=16)

    def increment(self):
        self.value += 1
        self.counter_label.config(text=str(self.value))
        self.status.config(text=f"Value updated to {self.value}")
        print(f"[PyW App] Counter incremented to {self.value}")

    def reset(self):
        self.value = 0
        self.counter_label.config(text="0")
        self.status.config(text="Counter reset to 0")
        print("[PyW App] Counter reset")

def main():
    root = tk.Tk()
    app = Application(root)
    print("[PyW Studio] Application initialized successfully.")
    print("[PyW Studio] Event loop running on Windows Tkinter backend.")
    root.mainloop()

if __name__ == "__main__":
    main()
`;

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-default',
    name: 'DesktopApp',
    description: 'Python GUI application ready for PyInstaller packaging.',
    entryScript: 'main.pyw',
    pythonExecutableId: 'py312-x64',
    environmentMode: 'persistent',
    environmentId: 'env-default',
    requirementsFile: 'requirements.txt',
    outputDirectory: 'dist',
    lastModified: '2026-10-23',
    activeFile: 'main.pyw',
    files: {
      'main.pyw': {
        name: 'main.pyw',
        path: 'main.pyw',
        content: MAIN_PYW_EXAMPLE,
        language: 'python',
        isEntryScript: true,
        isModified: false,
      },
    },
    buildProfiles: [
      {
        id: 'prof-onefile',
        name: 'Production Executable (One-File)',
        mode: 'onefile',
        console: false,
        icon: '',
        outputName: 'DesktopApp.exe',
        outputDir: 'dist',
        cleanBuild: true,
        upxCompression: true,
        hiddenImports: ['tkinter', 'tkinter.ttk'],
        addData: [],
        exclusions: [],
        metadata: {
          fileVersion: '1.0.0.0',
          productVersion: '1.0.0.0',
          companyName: 'Software Publisher',
          fileDescription: 'Desktop Application for Windows',
          copyright: 'Copyright (C) 2026',
          dpiAware: true,
        },
      },
    ],
    activeProfileId: 'prof-onefile',
    installedPackages: [
      { name: 'pyinstaller', version: '6.5.0', latestVersion: '6.11.1', size: '18.4 MB', description: 'Freezes Python applications into standalone executables', installedAt: '2026-10-23', license: 'GPL-2.0', vulnerabilityStatus: 'secure' },
      { name: 'requests', version: '2.31.0', latestVersion: '2.32.3', size: '3.2 MB', description: 'HTTP library for Python', installedAt: '2026-10-23', license: 'Apache-2.0', vulnerabilityStatus: 'secure' },
      { name: 'packaging', version: '24.0', latestVersion: '24.2', size: '1.2 MB', description: 'Core utilities for Python packages', installedAt: '2026-10-23', license: 'Apache-2.0', vulnerabilityStatus: 'secure' },
    ],
  },
];
