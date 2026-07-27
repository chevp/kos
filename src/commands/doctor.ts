import type { Command } from 'commander';
import pc from 'picocolors';
import { commandExists } from '../lib/proc.js';

function check(label: string, ok: boolean, hint: string): boolean {
  if (ok) {
    console.log(pc.green('✓') + ` ${label}`);
  } else {
    console.log(pc.red('✗') + ` ${label} — ${hint}`);
  }
  return ok;
}

export function registerDoctor(program: Command): void {
  program
    .command('doctor')
    .description('Check that docker, gcloud, firebase-tools and pnpm are available')
    .action(() => {
      const results = [
        check('docker', commandExists('docker'), 'install Docker Desktop and ensure it is on PATH'),
        check('pnpm', commandExists('pnpm'), 'npm install -g pnpm'),
        check('firebase (firebase-tools)', commandExists('firebase'), 'npm install -g firebase-tools'),
        check('gcloud', commandExists('gcloud'), 'install the Google Cloud SDK'),
      ];

      if (results.every(Boolean)) {
        console.log(pc.green('\nAll good.'));
      } else {
        console.log(pc.yellow('\nSome tools are missing — see hints above.'));
        process.exitCode = 1;
      }
    });
}
