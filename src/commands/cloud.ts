import type { Command } from 'commander';
import pc from 'picocolors';
import { resolveWorkspaceRoot } from '../lib/workspace.js';
import { commandExists, run } from '../lib/proc.js';
import { readCloudRunManifest } from '../lib/cloudrun-manifest.js';

export function registerCloud(program: Command): void {
  const cloud = program.command('cloud').description('GCP Cloud Run (kos-services production target)');

  cloud
    .command('status')
    .description('List live Cloud Run services (project/region read from infrastructure/deploy/prod.cloudrun)')
    .action(async () => {
      if (!commandExists('gcloud')) {
        console.error(pc.red('✗') + ' gcloud not found on PATH. Install the Google Cloud SDK.');
        process.exitCode = 1;
        return;
      }

      const root = resolveWorkspaceRoot();
      const manifest = readCloudRunManifest(root);

      console.log(
        pc.dim(`project=${manifest.project} region=${manifest.region} (${manifest.services.length} known services)\n`),
      );

      const code = await run('gcloud', [
        'run',
        'services',
        'list',
        `--project=${manifest.project}`,
        `--region=${manifest.region}`,
      ]);
      if (code !== 0) process.exitCode = code;
    });
}
