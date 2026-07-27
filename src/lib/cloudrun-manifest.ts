import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface CloudRunManifest {
  project: string;
  region: string;
  services: string[];
}

/** Parses infrastructure/deploy/prod.cloudrun (a small hand-written YAML-like descriptor). */
export function readCloudRunManifest(root: string): CloudRunManifest {
  const path = join(root, 'infrastructure', 'deploy', 'prod.cloudrun');
  const text = readFileSync(path, 'utf8');

  const project = /^project:\s*(\S+)/m.exec(text)?.[1];
  const region = /^region:\s*(\S+)/m.exec(text)?.[1];
  if (!project || !region) {
    throw new Error(`Could not parse project/region from ${path}`);
  }

  const services = [...text.matchAll(/^\s*-\s*name:\s*(\S+)/gm)].map((m) => m[1]!);

  return { project, region, services };
}
