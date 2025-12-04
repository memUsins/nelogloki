import { IAdapter, Level } from 'nelog';

// ILokiAdapter loki adapter interface
export interface ILokiAdapter extends IAdapter {}

export interface LokiAdapterConfig {
  enable: boolean;
  level: Level;

  // Loki url, example: http://localhost:3100/loki/api/v1/push
  url: string;

  // Global labels
  labels: Record<string, string>;

  // Batching
  batchSize: number;
  batchMaxBytes: number;
  flushIntervalMs: number;
}
