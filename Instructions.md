PyW Studio
Complete Project Plan & Master Development Prompt

Project type: Windows desktop application
Primary language: Python
GUI framework: Tkinter / ttk
Application format: .pyw
Packaging engine: PyInstaller
Environment strategy: Isolated temporary virtual environments
Document version: 1.0

PART 1 — PROJECT OVERVIEW
1.1 Project purpose

PyW Studio is a desktop IDE-lite and packaging manager for Python applications. It allows users to create, edit, organize, test, manage dependencies for, and package Python scripts into Windows executables without requiring users to operate manually through the command line.

The application should primarily support .pyw scripts but also support regular .py files.

Its main goal is to simplify the complete workflow:

Create or import a Python project.
Edit and save source code.
Configure an isolated Python environment.
Install, upgrade, uninstall, and inspect dependencies.
Run and debug the application.
Configure PyInstaller packaging.
Build a single-file or directory-based executable.
Inspect logs and build results.
Clean temporary files and environments safely.
Reopen and manage projects later.

The application must be suitable for beginners while exposing enough advanced configuration for experienced Python developers.

1.2 Core design principles
Isolation: Project dependencies must not be installed into system Python.
Persistence: Project settings must survive application restarts.
Safety: Never delete user source files as part of environment or build cleanup.
Transparency: Display build commands, process output, progress, and errors.
Reliability: Run long-running tasks in background workers.
Usability: Provide a graphical interface for normal workflows.
Portability: Keep the application easy to distribute as a .pyw source file and, eventually, as its own executable.
Extensibility: Design modules so new packaging engines, project types, and build options can be added later.
PART 2 — FUNCTIONAL REQUIREMENTS
2.1 Project management

The application must provide:

Create a project from a starter template.
Open existing .pyw and .py files.
Open a project folder and choose its entry script.
Create and manage named project workspaces.
Edit source files with a code editor.
Save, Save As, and detect unsaved changes.
Rename projects safely.
Duplicate projects.
Import an existing project folder.
Track recent projects.
Open the source folder in the system file manager.
Run the active script.
Display project metadata and the active interpreter.
Support multiple files per project.
Preserve the original files when cleaning build artifacts.

Recommended project structure:

MyProject/
├── main.pyw
├── requirements.txt
├── pywstudio.json
├── assets/
├── modules/
├── tests/
├── README.md
└── dist/


The environment, build cache, and temporary generated files should normally live outside the source directory.

2.2 Source editor

The initial editor should support:

Line numbers.
Syntax highlighting for Python.
Line wrapping toggle.
Search and replace.
Undo and redo.
Indentation and tab configuration.
Keyboard shortcuts.
Automatic indentation.
Status information showing line, column, and encoding.
Unsaved-change indicators.
Configurable font and editor theme.
File encoding selection.
Basic bracket matching.

Use Tkinter's Text widget for the initial implementation. Keep the editor interface modular so a more advanced editor component can be integrated later.

Do not claim support for features that have not actually been implemented.

2.3 Dependency manager

Dependency management must be project-specific.

Required features:

Display installed packages and their versions.
Install one or multiple packages.
Upgrade packages.
Uninstall packages.
Refresh the installed-package list.
Import dependencies from requirements.txt.
Export pinned package versions to requirements.txt.
Detect missing dependencies when possible.
Show installation output and errors.
Allow the user to select a package version or specify a version constraint.
Support optional package indexes and proxy settings.
Support editable installations only through an explicit advanced option.
Show the interpreter and environment associated with the selected project.

Example dependency input:

requests>=2.31
Pillow>=10.0
pandas
python-dateutil


Requirements parsing must handle comments, version specifiers, and valid pip requirement syntax. Do not use shell execution to interpret package input.

Use subprocess argument lists rather than constructing shell commands from user input.

2.4 Virtual environment manager

Every project must have an identifiable environment configuration.

Two environment modes should be supported:

Mode A — Persistent project environment

Reuse the project's environment across sessions.
Store the environment in the configured environment cache.
Reinstall packages only when requested.
Permit manual removal.

Mode B — Temporary build environment

Create an isolated virtual environment for a build.
Install the project's dependencies.
Install the selected PyInstaller version.
Build the executable.
Retain the final executable and build report.
Remove temporary build files after a successful build if configured.
Remove the temporary environment only when its lifecycle policy permits it.

Environment requirements:

