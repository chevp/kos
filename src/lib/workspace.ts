import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = dirname(fileURLToPath(import.meta.url));

function looksLikeRoot(dir: string): boolean {
  return existsSync(join(dir, 'docker-compose.yml')) && existsSync(join(dir, 'apps', 'frost-hub'));
}

/** Resolves the kosmos repo root, regardless of where `kos` is invoked from. */
export function resolveWorkspaceRoot(): string {
  const override = process.env.KOSMOS_ROOT;
  if (override && looksLikeRoot(override)) return override;

  for (const start of [process.cwd(), moduleDir]) {
    let dir = start;
    for (let i = 0; i < 10; i++) {
      if (looksLikeRoot(dir)) return dir;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error(
    'Could not locate the kosmos workspace root (looked for docker-compose.yml + apps/frost-hub). ' +
      'Set KOSMOS_ROOT to override.',
  );
}

export function frostHubDir(root = resolveWorkspaceRoot()): string {
  return join(root, 'apps', 'frost-hub');
}
