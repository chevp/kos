import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const RUN_DIR = join(homedir(), '.kos', 'run');

function pidFile(name: string): string {
  return join(RUN_DIR, `${name}.pid`);
}

export function savePid(name: string, pid: number): void {
  mkdirSync(RUN_DIR, { recursive: true });
  writeFileSync(pidFile(name), String(pid), 'utf8');
}

export function loadPid(name: string): number | null {
  const file = pidFile(name);
  if (!existsSync(file)) return null;
  const raw = readFileSync(file, 'utf8').trim();
  const pid = Number(raw);
  return Number.isFinite(pid) ? pid : null;
}

export function clearPid(name: string): void {
  const file = pidFile(name);
  if (existsSync(file)) rmSync(file);
}

export function logFilePath(name: string): string {
  mkdirSync(RUN_DIR, { recursive: true });
  return join(RUN_DIR, `${name}.log`);
}
