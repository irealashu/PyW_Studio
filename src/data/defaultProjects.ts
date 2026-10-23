import { Project, PythonInterpreter, VirtualEnvironment } from '../types';

export const DEFAULT_INTERPRETERS: PythonInterpreter[] = [
  {
    id: 'py312-x64',
    name: 'Python 3.12.3 (64-bit)',
    version: '3.12.3',
    path: 'C:\\Users\\Developer\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',
    arch: 'win_amd64',
    tkinterAvailable: true,
    isValid: true,
  },
  {
    id: 'py311-x64',
    name: 'Python 3.11.8 (64-bit)',
    version: '3.11.8',
    path: 'C:\\Users\\Developer\\AppData\\Local\\Programs\\Python\\Python311\\python.exe',
    arch: 'win_amd64',
    tkinterAvailable: true,
    isValid: true,
  },
  {
    id: 'py310-x64',
    name: 'Python 3.10.12 (64-bit)',
    version: '3.10.12',
    path: 'C:\\Python310\\python.exe',
    arch: 'win_amd64',
    tkinterAvailable: true,
    isValid: true,
  },
];

export const INITIAL_ENVIRONMENTS: VirtualEnvironment[] = [
  {
    id: 'env-calculator',
    name: 'venv_calculator_py312',
    path: '%LOCALAPPDATA%\\PyWStudio\\environments\\venv_calculator_py312',
    pythonVersion: 'Python 3.12.3',
    mode: 'persistent',
    status: 'ready',
    packageCount: 6,
    totalSizeMb: 42.5,
    createdAt: '2026-10-20 14:22:00',
    isLocked: false,
  },
  {
    id: 'env-system-cleaner',
    name: 'venv_cleaner_py312',
    path: '%LOCALAPPDATA%\\PyWStudio\\environments\\venv_cleaner_py312',
    pythonVersion: 'Python 3.12.3',
    mode: 'persistent',
    status: 'ready',
    packageCount: 4,
    totalSizeMb: 36.1,
    createdAt: '2026-10-21 09:15:30',
    isLocked: false,
  },
];

