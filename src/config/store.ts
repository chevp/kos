import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIG_DIR = join(homedir(), '.kos');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface KosConfig {
  url: string;
  token?: string;
}

export function readConfig(): KosConfig | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) as KosConfig;
  } catch {
    return null;
  }
}

export function writeConfig(config: KosConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export function requireConfig(): KosConfig {
  const cfg = readConfig();
  if (!cfg) {
    throw new Error('Not logged in. Run: kos login --url <kos-services-url>');
  }
  return cfg;
}