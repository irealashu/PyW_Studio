# PyW Studio ⚡

> **Modern Desktop Workspace & PyInstaller Packaging Studio for Python Applications**

PyW Studio is a specialized IDE and project lifecycle workspace designed for building, testing, dependency-managing, and packaging Python `.pyw` and `.py` applications into standalone, verified Windows executables (`.exe`) using PyInstaller.

---

## 🌟 Key Features

### 1. 📁 Python Project Explorer & Starter Templates
- Multi-file project workspace with quick file creation, deletion, and renaming.
- Dedicated support for `.pyw` (windowed GUI scripts without console windows) and `.py` entry points.
- Pre-loaded starter templates:
  - **Modern Tkinter / ttk Calculator & Unit Converter** (interactive desktop GUI app)
  - **Retro 2D Breakout Arcade Game** (playable Tkinter Canvas arcade game with real game loop)
  - **Workspace & Cache Cleaner Utility** (multi-threaded file scanner)
  - **Minimal Python Starter**
- Project file bundle export and single-click download.

### 2. 📝 Full-Featured Source Code Editor
- Real-time **Python Syntax & Error Diagnostics**:
  - Automatically flags missing colons on `def`, `class`, `if`, `for`, `while` statements
  - Highlights unclosed parentheses, brackets, and braces
  - Flags mixed tabs and spaces in indentation
  - Gutter warning and error indicators with interactive Problem Drawer
- Real-time line numbering and active cursor position indicators (Ln, Col, UTF-8 CRLF).
- Multi-tab file switching with unsaved changes tracking (`•`).
- Integrated Find & Replace with live match counts.
- Compare with original diff toggle.
- Indentation controls (Tab = 4 spaces, Shift+Tab = unindent, auto-indent on Enter).
- Quick keyboard shortcuts:
  - `Ctrl + S`: Save file
  - `F5` / `Ctrl + R`: Run active script
  - `Ctrl + F`: Find and Replace

### 3. ⌨️ Interactive Python REPL & CLI Console
- Docked terminal includes an interactive `>>>` prompt.
- Execute Python statements and expressions directly (`2 + 2`, `math.sqrt(64)`, `[x*2 for x in range(5)]`).
- Execute CLI commands (`pip list`, `pip install <pkg>`, `pyinstaller -v`, `python -V`, `help`, `clear`).
- Arrow-key command history (Up/Down) for recalling past commands.

### 4. 📦 Dependency & Pip Package Manager
- Isolated virtual environment package manager: ensures project dependencies never pollute system Python.
- Fast package search and filter across installed packages.
- Install packages directly with version specifiers (e.g., `requests>=2.31.0`, `Pillow>=10.2.0`, `ttkbootstrap`).
- Single-click **Sync from requirements.txt** and **Export to requirements.txt**.
- Package licenses (MIT, Apache-2.0, BSD, GPL) and security verification indicators.
- Inline package upgrade and uninstallation controls.

### 5. 🧪 Automated Python Test Runner
- Dedicated **Tests** tab discovering `tests/test_*.py` files in workspace.
- Run `unittest` suites with execution durations, passing/failing badges, and traceback diagnostics.

### 6. ⚙️ Virtual Environments (`venv`) & Interpreter Management
- Select between installed Python versions (Python 3.12, 3.11, 3.10) with automatic architecture and Tkinter availability checks.
- Dual environment isolation modes:
  - **Mode A (Persistent)**: Reuses environment across editing and testing sessions (`%LOCALAPPDATA%/PyWStudio/environments/`).
  - **Mode B (Temporary)**: Dedicated ephemeral environment created specifically for clean PyInstaller production releases.
- Instant virtual environment rebuild and health diagnostics.

### 7. 🔨 PyInstaller Executable Builder (`.exe`)
- **Live PyInstaller CLI Command Preview**: Displays the exact command-line invocation with a one-click **Copy Command** button.
- **Windows PE Metadata & Version Info Editor**: Visual fields for `FileVersion`, `ProductVersion`, `CompanyName`, `FileDescription`, `LegalCopyright`, and Per-Monitor DPI Awareness.
- **Icon Studio & Multi-Resolution Converter**: Select from preset icons or customize multi-resolution ICO layers (16x16, 32x32, 48x48, 256x256) for your `.exe`.
- **Packaging Formats**:
  - **One-File Mode** (`--onefile`) vs. **One-Folder Mode** (`--onedir`)
  - **Windowed GUI Mode** (`--windowed` / `--noconsole`) vs. **Console Mode** (`--console`)
  - Custom executable name (`.exe`), output destination (`dist/`), and `.ico` application icon
  - UPX binary compression toggle (reduces executable size by ~30%)
  - Clean build cache option (`--clean`)
  - Advanced options: Hidden imports (`--hidden-import`) and extra data files (`--add-data`)
  - Live `.spec` file generator and preview
- Simulated packaging pipeline with real-time log streaming and verification of the output binary (PE32+ executable check and SHA-256 generation).

### 8. 🚀 GitHub Actions CI/CD Generator
- Generates production `.github/workflows/build-exe.yml` workflows.
- Automatically compiles Windows `.exe` releases on GitHub runners whenever you push a Git release tag.

### 9. 📜 Build History & Artifact Verification
- Preserves records of previous builds including duration, output path, bundle size, and SHA-256 checksums.
- Inspect full stdout/stderr diagnostic logs from previous builds.
- Direct download for verified packaged executables.

### 10. 🧹 Safe Workspace Cleanup Manager
- Purges temporary PyInstaller staging files, pip wheel caches, and stale temporary environments.
- **Safety Guarantee**: Strictly protects user source files (`.pyw`, `.py`), spec files, assets, and project configurations from ever being modified or deleted during cleanup.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Packaging Simulator**: PyInstaller 6.5.0 specification engine
- **State Persistence**: In-browser local storage with export/import utilities

---

## 📄 License

MIT License. Designed and maintained for modern desktop Python development.