const TKINTER_CALCULATOR_MAIN = `"""
Modern Python Tkinter Desktop Utility
Built with Tkinter / ttk - Ready for PyInstaller packaging via PyW Studio
"""
import sys
import math
import tkinter as tk
from tkinter import ttk, messagebox

class CalculatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Modern Calculator & Unit Converter")
        self.root.geometry("420x560")
        self.root.minsize(380, 500)
        self.root.configure(bg="#0f172a")

        self.expression = ""
        self.history = []
        self.create_styles()
        self.create_widgets()

    def create_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TLabel", background="#0f172a", foreground="#f8fafc")
        style.configure("Display.TLabel", font=("Segoe UI", 24, "bold"), anchor="e")
        style.configure("History.TLabel", font=("Segoe UI", 11), foreground="#94a3b8", anchor="e")

    def create_widgets(self):
        # Header frame
        header_frame = tk.Frame(self.root, bg="#1e293b", padx=16, pady=12)
        header_frame.pack(fill=tk.X)
        title_lbl = tk.Label(header_frame, text="⚡ PyW Studio App Demo", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 12, "bold"))
        title_lbl.pack(side=tk.LEFT)
        mode_lbl = tk.Label(header_frame, text="ttk • Standalone", bg="#334155", fg="#cbd5e1", font=("Segoe UI", 9), padx=6, pady=2)
        mode_lbl.pack(side=tk.RIGHT)

        # Display screen
        screen_frame = tk.Frame(self.root, bg="#020617", padx=16, pady=16)
        screen_frame.pack(fill=tk.X, padx=16, pady=12)

        self.history_var = tk.StringVar(value="")
        self.history_lbl = ttk.Label(screen_frame, textvariable=self.history_var, style="History.TLabel")
        self.history_lbl.pack(fill=tk.X)

        self.display_var = tk.StringVar(value="0")
        self.display_lbl = ttk.Label(screen_frame, textvariable=self.display_var, style="Display.TLabel")
        self.display_lbl.pack(fill=tk.X, pady=(4, 0))

        # Keypad Grid
        btn_frame = tk.Frame(self.root, bg="#0f172a")
        btn_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=8)

        buttons = [
            [("C", "#ef4444", self.clear), ("DEL", "#64748b", self.backspace), ("%", "#64748b", lambda: self.append_op("%")), ("÷", "#0284c7", lambda: self.append_op("/"))],
            [("7", "#334155", lambda: self.append_char("7")), ("8", "#334155", lambda: self.append_char("8")), ("9", "#334155", lambda: self.append_char("9")), ("×", "#0284c7", lambda: self.append_op("*"))],
            [("4", "#334155", lambda: self.append_char("4")), ("5", "#334155", lambda: self.append_char("5")), ("6", "#334155", lambda: self.append_char("6")), ("-", "#0284c7", lambda: self.append_op("-"))],
            [("1", "#334155", lambda: self.append_char("1")), ("2", "#334155", lambda: self.append_char("2")), ("3", "#334155", lambda: self.append_char("3")), ("+", "#0284c7", lambda: self.append_op("+"))],
            [("±", "#334155", self.toggle_sign), ("0", "#334155", lambda: self.append_char("0")), (".", "#334155", lambda: self.append_char(".")), ("=", "#10b981", self.calculate)],
        ]

        for r, row in enumerate(buttons):
            btn_frame.rowconfigure(r, weight=1)
            for c, (text, color, cmd) in enumerate(row):
                btn_frame.columnconfigure(c, weight=1)
                btn = tk.Button(
                    btn_frame,
                    text=text,
                    font=("Segoe UI", 13, "bold"),
                    bg=color,
                    fg="#ffffff",
                    activebackground="#475569",
                    activeforeground="#ffffff",
                    relief=tk.FLAT,
                    bd=0,
                    command=cmd,
                    cursor="hand2"
                )
                btn.grid(row=r, column=c, padx=4, pady=4, sticky="nsew")

    def append_char(self, char):
        if self.expression == "0" and char != ".":
            self.expression = char
        else:
            self.expression += char
        self.display_var.set(self.expression)

    def append_op(self, op):
        if not self.expression and op == "-":
            self.expression = "-"
        elif self.expression and self.expression[-1] not in "+-*/%":
            self.expression += op
        self.display_var.set(self.expression)

    def clear(self):
        self.expression = ""
        self.history_var.set("")
        self.display_var.set("0")

    def backspace(self):
        self.expression = self.expression[:-1]
        self.display_var.set(self.expression if self.expression else "0")

    def toggle_sign(self):
        if self.expression:
            if self.expression.startswith("-"):
                self.expression = self.expression[1:]
            else:
                self.expression = "-" + self.expression
            self.display_var.set(self.expression)

    def calculate(self):
        if not self.expression:
            return
        try:
            # Safe evaluation for basic math expression
            allowed = set("0123456789.+-*/% ")
            if not all(c in allowed for c in self.expression):
                raise ValueError("Disallowed characters")
            result = eval(self.expression)
            formatted = f"{result:.8g}" if isinstance(result, float) else str(result)
            self.history_var.set(f"{self.expression} =")
            self.display_var.set(formatted)
            self.expression = formatted
        except Exception as e:
            self.display_var.set("Error")
            self.expression = ""

def main():
    root = tk.Tk()
    app = CalculatorApp(root)
    print("[PyW Studio] Application initialized successfully.")
    print("[PyW Studio] Event loop started on Windows Tkinter backend.")
    root.mainloop()

if __name__ == "__main__":
    main()
`;

