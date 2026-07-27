import { openSync } from 'node:fs';
import type { Command } from 'commander';
import pc from 'picocolors';
import { resolveWorkspaceRoot, frostHubDir, kosServicesComposeFile, KOS_SERVICES_COMPOSE_PROJECT } from '../lib/workspace.js';
import { commandExists, run, runDetached, isPidAlive, killPid } from '../lib/proc.js';
import { savePid, loadPid, logFilePath } from '../lib/runstate.js';
import { ensureFirebaseConfig } from '../lib/firebase-setup.js';

type Target = 'services' | 'frost-hub';
const ALL_TARGETS: Target[] = ['services', 'frost-hub'];

async function upServices(root: string, build: boolean): Promise<void> {
  if (!commandExists('docker')) {
    console.error(pc.red('✗') + ' docker not found on PATH — cannot start kos-services.');
    process.exitCode = 1;
    return;
  }
  console.log(pc.cyan('▶') + ` kos-services (docker compose${build ? ', rebuilding' : ''})…`);
  const args = [
    'compose',
    '-p', KOS_SERVICES_COMPOSE_PROJECT,
    '-f', kosServicesComposeFile(root),
    'up', '-d', '--remove-orphans',
    ...(build ? ['--build'] : []),
  ];
  const code = await run('docker', args, { cwd: root });
  if (code !== 0) {
    console.error(pc.red('✗') + ' docker compose up failed.');
    process.exitCode = 1;
    return;
  }
  console.log(
    pc.green('✓') +
      ` kos-services running. Logs: docker compose -p ${KOS_SERVICES_COMPOSE_PROJECT} logs -f`,
  );
}

async function upFrostHub(root: string, build: boolean): Promise<void> {
  const dir = frostHubDir(root);

  const existing = loadPid('frost-hub');
  if (existing && isPidAlive(existing)) {
    if (!build) {
      console.log(pc.green('✓') + ` frost-hub already running (pid ${existing}).`);
      return;
    }
    console.log(pc.cyan('▶') + ` frost-hub: restarting for rebuild (pid ${existing})…`);
    killPid(existing);
  }

  if (!commandExists('firebase')) {
    console.error(
      pc.red('✗') + ' firebase-tools not found on PATH. Install it: npm install -g firebase-tools',
    );
    process.exitCode = 1;
    return;
  }

  ensureFirebaseConfig(dir);

  console.log(pc.cyan('▶') + ' frost-hub: build…');
  const buildCode = await run('pnpm', ['--filter', '@frost-hub/app-shell', 'build'], { cwd: dir });
  if (buildCode !== 0) {
    console.error(pc.red('✗') + ' frost-hub build failed.');
    process.exitCode = 1;
    return;
  }

  console.log(pc.cyan('▶') + ' frost-hub: firebase hosting emulator…');
  const log = openSync(logFilePath('frost-hub'), 'a');
  const pid = runDetached('firebase', ['emulators:start', '--only', 'hosting'], { cwd: dir, logFile: log });
  savePid('frost-hub', pid);
  console.log(pc.green('✓') + ` frost-hub running (pid ${pid}). Logs: ${logFilePath('frost-hub')}`);
}

export function registerUp(program: Command): void {
  program
    .command('up [targets...]')
    .description('Start the local dev stack (services, frost-hub). Default: all.')
    .option('--build', 'rebuild before starting (docker --build for services; restart+rebuild for frost-hub)', false)
    .action(async (targets: string[], opts: { build: boolean }) => {
      const root = resolveWorkspaceRoot();
      const selected = (targets.length ? targets : ALL_TARGETS) as Target[];

      for (const target of selected) {
        if (target === 'services') await upServices(root, opts.build);
        else if (target === 'frost-hub') await upFrostHub(root, opts.build);
        else {
          console.error(pc.red('✗') + ` Unknown target "${target}". Expected: services, frost-hub.`);
          process.exitCode = 1;
        }
      }
    });
}
