import type { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config/store.js';

export function registerDeploy(program: Command): void {
  program
    .command('deploy <service>')
    .description('Trigger a deployment for a service')
    .option('--env <env>', 'target environment', 'dev')
    .action(async (service: string, opts: { env: string }) => {
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