Use venv to create environments.
Support selecting a compatible Python interpreter.
Verify that the selected interpreter can create virtual environments.
Verify pip availability.
Display environment location, Python version, and package count.
Track environment ownership in metadata.
Avoid deleting environments currently used by running tasks.
Provide explicit confirmation before environment deletion.
Clean stale environments only after checking ownership and active operations.

Important: Python virtual environments are not generally portable across machines. The final executable must be built for the target operating system and architecture.

2.5 Python interpreter management

Provide an interpreter settings page that allows users to:

Select an installed Python executable.
Detect the current interpreter.
Display its version and architecture.
Validate that the interpreter works.
Check whether the interpreter includes Tkinter when necessary.
Use a different interpreter for each project.
Store interpreter configuration in project metadata.
Display helpful errors if the selected interpreter is missing.

Do not assume that the interpreter running PyW Studio is the correct interpreter for every project.

2.6 PyInstaller executable builder

The builder must support the following configuration.

Basic options
One-file executable: --onefile.
Directory-based distribution: --onedir.
GUI application: --windowed or --noconsole.
Console application: retain console output.
Custom executable name.
Custom .ico icon.
Output directory.
Clean PyInstaller build cache.
Optional UPX support if installed and explicitly enabled.
Verbose build logging.
Advanced options
Additional data files and directories.
Additional binary files.
Hidden imports.
Exclusions.
Runtime hooks.
Additional import search paths.
Environment variables for the build process.
Version information and Windows metadata.
Optional manifest settings.
Custom spec-file support.
A visible advanced-arguments section with validation.

The default interface should not require users to understand PyInstaller's command-line syntax.

Build workflow
Validate the project and entry script.
Save pending source changes.
Validate the selected interpreter.
Create or select the isolated environment.
Install or verify the requested dependencies.
Install or verify PyInstaller in that environment.
Generate a build configuration.
Execute PyInstaller using the environment's Python executable.
Stream stdout and stderr into the application log.
Detect cancellation, failure, and success.
Verify that the expected output exists.
Copy or move the final artifact to the selected output directory.
Generate a build report.
Clean temporary artifacts according to the selected policy.
Display the final artifact path and offer to open it.

A successful subprocess exit code alone must not be treated as proof that the expected executable exists.

2.7 Build profiles

Allow users to save multiple named profiles per project.

Example profiles:

Development GUI.
Production GUI.
Debug Console.
Portable One-File.
Directory Distribution.

Each profile should preserve:

Python interpreter.
PyInstaller version or version policy.
Entry script.
Executable name.
One-file or one-folder mode.
Console setting.
Icon.
Output directory.
Data files.
Hidden imports.
Exclusions.
Extra build settings.
Cleanup preferences.

Profiles should be saved in the project metadata file or a dedicated profiles directory.

2.8 Logging and task management

The application must display:

Current operation.
Current project.
Current environment.
Start time and duration.
Command being executed.
Live process output.
Warnings.
Errors.
Completion status.
Final output paths.

Provide controls for:

Cancel operation.
Clear visible log.
Save log to file.
Open the log directory.
View the last build report.
Inspect the previous failed build.

Long-running operations must run outside Tkinter's main thread.

All UI updates must be scheduled safely on the Tkinter event loop. Worker threads must not directly modify Tkinter widgets.

Cancellation must terminate the process and, where appropriate, its child processes. Cleanup must not run while a process is still using the relevant files.

2.9 Cleanup manager

Cleanup operations must be clearly separated.

Build cleanup

May remove:

Temporary PyInstaller work directories.
Generated spec files if they are not user-owned.
Temporary staging directories.
Temporary build virtual environments after successful completion, if selected.
Environment cleanup

May remove:

Environments explicitly owned by PyW Studio.
Unused package caches created by the application.
Stale environment metadata after verification.
Project cleanup

May remove only explicitly selected generated files and folders.

Never automatically delete:

Original .pyw or .py files.
User-created modules.
Assets.
User-authored spec files.
Project configuration.
Requirements files.
Arbitrary directories outside the application's managed workspace.

Use canonical paths and ownership metadata to validate every deletion target. Require confirmation for destructive cleanup.

PART 3 — USER INTERFACE DESIGN
3.1 Main window

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

