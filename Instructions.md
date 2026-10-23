# PyW Studio
# Project Requirements and Master Development Instructions

Project type: Windows desktop application
Primary language: Python
GUI framework: Tkinter / ttk
Application format: .pyw
Packaging engine: PyInstaller
Environment strategy: Isolated virtual environments per project
Document version: 2.0

## 1. Product overview

PyW Studio is a desktop application for creating, editing, testing, packaging, and managing Python projects. It is designed for Windows users who want a beginner-friendly workflow without sacrificing [...]

The application should help users:
- create and open Python projects
- edit source files with a built-in editor
- configure project-specific interpreters and environments
- install, upgrade, inspect, and remove dependencies
- run scripts safely in their project context
- build one-file or one-folder executables with PyInstaller
- view build logs and reports
- clean up temporary artifacts safely
- reopen projects and preserve their configuration

This tool is not just a project template. It is a practical desktop workspace for project lifecycle management.

## 2. Non-negotiable design principles

The application must follow these design principles:
- Isolation: project packages must never be installed into the system Python
- Persistence: project settings must survive restarts
- Safety: user source files and project files must never be deleted during cleanup or packaging
- Transparency: all commands, logs, errors, and status updates should be visible
- Reliability: long-running tasks must run in background threads or processes
- Usability: normal users should not need to hand-write Python packaging commands
- Portability: the app should remain easy to run as a `.pyw` script and later package as an executable
- Extensibility: modules should be separated so new features and packaging engines can be added later

## 3. Functional requirements

### 3.1 Project management

The application must provide:
- project creation from a starter template
- opening existing `.pyw` and `.py` files
- opening an existing project folder and selecting an entry script
- project rename, duplicate, and import workflows
- support for multiple files in a single project
- project metadata storage in a validated config file
- recent project tracking
- file navigation and source-folder opening in the system file manager
- active script execution from the GUI
- project-level display of current interpreter and environment state
- unsaved-change detection and Save/Save As support

Recommended project structure:

MyProject/
├── app/
│   ├── main.pyw
│   ├── assets/
│   ├── modules/
│   ├── ui/
│   └── tests/
├── config/
│   ├── pywstudio.json
│   └── requirements.txt
├── dist/
├── docs/
├── build/
├── logs/
├── README.md
├── .gitignore
└── .env.example

This structure keeps application source and generated output clearly separated. The project root should remain user-owned and readable; the app should never treat generated or managed files as source files unless explicitly configured to do so.

The environment, build cache, and temporary generated files should normally live outside the project source directory.

Use a clear separation between source content and managed runtime data:

MyProject/                     # user-owned project source tree
├── app/
│   ├── main.pyw
│   ├── assets/
│   ├── modules/
│   ├── ui/
│   └── tests/
├── config/
│   ├── pywstudio.json
│   └── requirements.txt
├── dist/
├── docs/
├── README.md
└── .gitignore

%LOCALAPPDATA%/PyWStudio/      # app-managed workspace, not inside the project folder
├── environments/
├── cache/
├── staging/
├── builds/
├── logs/
├── reports/
├── config/
├── temp/
└── state/

This separation keeps user project files safe and makes cleanup rules simpler and more reliable.

### 3.2 Source editor

The initial editor must support:
- line numbers
- syntax highlighting for Python
- line wrapping toggle
- search and replace
- undo and redo
- indentation and tab configuration
- keyboard shortcuts
- automatic indentation
- status information: line, column, encoding
- unsaved-change indicators
- configurable font and theme
- file encoding selection
- basic bracket matching

Implementation note: use Tkinter's `Text` widget for the initial build. Keep the editor modular so a more advanced editor can later replace it without rewriting the whole app.

Do not claim support for features that are not actually implemented.

### 3.3 Dependency manager

Dependency management must be project-specific.

Required functionality:
- list installed packages and versions
- install one or multiple packages
- upgrade packages
- uninstall packages
- refresh installed package data
- import dependencies from `requirements.txt`
- export pinned versions to `requirements.txt`
- detect missing dependencies when possible
- show installation output and errors
- allow package version selection or constraint specification
- support optional package indexes and proxies
- expose editable installs only through an explicit advanced option
- show the interpreter and environment used by the active project

