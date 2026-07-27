import type { Command } from 'commander';
import pc from 'picocolors';
import { resolveWorkspaceRoot } from '../lib/workspace.js';
import { commandExists, run, killPid, isPidAlive } from '../lib/proc.js';
import { loadPid, clearPid } from '../lib/runstate.js';

type Target = 'services' | 'frost-hub';
const ALL_TARGETS: Target[] = ['services', 'frost-hub'];

async function downServices(root: string): Promise<void> {
  if (!commandExists('docker')) {
    console.error(pc.red('✗') + ' docker not found on PATH.');
    process.exitCode = 1;
    return;
  }
  console.log(pc.cyan('▶') + ' kos-services stack (docker compose)…');
  const code = await run('docker', ['compose', 'down'], { cwd: root });
  if (code !== 0) {
    console.error(pc.red('✗') + ' docker compose down failed.');
    process.exitCode = 1;
    return;
  }
  console.log(pc.green('✓') + ' Stack stopped.');
}

async function downFrostHub(): Promise<void> {
  const pid = loadPid('frost-hub');
  if (!pid || !isPidAlive(pid)) {
    console.log(pc.dim('frost-hub is not running.'));
    clearPid('frost-hub');
    return;
  }
  console.log(pc.cyan('▶') + ` frost-hub: stopping (pid ${pid})…`);
  killPid(pid);
  clearPid('frost-hub');
  console.log(pc.green('✓') + ' frost-hub stopped.');
}

export function registerDown(program: Command): void {
  program
    .command('down [targets...]')
    .description('Stop the local dev stack (services, frost-hub). Default: all.')
    .action(async (targets: string[]) => {
      const root = resolveWorkspaceRoot();
      const selected = (targets.length ? targets : ALL_TARGETS) as Target[];

      for (const target of selected) {
        if (target === 'services') await downServices(root);
        else if (target === 'frost-hub') await downFrostHub();
        else {
          console.error(pc.red('✗') + ` Unknown target "${target}". Expected: services, frost-hub.`);
          process.exitCode = 1;
        }
      }
    });
}