3.2 Recommended screens
Dashboard: Recent projects, recent builds, quick actions.
Project Manager: Project creation, importing, renaming, and organization.
Editor: Source editing and file navigation.
Dependencies: Package installation and version management.
Environments: Interpreter and virtual environment management.
EXE Builder: Packaging configuration and build controls.
Build History: Past builds, artifacts, logs, and reports.
Settings: Theme, paths, cleanup policy, and defaults.
3.3 Visual style

Use a professional desktop interface:

Light and dark themes.
Consistent spacing.
Clear labels and tooltips.
Accessible font sizes.
Distinct primary and secondary actions.
Status indicators for running, successful, cancelled, and failed tasks.
Resizable panels.
Keyboard shortcuts.
Non-blocking progress indicators.

Tkinter and ttk should remain the baseline dependencies. Avoid making third-party GUI libraries mandatory unless the project explicitly adopts them.

PART 4 — TECHNICAL ARCHITECTURE
4.1 Recommended technology stack
Python 3.11 or a compatible supported release.
Tkinter and ttk for the GUI.
venv for environment creation.
subprocess for pip and PyInstaller processes.
threading and queue for background tasks.
pathlib for filesystem operations.
json for project and application configuration.
logging for persistent logs.
unittest for automated tests.
PyInstaller for packaging generated applications.

The application should not require external packages merely to launch the main GUI.

4.2 Recommended source layout
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
└── docs/
    ├── architecture.md
    └── user_guide.md


This is the recommended full-project architecture. The initial prototype can be a single .pyw file, but production development should separate UI, environment management, packaging, and filesystem operations.

4.3 Project metadata

Example pywstudio.json:

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


Validate the schema when loading metadata. Preserve unknown fields when practical, and write changes atomically to prevent configuration corruption.

4.4 Filesystem locations

Use an application-specific directory, preferably based on the platform's temporary or local application data paths.

Recommended separation:

PyWStudio/
├── environments/
├── staging/
├── builds/
├── logs/
├── cache/
└── reports/


The project source directory must remain independent of these managed directories.

Persistent application settings should live in an appropriate user configuration directory rather than relying exclusively on the operating system's temporary directory.

Temporary build data can be placed in a dedicated temporary workspace.

4.5 Process execution

Every external command must:

Use a list of arguments rather than shell=True.
Use the intended interpreter explicitly.
Use a controlled working directory.
Capture stdout and stderr.
Handle process exit codes.
Handle cancellation.
Avoid blocking the GUI.
Record the executable and arguments for troubleshooting.
Avoid logging credentials or sensitive environment values.

Use a subprocess supervisor capable of terminating child processes when necessary, particularly on Windows.

Do not install packages through the interpreter running PyW Studio unless the user explicitly selects that interpreter as the target environment.

PART 5 — IMPLEMENTATION ROADMAP
Phase 1: Foundation
Establish the project structure.
Create the Tkinter application shell.
Implement settings and logging.
Implement the project metadata model.
Create and open .pyw and .py projects.
Implement safe file saving and unsaved-change handling.

Completion criterion: Users can create, edit, save, reopen, and run a basic project.

Phase 2: Environment management
Add interpreter selection and validation.
Create isolated virtual environments.
Store environment ownership metadata.
Add environment inspection and removal.
Add operation locking and cleanup protections.

Completion criterion: Packages installed for one project do not alter system Python or another project's environment.

Phase 3: Dependency management
Install packages.
Upgrade and uninstall packages.
List installed package versions.
Read and write requirements files.
Display installation progress and errors.

Completion criterion: A user can reproduce a project's Python dependencies using its requirements file and configured interpreter.

Phase 4: Executable builder
Integrate PyInstaller.
Support one-file and one-folder builds.
Add GUI and console modes.
Add icon, name, and output options.
Support hidden imports and additional data files.
Add staging, artifact verification, and build reports.

Completion criterion: A simple GUI script can be packaged into an executable, and build errors are displayed accurately.

Phase 5: Build profiles and history
Save named profiles.
Maintain build history.
Record environment and package versions.
Save build logs and reports.
Add artifact opening and rebuilding.

Completion criterion: Users can repeat a previous build without manually re-entering settings.

Phase 6: Reliability and safety
Implement robust cancellation.
Improve process cleanup.
Validate all deletion paths.
Add failure recovery.
Add disk-usage reporting.
Add handling for missing interpreters and invalid environments.

Completion criterion: Failed or cancelled tasks do not leave unsafe cleanup behavior or falsely report successful builds.

