import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pc from 'picocolors';

const FIREBASE_JSON = {
  hosting: {
    public: 'dist/renderer',
    ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
    rewrites: [{ source: '**', destination: '/index.html' }],
  },
};

/**
 * Scaffolds firebase.json/.firebaserc for frost-hub on first use. `.firebaserc`
 * ships with a placeholder project id — real projects are wired via `firebase use --add`.
 */
export function ensureFirebaseConfig(frostHubDir: string): { created: boolean } {
  const firebaseJsonPath = join(frostHubDir, 'firebase.json');
  const firebasercPath = join(frostHubDir, '.firebaserc');

  let created = false;

  if (!existsSync(firebaseJsonPath)) {
    writeFileSync(firebaseJsonPath, JSON.stringify(FIREBASE_JSON, null, 2) + '\n', 'utf8');
    created = true;
  }

  if (!existsSync(firebasercPath)) {
    writeFileSync(
      firebasercPath,
      JSON.stringify({ projects: { default: 'REPLACE_WITH_FIREBASE_PROJECT_ID' } }, null, 2) + '\n',
      'utf8',
    );
    created = true;
  }

  if (created) {
    console.log(pc.yellow('⚠') + ` Scaffolded firebase.json/.firebaserc in ${frostHubDir}`);
    console.log(pc.dim('  Run "firebase use --add" there once to bind a real Firebase project.'));
  }

  return { created };
}
