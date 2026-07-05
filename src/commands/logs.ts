import type { Command } from 'commander';
import pc from 'picocolors';
import { KosClient } from '../api/client.js';

export function registerLogs(program: Command): void {
  program
    .command('logs [service]')
    .description('Fetch log output from kos-services')
    .option('-n, --lines <n>', 'number of lines to show', '50')
    .action(async (service: string | undefined, opts: { lines: string }) => {
      try {
        const client = KosClient.fromConfig();
        const lines = await client.logs(service);
        const tail = lines.slice(-Number(opts.lines));

        if (!tail.length) {
          console.log(pc.dim('No log output.'));
          return;
        }

        const prefix = service ? pc.cyan(`[${service}] `) : '';
        for (const line of tail) {
          process.stdout.write(prefix + line + '\n');
        }
      } catch (err) {
        console.error(pc.red('✗') + ` ${(err as Error).message}`);
        process.exit(1);
      }
    });
}