Phase 7: Testing and release
Run unit and integration tests.
Test with network access unavailable.
Test missing package dependencies.
Test invalid scripts and icons.
Test both one-file and one-folder builds.
Test paths containing spaces and non-ASCII characters.
Test Windows user permissions.
Test environments interrupted during creation.
Document limitations and supported platforms.

Completion criterion: All critical workflows pass documented tests, and the release can be installed or launched from a clean Windows account.

PART 6 — TESTING PLAN
6.1 Project management tests
Creating a project with an existing name.
Opening an invalid Python file.
Saving files with non-ASCII characters.
Saving and reopening projects.
Handling missing source files.
Renaming projects with existing build artifacts.
Detecting unsaved edits.
6.2 Environment tests
Creating a new virtual environment.
Reusing an existing environment.
Selecting an invalid interpreter.
Recovering from incomplete environment creation.
Removing a managed environment.
Preventing cleanup of active environments.
Ensuring environment deletion cannot escape the managed root.
6.3 Dependency tests
Installing a valid package.
Installing an invalid package.
Installing a version-pinned package.
Reading requirements with comments.
Handling package installation failures.
Verifying that the global interpreter remains unchanged.
Cancelling an installation.
6.4 Packaging tests
Building a simple Tkinter GUI.
Building a console script.
Building a one-file executable.
Building a one-folder distribution.
Packaging an application with an icon.
Packaging a project with additional data.
Detecting missing imports.
Handling a failed PyInstaller process.
Verifying that the generated artifact exists.
Ensuring cleanup does not remove the final artifact.
6.5 Acceptance criteria

The first production release is acceptable when:

Project operations are reliable.
Dependency installation uses the correct isolated environment.
The build process does not install packages globally by default.
Build output is captured and displayed.
Cancellation and errors are handled.
The final executable is verified before reporting success.
Cleanup only affects verified, application-managed paths.
Project settings and build profiles persist.
Tests and user documentation are included.
PART 7 — SECURITY AND RELIABILITY RULES
Do not use shell execution to run user-supplied package names or build options.
Do not execute project code automatically when a project is opened.
Do not silently overwrite existing projects or artifacts.
Do not automatically delete user files.
Do not trust metadata paths without validation.
Do not follow arbitrary symlinks when performing recursive cleanup.
Do not allow two simultaneous operations to modify the same environment.
Do not block the UI thread during installations or builds.
Do not report success until the requested output has been verified.
Do not delete the only copy of build logs after a failed build.
Do not store credentials in plain-text logs.
Treat downloaded packages and user scripts as untrusted code.
Clearly explain that package installation and running projects may execute third-party code.
Provide explicit confirmation before destructive operations.
Ensure cancellation and cleanup are coordinated.
PART 8 — MASTER DEVELOPMENT PROMPT

Copy the entire prompt below into your coding assistant when requesting implementation of the complete application.

MASTER PROMPT: BUILD PYW STUDIO

You are a senior Python desktop application architect and Windows packaging specialist.

Build a complete, reliable, production-oriented application named PyW Studio. The application manages Python .pyw and .py projects, isolated dependencies, virtual environments, and executable packaging through PyInstaller.

Do not produce only a mockup, design concept, incomplete skeleton, or simplified proof of concept. Implement the working application and its supporting modules, configuration, tests, and documentation.

A. Required deliverables

Produce the complete project with:

A launchable main.pyw.
Modular Python source code.
A professional Tkinter/ttk GUI.
Project creation and management.
A source editor.
Dependency management.
Python interpreter selection.
Isolated virtual environment management.
PyInstaller integration.
One-file and one-folder builds.
GUI and console packaging modes.
Custom icons and output folders.
Build profiles and build history.
Logging, progress reporting, and cancellation.
Safe cleanup and recovery.
Automated tests.
A complete README and user guide.
A sample project.
A clear list of supported Python versions and operating systems.

Include every file required to run the application. Do not omit modules with comments such as "implement later", placeholder methods, or unexplained pseudocode.

B. Technology constraints

Use Python and Tkinter/ttk as the baseline.

Prefer standard-library components for the main GUI. Use venv to create isolated environments, subprocess for external commands, pathlib for path handling, json for configuration, logging for persistent logs, and unittest or another clearly documented testing framework.

PyInstaller should be installed into the selected project's isolated build environment, not into the application's global interpreter by default.

Do not require administrator privileges for ordinary operations.

