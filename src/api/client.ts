import { requireConfig, type KosConfig } from '../config/store.js';

export interface ServiceStatus {
  status: string;
  service: string;
}

export interface ServiceInfo {
  name: string;
  status: 'running' | 'stopped' | 'unknown';
  url?: string;
}

export class KosClient {
  constructor(private readonly cfg: KosConfig) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.cfg.token) h['Authorization'] = `Bearer ${this.cfg.token}`;
    return h;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.cfg.url}${path}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
    return res.json() as Promise<T>;
  }

  async status(): Promise<ServiceStatus> {
    return this.get<ServiceStatus>('/api/status');
  }

  async services(): Promise<ServiceInfo[]> {
    return this.get<ServiceInfo[]>('/api/services');
  }

  async logs(service?: string): Promise<string[]> {
    const path = service ? `/api/logs/${service}` : '/api/logs';
    return this.get<string[]>(path);
  }

  static fromConfig(): KosClient {
    return new KosClient(requireConfig());
  }
}