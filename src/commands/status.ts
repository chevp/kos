import type { Command } from 'commander';
import pc from 'picocolors';
import { readConfig } from '../config/store.js';
import { KosClient } from '../api/client.js';

export function registerStatus(program: Command): void {
  program
    .command('status')
    .description('Show kos-services connection status')
    .action(async () => {
      const cfg = readConfig();
      if (!cfg) {
        console.log(pc.yellow('⚠') + ' Not logged in. Run: ' + pc.bold('kos login --url <url>'));
        return;
      }

      process.stdout.write(pc.dim(`Checking ${cfg.url}…\n`));

      try {
        const client = new KosClient(cfg);
        const s = await client.status();
        const dot = s.status === 'ok' ? pc.green('●') : pc.red('●');
        console.log(`${dot} ${pc.bold(s.service)}  ${pc.dim(cfg.url)}`);
      } catch (err) {
        console.log(pc.red('●') + ` ${pc.dim(cfg.url)} — ${(err as Error).message}`);
        process.exit(1);
      }
    });
}