Example valid dependency entries:

requests>=2.31
Pillow>=10.0
pandas
python-dateutil

Requirements parsing must:
- handle comments
- handle version specifiers
- accept standard pip requirement syntax
- avoid using shell execution to interpret package input

Use subprocess argument lists, not string-built shell commands.

### 3.4 Python interpreter management

The application must let users:
- select an installed Python executable
- detect the current interpreter if applicable
- display version and architecture
- validate that the interpreter works
- check whether Tkinter is available when needed
- use a different interpreter for each project
- store interpreter configuration in project metadata
- display helpful error messages when a configured interpreter is missing

The app must not assume that the interpreter running PyW Studio is the correct interpreter for every project.

### 3.5 Virtual environment manager

Every project must have a clear environment configuration.

Two environment modes should be supported:

Mode A — Persistent project environment
- reuses the same environment across sessions
- stores the environment in the managed application cache
- re-installs packages only when requested
- permits manual removal

Mode B — Temporary build environment
- creates a dedicated virtual environment for a build
- installs the project dependencies
- installs the selected PyInstaller version
- runs the build
- keeps the final executable and build report
- removes temporary build files after a successful build if configured
- deletes the temporary environment only when lifecycle rules permit it

Environment requirements:
- use `venv` for environment creation
- support selecting a compatible Python interpreter
- verify the interpreter can create virtual environments
- verify `pip` availability
- display environment location, Python version, and package count
- track environment ownership in metadata
- avoid deleting environments used by active tasks
- require explicit confirmation before environment deletion
- clean stale environments only after ownership and active-operation checks

Important: Python virtual environments are not portable across machines. The final executable must be built for the target OS and architecture.

### 3.6 PyInstaller executable builder

The builder must support:

Basic options:
- one-file mode: `--onefile`
- one-folder mode: `--onedir`
- GUI app: `--windowed` or `--noconsole`
- console app: keep console output visible
- custom executable name
- custom `.ico` icon
- output directory
- clean PyInstaller build cache
- optional UPX support if installed and explicitly enabled
- verbose build logging

Advanced options:
- additional data files/directories
- additional binary files
- hidden imports
- exclusions
- runtime hooks
- extra import paths
- environment variables for the build
- version metadata and Windows metadata
- optional manifest settings
- custom spec-file support
- visible advanced arguments section with validation

The default UI should not require users to understand PyInstaller command-line syntax.

Build workflow:
- validate the project and entry script
- save pending source changes
- validate the selected interpreter
- create or select the isolated environment
- install or verify required dependencies
- install or verify PyInstaller in that environment
- generate a build configuration
- execute PyInstaller using the environment's Python executable
- stream stdout and stderr into the application log
- detect cancellation, failure, and success
- verify the expected output exists
- copy or move the final artifact to the selected output directory
- generate a build report
- clean temporary artifacts according to policy
- display the final artifact path and offer to open it

A successful exit code alone is not proof that the desired executable exists.

### 3.7 Build profiles

Allow users to save multiple named profiles per project.

Example profiles:
- Development GUI
- Production GUI
- Debug Console
- Portable One-File
- Directory Distribution

Each profile should preserve:
- Python interpreter
- PyInstaller version or version policy
- entry script
- executable name
- one-file or one-folder mode
- console setting
- icon
- output directory
- data files
- hidden imports
- exclusions
- extra build settings
- cleanup preferences

Profiles should be saved in project metadata or a dedicated profiles directory.

### 3.8 Logging and task management

The application must display:
- current operation
- current project
- current environment
- start time and duration
- command being executed
- live process output
- warnings
- errors
- completion status
- final output paths

Controls must be provided for:
- cancel operation
- clear visible log
- save log to file
- open the log directory
- view the last build report
- inspect the previous failed build

Operational requirements:
- long-running tasks must run outside Tkinter's main thread
- all UI updates must be scheduled on the Tkinter event loop
- worker threads must never directly mutate widgets
- cancellation must terminate the process and child processes, where appropriate
- cleanup must not run while files are still in use

### 3.9 Cleanup manager