The application should launch from a .pyw file on Windows without opening a console window. Provide a documented development launch command and an optional method for packaging PyW Studio itself.

C. Architecture

Separate the following responsibilities into distinct modules:

Application startup and lifecycle.
GUI navigation and shared state.
Project and file management.
Source editing.
Python interpreter discovery.
Virtual environment creation and inspection.
Package installation and requirements management.
PyInstaller configuration and execution.
Build profile persistence.
Build history and reports.
Background task execution.
Logging and process supervision.
Safe filesystem cleanup.
Application settings.
Automated tests.

Keep UI widgets separate from business logic. Business logic must be testable without launching the GUI.

Use clear type hints, descriptive names, small functions, and consistent error handling.

D. Project manager

Implement project creation, opening, saving, Save As, importing, duplication, renaming, recent-project tracking, and folder navigation.

Support .pyw and .py entry scripts and projects with multiple source files and assets.

Store project settings in a validated pywstudio.json file.

Detect unsaved changes and ask before discarding them. Do not execute source code simply because a project is opened.

E. Editor

Implement a functional Python editor with line numbers, syntax highlighting, search, replace, undo, redo, indentation controls, keyboard shortcuts, unsaved-change indicators, and a line/column status display.

If a feature is deferred, state that clearly in the documentation rather than presenting an inert control.

F. Dependency manager

Implement installation, upgrade, uninstall, package listing, version inspection, requirements import, and requirements export.

Accept normal pip requirement syntax, including version constraints. Validate package input and never execute user-supplied strings through a shell.

Display real installation output and accurate error messages.

Use the correct project's interpreter for every package operation.

Do not silently switch environments or install packages globally.

G. Environment manager

Support persistent project environments and temporary build environments.

Use explicit interpreter paths and create environments through Python's venv module.

Store ownership metadata and environment identity separately from user source code.

Check that environments are valid before using them. Detect missing interpreters, incomplete environments, and failed package installations.

Prevent conflicting operations on the same environment.

Provide inspection, disk-usage reporting, cleanup, and recovery for stale environments.

H. PyInstaller builder

Support:

One-file and one-folder modes.
GUI and console executables.
Executable names and icons.
Output directories.
Additional data files.
Additional binaries.
Hidden imports.
Excluded modules.
Runtime hooks.
Additional import paths.
Optional spec files.
Optional version metadata.
Build profiles.
Clean build options.
Build reports and history.

Execute PyInstaller using the Python interpreter belonging to the configured isolated environment.

Pass subprocess arguments as a list and do not use shell=True.

Stream build output into the GUI while preserving the actual exit code.

Validate configuration before starting a build.

After building, verify the expected output path and artifact type. Copy the artifact to the requested destination without silently overwriting unrelated files.

If the build fails, preserve diagnostic logs and provide a clear explanation.

For one-folder builds, copy the complete distribution directory, not just the launcher executable.

I. Temporary build workflow

Implement the following workflow:

Validate the project.
Save pending source changes.
Verify the configured interpreter.
Prepare the isolated environment.
Install declared dependencies.
Install or verify the selected PyInstaller version.
Generate the build configuration.
Execute PyInstaller.
Stream output and track progress.
Handle cancellation and failure.
Verify the generated artifact.
Publish the artifact.
Save a build report and useful logs.
Clean the temporary workspace according to user preferences.

Do not delete an environment or workspace while a process is using it.

Do not automatically remove the only copy of a failed build's diagnostic information.

Keep persistent environments and temporary build environments distinguishable in the UI.

J. Background execution

Implement a task manager for installations, builds, environment creation, and script execution.

All long-running processes must execute outside the Tkinter UI thread.

Use thread-safe queues or an equivalent mechanism to communicate with the GUI.

Support cancellation, timeouts where appropriate, process termination, and child-process cleanup.

Disable conflicting controls while an operation is running. Re-enable controls reliably after success, failure, or cancellation.

Ensure shutdown handles active processes safely.

K. Cleanup and safety

Implement a dedicated cleanup manager.

Every cleanup operation must verify:

The target is inside an approved managed root.
The target belongs to PyW Studio.
The target is not being used by an active task.
The target is not a user-owned source project.
The requested operation cannot unintentionally delete unrelated files.

Resolve and validate paths before deletion. Handle symlinks and Windows path edge cases conservatively.

Require confirmation for destructive operations.

