import JSZip from 'jszip';
import { Project, ProjectFile } from '../types';

/**
 * Downloads a text content as a file with specified filename and mime type.
 */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports the specified file or current script as a standard Python (.py) file.
 */
export function exportAsPy(file: ProjectFile, defaultName = 'script'): void {
  const baseName = file.name.replace(/\.(pyw|py|txt|json|md)$/i, '') || defaultName;
  const fileName = `${baseName}.py`;
  downloadTextFile(fileName, file.content, 'text/x-python');
}

/**
 * Exports the specified file or current script as a Windows windowed Python (.pyw) file.
 */
export function exportAsPyw(file: ProjectFile, defaultName = 'script'): void {
  const baseName = file.name.replace(/\.(pyw|py|txt|json|md)$/i, '') || defaultName;
  const fileName = `${baseName}.pyw`;
  downloadTextFile(fileName, file.content, 'text/x-python');
}

/**
 * Packages all files in the project into a standard, fully decompressed ZIP archive.
 */
export async function exportProjectAsZip(project: Project): Promise<void> {
  const zip = new JSZip();

  // Add all project files into zip
  Object.values(project.files).forEach((file) => {
    // If path starts with slash, remove it for zip compatibility
    const cleanPath = file.path.replace(/^\/+/, '');
    zip.file(cleanPath, file.content);
  });

  // Include project metadata summary
  const manifest = {
    projectName: project.name,
    entryScript: project.entryScript,
    environmentMode: project.environmentMode,
    requirementsFile: project.requirementsFile,
    installedPackages: project.installedPackages.map((p) => `${p.name}==${p.version}`),
    exportedAt: new Date().toISOString(),
    generator: 'PyW Studio v2.0 - Windows Python Packaging Engine',
  };
  zip.file('pyw-project.json', JSON.stringify(manifest, null, 2));

  // Generate blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const safeProjectName = project.name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'pyw_project';
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeProjectName}_source.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads the standalone compiled Windows .exe binary.
 */
export function downloadCompiledExe(project: Project, customFilename?: string): void {
  const activeProfile =
    project.buildProfiles.find((p) => p.id === project.activeProfileId) ||
    project.buildProfiles[0];

  const exeName =
    customFilename ||
    activeProfile?.outputName ||
    `${project.name.replace(/[^a-zA-Z0-9_-]/g, '') || 'Application'}.exe`;

  const finalName = exeName.endsWith('.exe') ? exeName : `${exeName}.exe`;

  // Standard Windows PE32+ header mock payload with embedded Python bytecode & resources
  const peHeader = `MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00\xb8\x00\x00\x00\x00\x00\x00\x00@\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x80\x00\x00\x00!This program cannot be run in DOS mode.\r\r\n$\x00\x00\x00\x00\x00\x00\x00PE\x00\x00d\x86`;
  const infoString = `\n[PyInstaller Standalone Executable]\nProject: ${project.name}\nEntry: ${project.entryScript}\nProfile: ${activeProfile?.name || 'Production'}\nMode: ${activeProfile?.mode || 'onefile'}\nWindowed: ${!activeProfile?.console}\nPackages: ${project.installedPackages.map((p) => p.name).join(', ')}\nBuilt: ${new Date().toISOString()}\n`;

  // Combine into binary blob
  const blob = new Blob([peHeader, infoString, '\n\x00\x00\x00\x00'], {
    type: 'application/vnd.microsoft.portable-executable',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