Cleanup operations must be clearly separated.

Build cleanup may remove:
- temporary PyInstaller work directories
- generated spec files that are not user-owned
- temporary staging directories
- temporary build virtual environments after successful completion, if selected

Environment cleanup may remove:
- environments explicitly owned by PyW Studio
- unused package caches created by the app
- stale environment metadata after verification

Project cleanup may remove only explicitly selected generated files and folders.

The app must never automatically delete:
- original `.pyw` or `.py` files
- user-created modules
- assets
- user-authored spec files
- project configuration
- requirements files
- arbitrary directories outside the managed workspace

Every deletion target must be validated using canonical paths and ownership metadata. Destructive operations must require confirmation.

## 4. User experience and interface design

### 4.1 Main window

Recommended layout:

+--------------------------------------------------------------+
| PyW Studio                 Project     Settings     Help     |
+--------------------------------------------------------------+
| New | Open | Save | Run | Build EXE | Cancel                |
+----------------------+---------------------------------------+
| PROJECT EXPLORER     | SOURCE EDITOR                         |
|                      |                                       |
| main.pyw             | Python source                         |
| requirements.txt     |                                       |
| assets/              |                                       |
| modules/             |                                       |
+----------------------+---------------------------------------+
| Dependencies | Environment | Build Profiles | Build History |
+--------------------------------------------------------------+
| Live output and task log                                     |
+--------------------------------------------------------------+
| Current interpreter       Environment       Task status      |
+--------------------------------------------------------------+

### 4.2 Screens
- Dashboard
- Project Manager
- Editor
- Dependencies
- Environments
- EXE Builder
- Build History
- Settings

### 4.3 Visual style

Use a professional desktop look:
- light and dark themes where practical
- consistent spacing
- clear labels and tooltips
- accessible font sizes
- distinct primary and secondary actions
- status indicators for running, success, cancelled, and failed tasks
- resizable panels
- keyboard shortcuts
- non-blocking progress indicators

Tkinter and ttk should remain the baseline UI dependencies. Avoid making third-party GUI libraries mandatory.

## 5. Technical architecture

### 5.1 Recommended technology stack
- Python 3.11 or an equivalent supported release
- Tkinter and ttk for the GUI
- venv for environment creation
- subprocess for pip and PyInstaller
- threading and queue for background tasks
- pathlib for filesystem operations
- json for project and application configuration
- logging for persistent logs
- unittest for tests
- PyInstaller for packaging generated applications

The app should not require external packages to launch the main GUI.

### 5.2 Suggested project layout

Use a consistent top-level structure so source code, tests, and managed runtime data are clearly separated.

pyw_studio/
├── main.pyw
├── README.md
├── LICENSE
├── requirements-dev.txt
├── pywstudio/
│   ├── __init__.py
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── project_manager.py
│   ├── editor.py
│   ├── dependency_manager.py
│   ├── environment_manager.py
│   ├── interpreter_manager.py
│   ├── build_manager.py
│   ├── task_manager.py
│   ├── cleanup_manager.py
│   ├── logging_manager.py
│   └── ui/
│       ├── __init__.py
│       ├── dashboard.py
│       ├── projects_view.py
│       ├── dependencies_view.py
│       ├── environments_view.py
│       ├── builder_view.py
│       ├── history_view.py
│       └── settings_view.py
├── tests/
│   ├── test_project_manager.py
│   ├── test_environment_manager.py
│   ├── test_dependency_manager.py
│   ├── test_build_manager.py
│   └── test_cleanup_manager.py
├── docs/
│   ├── architecture.md
│   └── user_guide.md
├── samples/
│   └── example_project/
├── .gitignore
├── .editorconfig
└── scripts/
    ├── bootstrap.py
    └── dev_setup.py

The repository itself should separate application code from user-facing samples, test fixtures, and documentation. This keeps future refactors and packaging tasks easier to manage.

Recommended module grouping:

