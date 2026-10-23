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
  - **Workspace & Cache Cleaner Utility** (multi-threaded file scanner)
  - **Minimal Python Starter**
- Project file bundle export and single-click download.

### 2. 📝 Full-Featured Source Code Editor
- Syntax highlighting tailored for Python.
- Real-time line numbering and active cursor position indicators (Ln, Col, UTF-8 CRLF).
- Multi-tab file switching with unsaved changes tracking (`•`).
- Integrated Find & Replace with live match counts.
- Indentation controls (Tab = 4 spaces, Shift+Tab = unindent, auto-indent on Enter).
- Quick keyboard shortcuts:
  - `Ctrl + S`: Save file
  - `F5` / `Ctrl + R`: Run active script
  - `Ctrl + F`: Find and Replace

### 3. 📦 Dependency & Pip Package Manager
- Isolated virtual environment package manager: ensures project dependencies never pollute the system Python.
- Fast package search and filter across installed packages.
- Install packages directly with version specifiers (e.g., `requests>=2.31.0`, `Pillow>=10.2.0`, `ttkbootstrap`).
- Single-click **Sync from requirements.txt** and **Export to requirements.txt**.
- Inline package upgrade and uninstallation controls.

### 4. ⚙️ Virtual Environments (`venv`) & Interpreter Management
- Select between installed Python versions (Python 3.12, 3.11, 3.10) with automatic architecture and Tkinter availability checks.
- Dual environment isolation modes:
  - **Mode A (Persistent)**: Reuses environment across editing and testing sessions (`%LOCALAPPDATA%/PyWStudio/environments/`).
  - **Mode B (Temporary)**: Dedicated ephemeral environment created specifically for clean PyInstaller production releases.
- Instant virtual environment rebuild and health diagnostics.

### 5. 🔨 PyInstaller Executable Builder (`.exe`)
- Visual GUI configurator for PyInstaller packaging:
  - **One-File Mode** (`--onefile`) vs. **One-Folder Mode** (`--onedir`)
  - **Windowed GUI Mode** (`--windowed` / `--noconsole`) vs. **Console Mode** (`--console`)
  - Custom executable name (`.exe`), output destination (`dist/`), and `.ico` application icon
  - UPX binary compression toggle (reduces executable size by ~30%)
  - Clean build cache option (`--clean`)
  - Advanced options: Hidden imports (`--hidden-import`) and extra data files (`--add-data`)
  - Live `.spec` file generator and preview
- Simulated packaging pipeline with real-time log streaming and verification of the output binary (PE32+ executable check and SHA-256 generation).

### 6. 📜 Build History & Artifact Verification
- Preserves records of previous builds including duration, output path, bundle size, and SHA-256 checksums.
- Inspect full stdout/stderr diagnostic logs from previous builds.
- Direct download for verified packaged executables.

### 7. 🧹 Safe Workspace Cleanup Manager
- Purges temporary PyInstaller staging files, pip wheel caches, and stale temporary environments.
- **Safety Guarantee**: Strictly protects user source files (`.pyw`, `.py`), spec files, assets, and project configurations from ever being modified or deleted during cleanup.

---

## 🚀 Getting Started

### Development Mode

To run PyW Studio locally in development mode:

```bash
npm install
npm run dev
```

The application will start on `http://localhost:3000`.

### Production Build

To build the static production bundle:

```bash
npm run build
npm run preview
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Packaging Simulator**: PyInstaller 6.5.0 specification engine
- **State Persistence**: In-browser local storage with export/import utilities

---

## 📄 License

MIT License. Designed and maintained for modern desktop Python development.
