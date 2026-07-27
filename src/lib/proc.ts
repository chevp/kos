import { spawn, spawnSync } from 'node:child_process';

const isWin = process.platform === 'win32';

export interface RunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

/** Runs a command to completion, streaming stdio to the parent. Resolves with the exit code. */
export function run(cmd: string, args: string[], opts: RunOptions = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env ?? process.env,
      stdio: 'inherit',
      shell: isWin,
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

/** Spawns a detached background process (survives the parent exiting) and returns its pid. */
export function runDetached(cmd: string, args: string[], opts: RunOptions & { logFile?: number | 'ignore' } = {}): number {
  const child = spawn(cmd, args, {
    cwd: opts.cwd,
    env: opts.env ?? process.env,
    stdio: opts.logFile !== undefined ? ['ignore', opts.logFile, opts.logFile] : 'ignore',
    shell: isWin,
    detached: true,
  });
  child.unref();
  if (child.pid === undefined) {
    throw new Error(`Failed to spawn: ${cmd} ${args.join(' ')}`);
  }
  return child.pid;
}

export function commandExists(cmd: string): boolean {
  const probe = isWin ? spawnSync('where', [cmd]) : spawnSync('which', [cmd]);
  return probe.status === 0;
}

/** Best-effort kill of a process tree by pid. Returns true if a process was found and signalled. */
export function killPid(pid: number): boolean {
  try {
    if (isWin) {
      const r = spawnSync('taskkill', ['/pid', String(pid), '/T', '/F']);
      return r.status === 0;
    }
    process.kill(-pid, 'SIGTERM');
    return true;
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
      return true;
    } catch {
      return false;
    }
  }
}

export function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
