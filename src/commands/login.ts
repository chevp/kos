import type { Command } from 'commander';
import pc from 'picocolors';
import { writeConfig } from '../config/store.js';
import { KosClient } from '../api/client.js';

export function registerLogin(program: Command): void {
  program
    .command('login')
    .description('Connect to a kos-services instance')
    .requiredOption('--url <url>', 'kos-services base URL (e.g. http://localhost:8080)')
    .option('--token <token>', 'bearer token for authentication')
    .action(async (opts: { url: string; token?: string }) => {
      const url = opts.url.replace(/\/$/, '');
      const cfg = { url, token: opts.token };

      process.stdout.write(pc.dim(`Connecting to ${url}…\n`));

      try {
        const client = new KosClient(cfg);
        const s = await client.status();
        writeConfig(cfg);
        console.log(pc.green('✓') + ` Connected to ${pc.bold(s.service)} — status: ${pc.green(s.status)}`);
        console.log(pc.dim(`Config saved to ~/.kos/config.json`));
      } catch (err) {
        console.error(pc.red('✗') + ` Could not reach ${url}: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}