pywstudio/
├── app/
│   ├── __init__.py
│   └── main.pyw
├── core/
│   ├── __init__.py
│   ├── config.py
│   ├── models.py
│   └── settings.py
├── managers/
│   ├── __init__.py
│   ├── project_manager.py
│   ├── dependency_manager.py
│   ├── environment_manager.py
│   ├── interpreter_manager.py
│   ├── build_manager.py
│   ├── cleanup_manager.py
│   └── task_manager.py
├── ui/
│   ├── __init__.py
│   ├── dashboard.py
│   ├── projects_view.py
│   ├── dependencies_view.py
│   ├── environments_view.py
│   ├── builder_view.py
│   ├── history_view.py
│   └── settings_view.py
├── services/
│   ├── __init__.py
│   ├── editor_service.py
│   ├── logging_service.py
│   └── process_service.py
├── storage/
│   ├── __init__.py
│   ├── project_store.py
│   └── profile_store.py
└── __init__.py

If this layout is adopted, each module should be responsible for a single concern, and UI code should not perform filesystem logic directly.

The initial implementation may be a single `.pyw` file, but production code should be modular and testable.

### 5.3 Project metadata

Example `pywstudio.json`:

{
  "schema_version": 1,
  "name": "MyProject",
  "entry_script": "main.pyw",
  "python_executable": "",
  "environment_mode": "persistent",
  "environment_id": "myproject",
  "requirements_file": "requirements.txt",
  "output_directory": "dist",
  "build_profiles": {
    "Production GUI": {
      "mode": "onefile",
      "console": false,
      "icon": "",
      "clean_build": true
    }
  }
}

Validate schema on load. Preserve unknown fields where practical. Write changes atomically to reduce the risk of configuration corruption.

### 5.4 Filesystem locations

Use an app-specific managed directory, ideally within the platform's local application data directory.

Recommended separation:

PyWStudio/
├── config/
├── environments/
├── staging/
├── builds/
├── logs/
├── cache/
├── reports/
├── temp/
├── state/
└── profiles/

Project source directories should remain distinct from managed application directories. The app should never write project metadata, packages, or generated build artifacts into the source tree unless the user explicitly chooses a project-local output folder.

The project source directory must remain distinct from managed application directories.

Persistent app settings should live in a user config directory rather than only in the OS temp folder.

This layout makes the distinction explicit:

- Project directory: user-authored source files and project metadata
- Managed app directory: generated environments, reports, logs, caches, builds, and temp data
- Build output directory: user-visible artifact destination, usually inside the project or an explicit output folder

### 5.5 Process execution rules

Every external command must:
- use a list of arguments, not `shell=True`
- use the intended interpreter explicitly
- use a controlled working directory
- capture stdout and stderr
- handle process exit codes
- handle cancellation correctly
- avoid blocking the GUI
- record executable and arguments for troubleshooting
- avoid logging credentials or sensitive environment values

Use a subprocess supervisor capable of terminating child processes when needed, especially on Windows.

Do not install packages using the interpreter running PyW Studio unless the user explicitly selects that interpreter as the target environment.

## 6. Implementation roadmap

### Phase 1 — Foundation
Establish the project structure.
Create the Tkinter application shell.
Implement settings and logging.
Implement the project metadata model.
Create and open `.pyw` and `.py` projects.
Implement safe saving and unsaved-change handling.

Completion criterion: users can create, edit, save, reopen, and run a basic project.

### Phase 2 — Environment management
Add interpreter selection and validation.
Create isolated virtual environments.
Store environment ownership metadata.
Add inspection and removal workflows.
Add operation locks and cleanup protections.

Completion criterion: packages installed for one project do not alter the system Python or another project's environment.

### Phase 3 — Dependency management
Install packages.
Upgrade and uninstall packages.
List package versions.
Read and write requirements files.
Display installation progress and errors.

Completion criterion: a user can reproduce a project's Python dependencies using its configured interpreter and requirements file.

### Phase 4 — Executable builder
Integrate PyInstaller.
Support one-file and one-folder builds.
Add GUI and console modes.
Add icon, naming, and output options.
Support hidden imports and data files.
Add staging, artifact verification, and build reports.

Completion criterion: a simple GUI script can be packaged into an executable and build errors are displayed clearly.

### Phase 5 — Build profiles and history
Save named profiles.
Maintain build history.
Record environment and package versions.
Save logs and reports.
Add artifact opening and rebuilding.

