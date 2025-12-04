import { Level } from 'nelog';

import { LokiAdapterConfig } from './types';

export const setupDefaultLokiAdapterConfig = (url: string, labels: Record<string, string> = {}): LokiAdapterConfig => ({
  enable: true,
  level: Level.DebugLevel,
  url,
  labels: {
    app: 'my-app',
    env: 'development',
    ...labels,
  },
  batchSize: 100,
  batchMaxBytes: 4 * 1024 * 1024,
  flushIntervalMs: 2000,
});
