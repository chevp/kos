import type { Command } from 'commander';
import pc from 'picocolors';
import { KosClient } from '../api/client.js';

export function registerServices(program: Command): void {
  program
    .command('services')
    .description('List services registered in kos-services')
    .action(async () => {
      try {
        const client = KosClient.fromConfig();
        const list = await client.services();

        if (!list.length) {
          console.log(pc.dim('No services found.'));
          return;
        }

        for (const svc of list) {
          const dot = svc.status === 'running' ? pc.green('●')
                    : svc.status === 'stopped'  ? pc.red('●')
                    : pc.yellow('●');
          const url = svc.url ? pc.dim(`  ${svc.url}`) : '';
          console.log(`${dot}  ${pc.bold(svc.name)}${url}`);
        }
      } catch (err) {
        console.error(pc.red('✗') + ` ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
