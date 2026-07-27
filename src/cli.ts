#!/usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';
import { VERSION } from './version.js';
import { registerLogin } from './commands/login.js';
import { registerStatus } from './commands/status.js';
import { registerServices } from './commands/services.js';
import { registerLogs } from './commands/logs.js';
import { registerDeploy } from './commands/deploy.js';
import { registerUp } from './commands/up.js';
import { registerDown } from './commands/down.js';
import { registerDoctor } from './commands/doctor.js';
import { registerCloud } from './commands/cloud.js';

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('kos')
    .description('Kosmos CLI — interact with kos-services from the terminal')
    .version(VERSION);

  registerLogin(program);
  registerStatus(program);
  registerServices(program);
  registerLogs(program);
  registerDeploy(program);
  registerUp(program);
  registerDown(program);
  registerDoctor(program);
  registerCloud(program);

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(pc.red(`[kos] fatal: ${(err as Error).stack ?? err}`));
  process.exit(1);
});