const CLEANER_MAIN = `"""
PyW Studio - System Disk & Cache Utility
Demonstrates multi-threaded scanning and Tkinter progressbars.
"""
import os
import sys
import time
import tkinter as tk
from tkinter import ttk, messagebox

class DiskCleanerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("PyW Cache & Workspace Cleaner")
        self.root.geometry("520x440")
        self.root.configure(bg="#0f172a")

        self.build_ui()

    def build_ui(self):
        banner = tk.Label(self.root, text="System & PyInstaller Cache Cleaner", font=("Segoe UI", 14, "bold"), bg="#0f172a", fg="#38bdf8")
        banner.pack(pady=16)

        self.tree = ttk.Treeview(self.root, columns=("item", "size", "status"), show="headings", height=8)
        self.tree.heading("item", text="Target Directory")
        self.tree.heading("size", text="Cache Size")
        self.tree.heading("status", text="Safety Level")
        self.tree.pack(fill=tk.BOTH, expand=True, padx=20, pady=8)

        # Mock initial items
        self.tree.insert("", tk.END, values=("%TEMP%/pyinstaller_builds", "148 MB", "Safe to remove"))
        self.tree.insert("", tk.END, values=("%LOCALAPPDATA%/PyWStudio/cache", "84 MB", "Safe to remove"))
        self.tree.insert("", tk.END, values=("Project/build/dist_temp", "32 MB", "Generated intermediate"))

        self.status_lbl = tk.Label(self.root, text="Ready. Click Scan to recheck directories.", bg="#0f172a", fg="#94a3b8")
        self.status_lbl.pack(pady=8)

        btn_row = tk.Frame(self.root, bg="#0f172a")
        btn_row.pack(pady=12)

        scan_btn = tk.Button(btn_row, text="🔍 Scan Caches", bg="#0284c7", fg="#fff", font=("Segoe UI", 10, "bold"), padx=12, pady=6, command=self.scan)
        scan_btn.pack(side=tk.LEFT, padx=8)

        clean_btn = tk.Button(btn_row, text="🗑️ Clean Safe Items", bg="#10b981", fg="#fff", font=("Segoe UI", 10, "bold"), padx=12, pady=6, command=self.clean)
        clean_btn.pack(side=tk.LEFT, padx=8)

    def scan(self):
        self.status_lbl.config(text="Scanning workspace and PyInstaller build cache...")
        print("[PyW Studio] Running disk scan on managed directories...")
        print("[PyW Studio] Total safe reclaimable space: 264 MB")
        self.status_lbl.config(text="Scan complete: 264 MB can be safely cleaned.")

    def clean(self):
        messagebox.showinfo("PyW Studio Cleaner", "Cleaned 264 MB from PyInstaller staging cache safely.")
        print("[PyW Studio] Temporary cache purged successfully.")

if __name__ == "__main__":
    root = tk.Tk()
    app = DiskCleanerApp(root)
    root.mainloop()
`;

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-calc',
    name: 'ModernCalculator',
    description: 'Modern desktop calculator & unit converter built with Tkinter / ttk.',
    entryScript: 'main.pyw',
    pythonExecutableId: 'py312-x64',
    environmentMode: 'persistent',
    environmentId: 'env-calculator',
    requirementsFile: 'requirements.txt',
    outputDirectory: 'dist',
    lastModified: '2026-10-23 09:10',
    activeFile: 'main.pyw',
    files: {
      'main.pyw': {
        name: 'main.pyw',
        path: 'main.pyw',
        content: TKINTER_CALCULATOR_MAIN,
        language: 'python',
        isEntryScript: true,
        isModified: false,
      },
      'requirements.txt': {
        name: 'requirements.txt',
        path: 'requirements.txt',
        content: `requests>=2.31.0
Pillow>=10.2.0
pyinstaller>=6.5.0
ttkbootstrap>=1.10.1
packaging>=24.0
`,
        language: 'text',
        isModified: false,
      },
      'config/pywstudio.json': {
        name: 'pywstudio.json',
        path: 'config/pywstudio.json',
        content: `{
  "schema_version": 1,
  "name": "ModernCalculator",
  "entry_script": "main.pyw",
  "python_executable": "Python 3.12.3 (64-bit)",
  "environment_mode": "persistent",
  "environment_id": "env-calculator",
  "requirements_file": "requirements.txt",
  "output_directory": "dist",
  "build_profiles": {
    "Production GUI (One-file)": {
      "mode": "onefile",
      "console": false,
      "icon": "assets/app.ico",
      "clean_build": true
    }
  }
}`,
        language: 'json',
        isModified: false,
      },
      'README.md': {
        name: 'README.md',
        path: 'README.md',
        content: `# Modern Calculator (PyW Studio)

A production-ready Windows desktop utility developed in Python using Tkinter / ttk.

## Project Structure
- \`main.pyw\`: Application entry script (launches windowed without console)
- \`requirements.txt\`: Pinned dependencies for isolated virtual environment
- \`config/pywstudio.json\`: PyW Studio project metadata & PyInstaller build profiles

## Packaging as Standalone Executable (.exe)
1. In PyW Studio, open the **PyInstaller EXE Builder** tab.
2. Select **One-File Mode** (\`--onefile\`) and **GUI Mode** (\`--noconsole\`).
3. Click **Build Standalone Executable**.
4. The output will be verified and stored in \`dist/ModernCalculator.exe\`.
`,
        language: 'markdown',
        isModified: false,
      },
    },
    buildProfiles: [
      {
        id: 'prof-prod-onefile',
        name: 'Production GUI (One-File)',
        mode: 'onefile',
        console: false,
        icon: 'assets/app.ico',
        outputName: 'ModernCalculator.exe',
        outputDir: 'dist',
        cleanBuild: true,
        upxCompression: true,
        hiddenImports: ['tkinter', 'tkinter.ttk', 'math'],
        addData: ['assets;assets'],
        exclusions: ['pytest', 'unittest'],
      },
      {
        id: 'prof-debug-console',
        name: 'Debug Console Build',
        mode: 'onefile',
        console: true,
        icon: 'assets/app.ico',
        outputName: 'ModernCalculator_Debug.exe',
        outputDir: 'dist',
        cleanBuild: false,
        upxCompression: false,
        hiddenImports: ['tkinter', 'tkinter.ttk'],
        addData: [],
        exclusions: [],
      },
      {
        id: 'prof-onedir',
        name: 'Portable Directory Distribution',
        mode: 'onedir',
        console: false,
        icon: 'assets/app.ico',
        outputName: 'ModernCalculator_Bundle',
        outputDir: 'dist',
        cleanBuild: true,
        upxCompression: false,
        hiddenImports: ['tkinter', 'tkinter.ttk'],
        addData: ['assets;assets'],
        exclusions: [],
      },
    ],
    activeProfileId: 'prof-prod-onefile',
    installedPackages: [
      { name: 'pyinstaller', version: '6.5.0', latestVersion: '6.5.0', size: '18.4 MB', description: 'Bundles Python applications into stand-alone executables', installedAt: '2026-10-20' },
      { name: 'requests', version: '2.31.0', latestVersion: '2.32.1', size: '3.2 MB', description: 'HTTP library for Python, built for human beings', installedAt: '2026-10-20' },
      { name: 'Pillow', version: '10.2.0', latestVersion: '10.3.0', size: '12.1 MB', description: 'Python Imaging Library friendly fork', installedAt: '2026-10-20' },
      { name: 'ttkbootstrap', version: '1.10.1', latestVersion: '1.10.1', size: '5.6 MB', description: 'Supercharged modern themes for Tkinter / ttk', installedAt: '2026-10-21' },
      { name: 'packaging', version: '24.0', latestVersion: '24.0', size: '1.2 MB', description: 'Core utilities for Python packages', installedAt: '2026-10-20' },
      { name: 'urllib3', version: '2.2.1', latestVersion: '2.2.1', size: '2.0 MB', description: 'Sanity-friendly HTTP client for Python', installedAt: '2026-10-20' },
    ],
  },
  {
    id: 'proj-cleaner',
    name: 'WorkspaceCleaner',
    description: 'System disk, cache, and temporary build file inspector.',
    entryScript: 'cleaner.pyw',
    pythonExecutableId: 'py312-x64',
    environmentMode: 'persistent',
    environmentId: 'env-system-cleaner',
    requirementsFile: 'requirements.txt',
    outputDirectory: 'dist',
    lastModified: '2026-10-22 18:40',
    activeFile: 'cleaner.pyw',
    files: {
      'cleaner.pyw': {
        name: 'cleaner.pyw',
        path: 'cleaner.pyw',
        content: CLEANER_MAIN,
        language: 'python',
        isEntryScript: true,
        isModified: false,
      },
      'requirements.txt': {
        name: 'requirements.txt',
        path: 'requirements.txt',
        content: `pyinstaller>=6.5.0\npsutil>=5.9.8\ncolorama>=0.4.6\n`,
        language: 'text',
        isModified: false,
      },
    },
    buildProfiles: [
      {
        id: 'prof-cleaner-onefile',
        name: 'Production GUI',
        mode: 'onefile',
        console: false,
        icon: '',
        outputName: 'WorkspaceCleaner.exe',
        outputDir: 'dist',
        cleanBuild: true,
        upxCompression: true,
        hiddenImports: ['psutil'],
        addData: [],
        exclusions: [],
      },
    ],
    activeProfileId: 'prof-cleaner-onefile',
    installedPackages: [
      { name: 'pyinstaller', version: '6.5.0', latestVersion: '6.5.0', size: '18.4 MB', description: 'Bundles Python applications into stand-alone executables', installedAt: '2026-10-21' },
      { name: 'psutil', version: '5.9.8', latestVersion: '5.9.8', size: '4.8 MB', description: 'Cross-platform lib for process and system monitoring', installedAt: '2026-10-21' },
      { name: 'colorama', version: '0.4.6', latestVersion: '0.4.6', size: '450 KB', description: 'Cross-platform colored terminal text', installedAt: '2026-10-21' },
    ],
  },
];
