import type { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config/store.js';
import { resolveWorkspaceRoot, frostHubDir } from '../lib/workspace.js';
import { commandExists, run } from '../lib/proc.js';
import { ensureFirebaseConfig } from '../lib/firebase-setup.js';

async function deployFrostHub(): Promise<void> {
  if (!commandExists('firebase')) {
    console.error(pc.red('✗') + ' firebase-tools not found on PATH. Install it: npm install -g firebase-tools');
    process.exit(1);
  }

  const dir = frostHubDir(resolveWorkspaceRoot());
  ensureFirebaseConfig(dir);

  console.log(pc.dim('Building frost-hub…\n'));
  const buildCode = await run('pnpm', ['--filter', '@frost-hub/app-shell', 'build'], { cwd: dir });
  if (buildCode !== 0) {
    console.error(pc.red('✗') + ' Build failed.');
    process.exit(1);
  }

  console.log(pc.dim('Deploying frost-hub to Firebase Hosting…\n'));
  const deployCode = await run('firebase', ['deploy', '--only', 'hosting'], { cwd: dir });
  if (deployCode !== 0) {
    console.error(pc.red('✗') + ' firebase deploy failed.');
    process.exit(1);
  }
  console.log(pc.green('✓') + ' frost-hub deployed.');
}

export function registerDeploy(program: Command): void {
  program
    .command('deploy <service>')
    .description('Trigger a deployment for a service (frost-hub deploys via Firebase Hosting; everything else via kos-services)')
    .option('--env <env>', 'target environment', 'dev')
    .action(async (service: string, opts: { env: string }) => {
      if (service === 'frost-hub') {
        await deployFrostHub();
        return;
      }

      const cfg = requireConfig();

      process.stdout.write(pc.dim(`Deploying ${service} → ${opts.env}…\n`));

      try {
        const res = await fetch(`${cfg.url}/api/deploy/${service}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
          },
          body: JSON.stringify({ env: opts.env }),
        });

        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

        console.log(pc.green('✓') + ` Deploy triggered for ${pc.bold(service)} (env: ${opts.env})`);
      } catch (err) {
        console.error(pc.red('✗') + ` Deploy failed: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}