Completion criterion: users can repeat a prior build without re-entering settings manually.

### Phase 6 — Reliability and safety
Implement robust cancellation.
Improve process cleanup.
Validate deletion paths.
Add failure recovery.
Add disk-usage reporting.
Handle missing interpreters and invalid environments.

Completion criterion: failed or cancelled tasks do not leave unsafe cleanup or false success states.

### Phase 7 — Testing and release
Run unit and integration tests.
Test network-less execution.
Test missing dependencies.
Test invalid scripts and icons.
Test one-file and one-folder builds.
Test paths with spaces and non-ASCII characters.
Test Windows permission behavior.
Test interrupted environment creation.
Document supported limits and platforms.

Completion criterion: all critical workflows pass the documented tests.

## 7. Testing plan

### 7.1 Project management tests
- create a project with an existing name
- open an invalid Python file
- save files with non-ASCII characters
- save and reopen projects
- handle missing source files
- rename projects with existing build artifacts
- detect unsaved edits

### 7.2 Environment tests
- create a new virtual environment
- reuse an existing environment
- select an invalid interpreter
- recover from incomplete environment creation
- remove a managed environment
- prevent cleanup of active environments
- ensure deletion cannot escape the managed root

### 7.3 Dependency tests
- install a valid package
- install an invalid package
- install a version-pinned package
- read requirements files with comments
- handle dependency installation failure
- verify the global interpreter remains unchanged
- cancel an installation

### 7.4 Packaging tests
- build a simple Tkinter GUI
- build a console script
- build a one-file executable
- build a one-folder distribution
- package an application with an icon
- package an app with additional data files
- detect missing imports
- handle a failed PyInstaller process
- verify the generated artifact exists
- ensure cleanup does not remove the final artifact

## 8. Security and reliability rules

The implementation must follow these rules:
- do not use shell execution to run user-supplied package names or build options
- do not open or execute project source code simply because a project was opened
- do not silently overwrite existing projects or artifacts
- do not automatically delete user files
- do not trust metadata paths without validation
- do not follow arbitrary symlinks during cleanup
- do not allow two simultaneous operations to modify the same environment
- do not block the UI thread during installs or builds
- do not report success until the requested output has been verified
- do not delete the only copy of build logs after a failed build
- do not store credentials in plain-text logs
- treat downloaded packages and user scripts as untrusted code
- clearly explain that installing packages or running projects may execute third-party code
- require explicit confirmation before destructive operations
- coordinate cancellation and cleanup properly

## 9. Acceptance criteria

The first production release is acceptable when:
- project operations are reliable
- dependency installation uses the correct isolated environment
- the build process does not install packages globally by default
- build output is captured and displayed
- cancellation and errors are handled correctly
- the final executable is verified before success is reported
- cleanup only affects verified, managed paths
- project settings and build profiles persist
- tests and user documentation are included

## 10. Definition of done

The project is complete when a user can:
- launch PyW Studio
- create or open a Python project
- edit and save source files
- select a Python interpreter
- create an isolated environment
- install and inspect dependencies
- run the project
- configure a PyInstaller build
- build a one-file or one-folder executable
- view logs and errors
- find the generated artifact
- reopen the project with its settings intact
- clean managed temporary files safely
- run the documented automated tests successfully

The final result should be maintainable, not a monolithic demo. Correctness, isolation, clear diagnostics, and safe cleanup outweigh visual complexity.

## 11. Master development prompt

Copy the following into a coding assistant when requesting implementation:

MASTER PROMPT: BUILD PYW STUDIO

You are a senior Python desktop application architect and Windows packaging specialist.

Build a complete, reliable, production-oriented application named PyW Studio. The application manages Python `.pyw` and `.py` projects, isolated dependencies, virtual environments, and executable pack[...] 

Required deliverables:
- a launchable `main.pyw`
- modular Python source code
- a professional Tkinter/ttk GUI
- project creation and management
- source editor
- dependency management
- Python interpreter selection
- isolated virtual environment management
- PyInstaller integration
- one-file and one-folder builds
- GUI and console packaging modes
- custom icons and output folders
- build profiles and build history
- logging, progress reporting, and cancellation
- safe cleanup and recovery
- automated tests
- complete documentation and a sample project