Never use broad recursive deletion against an arbitrary path read from untrusted metadata.

Never automatically delete .pyw, .py, assets, requirements files, or user-created spec files.

L. User interface

Implement a cohesive desktop layout with:

Main toolbar.
Project explorer.
Source editor.
Dependencies view.
Environment view.
EXE builder.
Build profiles.
Build history.
Live logs.
Status bar.
Settings screen.
Light and dark themes where practical.

Make panels resizable. Use helpful labels and tooltips. Include keyboard shortcuts and meaningful status indicators.

Every visible button must perform a real, documented action. Avoid decorative controls that do nothing.

M. Persistence

Persist:

Recent projects.
Selected interpreter.
Environment settings.
Project metadata.
Build profiles.
Build history.
User preferences.
Relevant diagnostic logs.

Write configuration atomically. Validate loaded settings and handle malformed or outdated configuration gracefully.

Do not store passwords, access tokens, or sensitive environment values in logs or project metadata.

N. Error handling

Handle at least these situations:

Python interpreter not found.
Virtual environment creation failure.
pip unavailable.
Network failure.
Invalid package requirement.
Dependency installation failure.
Invalid source path.
Unsaved changes.
Invalid icon.
Missing data files.
PyInstaller failure.
Missing build artifact.
Destination file already exists.
Disk space exhaustion.
Permission errors.
Cancelled operations.
Unexpected application shutdown.
Invalid project metadata.

Display user-friendly errors and retain technical diagnostics for troubleshooting.

Do not swallow exceptions silently or report success after failure.

O. Automated tests

Create automated tests for project metadata, project management, path validation, environment lifecycle, dependency command construction, build command construction, artifact verification, cleanup safety, and task cancellation.

Use temporary test directories and mocked subprocesses where practical.

Do not require internet access for unit tests.

Provide integration tests that can optionally run with an installed Python interpreter and PyInstaller.

Include test instructions and distinguish unit tests from tests requiring network access or an actual Windows build.

P. Documentation

Create a README containing:

Project overview.
Supported platforms.
Python prerequisites.
Launch instructions.
Environment behavior.
Dependency management.
Build workflow.
Supported PyInstaller options.
Cleanup behavior.
Troubleshooting.
Testing instructions.
Known limitations.

Explain that executable packaging is platform-specific and that Windows executables should be built in a compatible Windows environment.

Explain that some packages require additional hidden imports, binaries, DLLs, runtime hooks, or data-file configuration.

Q. Development process

Implement the project in phases:

Architecture and configuration.
Main GUI and project management.
Source editor.
Interpreter and environment management.
Dependency management.
PyInstaller integration.
Profiles and history.
Cleanup and process supervision.
Testing and documentation.

At the end of each phase, run the applicable tests and correct discovered failures.

Do not replace complete modules with abbreviated examples to save space.

If operating in an environment where files can be created, create the actual project files and make them available as a downloadable archive. If file creation is unavailable, provide the complete contents of every required file with its relative path.

Never claim that code was executed or tested unless it actually was.

R. Definition of done

The project is complete when a user can:

Launch PyW Studio.
Create or open a Python project.
Edit and save source files.
Select a Python interpreter.
Create an isolated environment.
Install and inspect dependencies.
Run the project.
Configure a PyInstaller build.
Build a one-file or one-folder executable.
View logs and errors.
Find the generated artifact.
Reopen the project with its settings intact.
Clean managed temporary files safely.
Run the documented automated tests successfully.

Deliver a maintainable application rather than a monolithic demo. Prioritize correctness, isolation, clear diagnostics, and safe cleanup over unnecessary visual complexity.

Begin by generating the complete project structure and implementing the application in the order specified above.

PART 9 — RELEASE CHECKLIST

Before distributing a release, verify:

main.pyw launches successfully.
All required source modules are included.
Project creation and saving work.
Requirements files are handled correctly.
Dependency installation uses isolated environments.
The GUI remains responsive during builds.
Cancellation works.
Build output is verified.
One-file and one-folder modes work.
Cleanup does not delete user data.
Build logs and reports are retained.
Automated tests pass.
README and user documentation are complete.
The release has been tested on a clean Windows environment.
Final project objective

Deliver PyW Studio as a dependable desktop tool for managing the entire Python-to-Windows-executable workflow, with isolated dependency installation, repeatable builds, persistent project settings, useful diagnostics, and safe temporary-environment management.
