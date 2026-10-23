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
  {
    id: 'env-arcade',
    name: 'venv_arcade_py312',
    path: '%LOCALAPPDATA%\\PyWStudio\\environments\\venv_arcade_py312',
    pythonVersion: 'Python 3.12.3',
    mode: 'persistent',
    status: 'ready',
    packageCount: 5,
    totalSizeMb: 58.2,
    createdAt: '2026-10-22 11:00:00',
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
        header_frame = tk.Frame(self.root, bg="#1e293b", padx=16, pady=12)
        header_frame.pack(fill=tk.X)
        title_lbl = tk.Label(header_frame, text="⚡ PyW Studio App Demo", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 12, "bold"))
        title_lbl.pack(side=tk.LEFT)
        mode_lbl = tk.Label(header_frame, text="ttk • Standalone", bg="#334155", fg="#cbd5e1", font=("Segoe UI", 9), padx=6, pady=2)
        mode_lbl.pack(side=tk.RIGHT)

        screen_frame = tk.Frame(self.root, bg="#020617", padx=16, pady=16)
        screen_frame.pack(fill=tk.X, padx=16, pady=12)

        self.history_var = tk.StringVar(value="")
        self.history_lbl = ttk.Label(screen_frame, textvariable=self.history_var, style="History.TLabel")
        self.history_lbl.pack(fill=tk.X)

        self.display_var = tk.StringVar(value="0")
        self.display_lbl = ttk.Label(screen_frame, textvariable=self.display_var, style="Display.TLabel")
        self.display_lbl.pack(fill=tk.X, pady=(4, 0))

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

const ARCADE_MAIN = `"""
Retro 2D Breakout Arcade Game
Built with Python Tkinter Canvas - Ready for PyInstaller compilation
"""
import tkinter as tk
import random

class BreakoutGame:
    def __init__(self, root):
        self.root = root
        self.root.title("Retro 2D Arcade - Breakout")
        self.root.geometry("480x420")
        self.root.resizable(False, False)
        self.root.configure(bg="#020617")

        self.canvas = tk.Canvas(self.root, width=480, height=360, bg="#0f172a", highlightthickness=0)
        self.canvas.pack()

        self.paddle = self.canvas.create_rectangle(200, 340, 280, 350, fill="#38bdf8", outline="#7dd3fc")
        self.ball = self.canvas.create_oval(230, 200, 246, 216, fill="#f43f5e", outline="#fda4af")

        self.ball_dx = 3
        self.ball_dy = -3
        self.score = 0
        self.running = True

        self.score_label = tk.Label(self.root, text="Score: 0 | Use Left/Right Arrow Keys", bg="#020617", fg="#94a3b8", font=("Segoe UI", 10))
        self.score_label.pack(pady=8)

        self.create_bricks()
        self.root.bind("<Left>", lambda e: self.move_paddle(-25))
        self.root.bind("<Right>", lambda e: self.move_paddle(25))

        self.game_loop()

    def create_bricks(self):
        self.bricks = []
        colors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#06b6d4"]
        for row in range(5):
            for col in range(8):
                x1 = col * 58 + 10
                y1 = row * 22 + 20
                x2 = x1 + 52
                y2 = y1 + 16
                brick = self.canvas.create_rectangle(x1, y1, x2, y2, fill=colors[row], outline="#1e293b")
                self.bricks.append(brick)

    def move_paddle(self, dx):
        coords = self.canvas.coords(self.paddle)
        if (coords[0] + dx >= 0) and (coords[2] + dx <= 480):
            self.canvas.move(self.paddle, dx, 0)

    def game_loop(self):
        if not self.running:
            return
        self.canvas.move(self.ball, self.ball_dx, self.ball_dy)
        coords = self.canvas.coords(self.ball)

        # Bounce walls
        if coords[0] <= 0 or coords[2] >= 480:
            self.ball_dx = -self.ball_dx
        if coords[1] <= 0:
            self.ball_dy = -self.ball_dy
        if coords[3] >= 360:
            self.running = False
            self.score_label.config(text=f"Game Over! Final Score: {self.score}. Press F5 to restart.")
            print(f"[Arcade] Game ended. Score: {self.score}")
            return

        # Paddle bounce
        paddle_coords = self.canvas.coords(self.paddle)
        if (coords[2] >= paddle_coords[0] and coords[0] <= paddle_coords[2] and
            coords[3] >= paddle_coords[1] and coords[3] <= paddle_coords[3]):
            self.ball_dy = -abs(self.ball_dy)

        # Brick collisions
        for brick in list(self.bricks):
            b_coords = self.canvas.coords(brick)
            if (coords[2] >= b_coords[0] and coords[0] <= b_coords[2] and
                coords[3] >= b_coords[1] and coords[1] <= b_coords[3]):
                self.canvas.delete(brick)
                self.bricks.remove(brick)
                self.ball_dy = -self.ball_dy
                self.score += 10
                self.score_label.config(text=f"Score: {self.score} | Use Left/Right Arrow Keys")
                break

        self.root.after(20, self.game_loop)

if __name__ == "__main__":
    root = tk.Tk()
    game = BreakoutGame(root)
    root.mainloop()
`;