Technology constraints:
- Use Python and Tkinter/ttk as the baseline.
- Prefer standard-library components for the main GUI.
- Use `venv` for env creation, `subprocess` for external commands, `pathlib` for path handling, `json` for config, `logging` for logs, and `unittest` for tests.
- PyInstaller should be installed in the selected project environment, not in the app’s global interpreter by default.
- Do not require administrator privileges for normal operations.
- The app should launch from a `.pyw` file on Windows without opening a console window.

Architecture responsibilities:
- app startup and lifecycle
- GUI navigation and shared state
- project and file management
- source editing
- interpreter discovery
- virtual environment creation and inspection
- package management and requirements handling
- PyInstaller configuration and execution
- build profiles and history
- background task execution
- logging and process supervision
- cleanup and safety checks
- application settings
- automated tests

Requirements by module:
- Project manager: create, open, save, Save As, import, duplicate, rename, recent-project tracking, project folder navigation. Support `.pyw` and `.py` entry scripts and multiple files. Store project metadata in a validated config file and enforce project-safe path handling.
- Editor: functional Python editor with line numbers, syntax highlighting, search/replace, undo/redo, indentation controls, keyboard shortcuts, unsaved-change indicators, and line/column status.
- Dependency manager: install, upgrade, uninstall, list versions, requirements import/export, validation, and accurate error reporting. Never run shell commands with user-supplied package strings.
- Environment manager: support persistent project environments and temporary build environments. Use explicit interpreter paths and `venv` to create environments. Check ownership and validity before using or deleting an environment.
- PyInstaller builder: support one-file and one-folder builds, GUI and console modes, icons, output directories, additional data files, hidden imports, exclusions, runtime hooks, extra import paths, custom metadata, and safe artifact verification.
- Background execution: run long tasks outside the UI thread using thread-safe queues or similar mechanisms. Support cancellation, process termination, and safe shutdown.
- Cleanup manager: verify managed roots, ownership, active tasks, and destructive intent before deleting anything. Never delete source files or project files automatically.

Error handling and safety:
- handle missing interpreters, invalid envs, pip errors, package install failures, missing build artifacts, invalid icons, disk exhaustion, permission errors, cancelled tasks, and invalid metadata
- show user-friendly error messages and retain technical diagnostics
- never swallow exceptions silently
- do not claim success without verifying artifacts

Testing requirements:
- create automated tests for metadata validation, project management, path validation, environment lifecycle, requirement parsing, build configuration, artifact verification, and safe cleanup
- use temporary directories and mocked subprocesses where practical
- no internet access should be required for unit tests
- integration tests may optionally run with an installed Python interpreter and PyInstaller

Documentation requirements:
- create a README with overview, supported platforms, prerequisites, launch instructions, environment behavior, dependency management, build workflow, supported PyInstaller options, cleanup behavior, and architecture summary
- clearly document that executable packaging is platform-specific and that Windows executables should be built in a compatible Windows environment

Development process:
- implement in phases: architecture, GUI, project management, editor, interpreter/env management, dependency management, PyInstaller integration, profiles/history, cleanup/process supervision, testing, and release preparation
- run the relevant tests at the end of each phase and fix issues before continuing
- do not substitute abbreviated examples for working modules

Definition of done:
- the app launches successfully
- users can create/open projects, edit and save files, select interpreters, create isolated envs, install dependencies, run scripts, build one-file and one-folder executables, view logs, and reopen projects with their settings intact
- tests pass and the project is documented clearly

## 12. Release checklist

Before distributing a release, verify:
- `main.pyw` launches successfully
- all required source modules are included
- project creation and saving works
- requirements files are handled correctly
- dependency installation uses isolated environments
- the GUI remains responsive during builds
- cancellation works
- build output is verified
- one-file and one-folder builds work
- cleanup does not delete user-owned project files
- logs and reports remain available after failures

This document is intentionally implementation-focused. It should guide the developer toward a reliable, extensible, and safe project rather than a decorative prototype.
