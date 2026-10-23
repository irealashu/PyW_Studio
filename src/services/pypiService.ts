/**
 * PyPI Package Version Checker and Update Supervisor
 * Handles version checking against PyPI registry or known package index,
 * provides pip terminal output formatting, and upgrade resolution.
 */

export const KNOWN_PACKAGES_METADATA: Record<string, { latestVersion: string; license: string; description: string; size: string }> = {
  pyinstaller: {
    latestVersion: '6.11.1',
    license: 'GPL-2.0',
    description: 'Freezes Python applications into standalone executables for Windows, Linux, and macOS',
    size: '18.4 MB',
  },
  requests: {
    latestVersion: '2.32.3',
    license: 'Apache-2.0',
    description: 'Python HTTP for Humans - elegant and simple HTTP client library',
    size: '3.4 MB',
  },
  packaging: {
    latestVersion: '24.2',
    license: 'Apache-2.0',
    description: 'Core utilities for Python packages and PEP 440 version parsing',
    size: '1.2 MB',
  },
  pillow: {
    latestVersion: '11.0.0',
    license: 'HPND',
    description: 'Python Imaging Library (Fork) supporting extensive image file formats',
    size: '12.8 MB',
  },
  ttkbootstrap: {
    latestVersion: '1.10.1',
    license: 'MIT',
    description: 'Modern Bootstrap-inspired themes and widgets extension for Tkinter',
    size: '4.8 MB',
  },
  psutil: {
    latestVersion: '6.1.0',
    license: 'BSD-3-Clause',
    description: 'Cross-platform process and system monitoring library for Python',
    size: '2.1 MB',
  },
  numpy: {
    latestVersion: '2.1.2',
    license: 'BSD-3-Clause',
    description: 'Fundamental package for scientific computing with Python',
    size: '24.5 MB',
  },
  cryptography: {
    latestVersion: '43.0.3',
    license: 'Apache-2.0 / BSD',
    description: 'Provides cryptographic recipes and primitives to Python developers',
    size: '8.6 MB',
  },
  urllib3: {
    latestVersion: '2.2.3',
    license: 'MIT',
    description: 'HTTP library with thread-safe connection pooling, file post, and more',
    size: '2.8 MB',
  },
  certifi: {
    latestVersion: '2024.8.30',
    license: 'MPL-2.0',
    description: 'Carefully curated collection of Root Certificates for SSL verification',
    size: '0.4 MB',
  },
  pytest: {
    latestVersion: '8.3.3',
    license: 'MIT',
    description: 'Simple, powerful, and scalable testing framework for Python',
    size: '5.2 MB',
  },
  colorama: {
    latestVersion: '0.4.6',
    license: 'BSD-3-Clause',
    description: 'Cross-platform colored terminal text in Python for Windows and POSIX',
    size: '0.8 MB',
  },
};

/**
 * Compare two semantic version strings (e.g. "2.31.0" vs "2.32.3").
 * Returns true if v2 is strictly newer than v1.
 */
export function isVersionNewer(v1: string, v2: string): boolean {
  if (!v1 || !v2 || v1 === v2) return false;

  const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map((p) => parseInt(p, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num2 > num1) return true;
    if (num2 < num1) return false;
  }
  return false;
}

/**
 * Fetch or resolve latest version for a package.
 * Queries PyPI official JSON API with short timeout, falling back to local known metadata or version bump.
 */
export async function resolveLatestVersion(packageName: string, currentVersion: string): Promise<string> {
  const norm = packageName.toLowerCase().trim();

  // Check network PyPI API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const resp = await fetch(`https://pypi.org/pypi/${norm}/json`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (resp.ok) {
      const data = await resp.json();
      if (data?.info?.version) {
        return data.info.version;
      }
    }
  } catch {
    // PyPI network failed or timed out; fall back seamlessly
  }

  // Fallback to curated catalog
  if (KNOWN_PACKAGES_METADATA[norm]) {
    return KNOWN_PACKAGES_METADATA[norm].latestVersion;
  }

  // Synthetic version calculation
  const parts = currentVersion.split('.');
  if (parts.length === 3 && !isNaN(Number(parts[2]))) {
    return `${parts[0]}.${parseInt(parts[1], 10) + 1}.0`;
  } else if (parts.length === 2 && !isNaN(Number(parts[1]))) {
    return `${parts[0]}.${parseInt(parts[1], 10) + 1}`;
  }

  return currentVersion;
}

/**
 * Format pip outdated table lines for terminal rendering.
 */
export function formatPipOutdatedOutput(
  outdated: { name: string; currentVersion: string; latestVersion: string }[]
): string[] {
  if (outdated.length === 0) {
    return [
      '[pip] Checking packages for updates against PyPI index...',
      'Requirement already up-to-date: All packages in environment are currently at their latest version.',
    ];
  }

  const nameColWidth = Math.max(15, ...outdated.map((p) => p.name.length + 2));
  const verColWidth = 10;
  const latestColWidth = 10;

  const header = `${'Package'.padEnd(nameColWidth)} ${'Version'.padEnd(verColWidth)} ${'Latest'.padEnd(latestColWidth)} Type`;
  const divider = `${''.padEnd(nameColWidth, '-')} ${''.padEnd(verColWidth, '-')} ${''.padEnd(latestColWidth, '-')} ----`;

  const rows = outdated.map((p) => {
    return `${p.name.padEnd(nameColWidth)} ${p.currentVersion.padEnd(verColWidth)} ${p.latestVersion.padEnd(latestColWidth)} wheel`;
  });

  return [
    `[pip] Querying PyPI repository index for available package upgrades...`,
    header,
    divider,
    ...rows,
    `[pip] ${outdated.length} package(s) can be upgraded.`,
    `[pip] Hint: Use 'pip upgrade', 'pip update', or 'pip install --upgrade <pkg>' to apply.`,
  ];
}