const CALCULATOR_TESTS = `"""
Automated unit tests for Modern Calculator logic
"""
import unittest

def evaluate_math(expr):
    allowed = set("0123456789.+-*/% ")
    if not all(c in allowed for c in expr):
        raise ValueError("Disallowed characters")
    return eval(expr)

class TestCalculatorEngine(unittest.TestCase):
    def test_addition(self):
        self.assertEqual(evaluate_math("12 + 8"), 20)

    def test_multiplication_precedence(self):
        self.assertEqual(evaluate_math("2 + 3 * 4"), 14)

    def test_floating_point(self):
        self.assertAlmostEqual(evaluate_math("0.1 + 0.2"), 0.3, places=5)

    def test_division(self):
        self.assertEqual(evaluate_math("100 / 4"), 25.0)

    def test_syntax_safety(self):
        with self.assertRaises(ValueError):
            evaluate_math("__import__('os')")

if __name__ == '__main__':
    unittest.main()
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
      'tests/test_calculator.py': {
        name: 'test_calculator.py',
        path: 'tests/test_calculator.py',
        content: CALCULATOR_TESTS,
        language: 'python',
        isModified: false,
      },
      'requirements.txt': {
        name: 'requirements.txt',
        path: 'requirements.txt',
        content: `requests>=2.31.0\nPillow>=10.2.0\npyinstaller>=6.5.0\nttkbootstrap>=1.10.1\npackaging>=24.0\n`,
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
        content: `# Modern Calculator (PyW Studio)\n\nA production-ready Windows desktop utility developed in Python using Tkinter / ttk.\n`,
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
        exclusions: ['pytest'],
        metadata: {
          fileVersion: '1.0.0.0',
          productVersion: '1.0.0.0',
          companyName: 'PyW Studio Developer',
          fileDescription: 'Modern Desktop Calculator & Unit Converter',
          copyright: 'Copyright (C) 2026',
          dpiAware: true,
        },
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
        metadata: {
          fileVersion: '1.0.0.0',
          productVersion: '1.0.0.0',
          companyName: 'PyW Studio Developer',
          fileDescription: 'Modern Calculator Debug Build',
          copyright: 'Copyright (C) 2026',
          dpiAware: false,
        },
      },
    ],
    activeProfileId: 'prof-prod-onefile',
    installedPackages: [
      { name: 'pyinstaller', version: '6.5.0', latestVersion: '6.5.0', size: '18.4 MB', description: 'Bundles Python applications into stand-alone executables', installedAt: '2026-10-20', license: 'GPL-2.0', vulnerabilityStatus: 'secure' },
      { name: 'requests', version: '2.31.0', latestVersion: '2.32.1', size: '3.2 MB', description: 'HTTP library for Python, built for human beings', installedAt: '2026-10-20', license: 'Apache-2.0', vulnerabilityStatus: 'secure' },
      { name: 'Pillow', version: '10.2.0', latestVersion: '10.3.0', size: '12.1 MB', description: 'Python Imaging Library friendly fork', installedAt: '2026-10-20', license: 'HPND', vulnerabilityStatus: 'secure' },
      { name: 'ttkbootstrap', version: '1.10.1', latestVersion: '1.10.1', size: '5.6 MB', description: 'Supercharged modern themes for Tkinter / ttk', installedAt: '2026-10-21', license: 'MIT', vulnerabilityStatus: 'secure' },
      { name: 'packaging', version: '24.0', latestVersion: '24.0', size: '1.2 MB', description: 'Core utilities for Python packages', installedAt: '2026-10-20', license: 'Apache-2.0', vulnerabilityStatus: 'secure' },
      { name: 'urllib3', version: '2.2.1', latestVersion: '2.2.1', size: '2.0 MB', description: 'Sanity-friendly HTTP client for Python', installedAt: '2026-10-20', license: 'MIT', vulnerabilityStatus: 'secure' },
    ],
  },
  {
    id: 'proj-arcade',
    name: 'Retro2DArcade',
    description: 'Playable 2D Breakout canvas arcade game built with Tkinter.',
    entryScript: 'arcade.pyw',
    pythonExecutableId: 'py312-x64',
    environmentMode: 'persistent',
    environmentId: 'env-arcade',
    requirementsFile: 'requirements.txt',
    outputDirectory: 'dist',
    lastModified: '2026-10-23 10:15',
    activeFile: 'arcade.pyw',
    files: {
      'arcade.pyw': {
        name: 'arcade.pyw',
        path: 'arcade.pyw',
        content: ARCADE_MAIN,
        language: 'python',
        isEntryScript: true,
        isModified: false,
      },
      'requirements.txt': {
        name: 'requirements.txt',
        path: 'requirements.txt',
        content: `pyinstaller>=6.5.0\npygame>=2.5.2\n`,
        language: 'text',
        isModified: false,
      },
    },
    buildProfiles: [
      {
        id: 'prof-arcade-onefile',
        name: 'Arcade Game Release',
        mode: 'onefile',
        console: false,
        icon: '',
        outputName: 'Retro2DArcade.exe',
        outputDir: 'dist',
        cleanBuild: true,
        upxCompression: true,
        hiddenImports: ['tkinter'],
        addData: [],
        exclusions: [],
        metadata: {
          fileVersion: '1.2.0.0',
          productVersion: '1.2.0.0',
          companyName: 'Arcade Studio',
          fileDescription: 'Retro 2D Breakout Arcade Game',
          copyright: 'Copyright (C) 2026',
          dpiAware: true,
        },
      },
    ],
    activeProfileId: 'prof-arcade-onefile',
    installedPackages: [
      { name: 'pyinstaller', version: '6.5.0', latestVersion: '6.5.0', size: '18.4 MB', description: 'Packaging engine', installedAt: '2026-10-22', license: 'GPL-2.0', vulnerabilityStatus: 'secure' },
      { name: 'pygame', version: '2.5.2', latestVersion: '2.5.2', size: '28.1 MB', description: 'Python game development library', installedAt: '2026-10-22', license: 'LGPL', vulnerabilityStatus: 'secure' },
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
        metadata: {
          fileVersion: '2.1.0.0',
          productVersion: '2.1.0.0',
          companyName: 'PyW Tools',
          fileDescription: 'Workspace & PyInstaller Cache Cleaner',
          copyright: 'Copyright (C) 2026',
          dpiAware: true,
        },
      },
    ],
    activeProfileId: 'prof-cleaner-onefile',
    installedPackages: [
      { name: 'pyinstaller', version: '6.5.0', latestVersion: '6.5.0', size: '18.4 MB', description: 'Bundles Python applications into stand-alone executables', installedAt: '2026-10-21', license: 'GPL-2.0', vulnerabilityStatus: 'secure' },
      { name: 'psutil', version: '5.9.8', latestVersion: '5.9.8', size: '4.8 MB', description: 'Cross-platform lib for process and system monitoring', installedAt: '2026-10-21', license: 'BSD-3-Clause', vulnerabilityStatus: 'secure' },
      { name: 'colorama', version: '0.4.6', latestVersion: '0.4.6', size: '450 KB', description: 'Cross-platform colored terminal text', installedAt: '2026-10-21', license: 'BSD-3-Clause', vulnerabilityStatus: 'secure' },
    ],
  },
];
