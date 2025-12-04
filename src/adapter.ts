import { isLevelEnabled, levelToString, Log } from 'nelog';
import { gzip } from 'pako';

import { LokiAdapterConfig, ILokiAdapter, setupDefaultLokiAdapterConfig } from './thirdparty';

interface Stream {
  stream: Record<string, string>;
  values: [string, string][];
}

export class LokiAdapter implements ILokiAdapter {
  private readonly config: Required<LokiAdapterConfig>;

  private batch: Stream[] = [];
  private currentBatchSize = 0;
  private currentBatchBytes = 0;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LokiAdapterConfig> & { url: string; labels?: Record<string, string> }) {
    this.config = { ...setupDefaultLokiAdapterConfig(config.url, config.labels), ...config } as Required<LokiAdapterConfig>;

    this.startFlushTimer();
  }

  private async startFlushTimer() {
    if (this.flushTimer) clearInterval(this.flushTimer);

    this.flushTimer = setInterval(() => {
      if (this.batch.length > 0) this.flush();
    }, this.config.flushIntervalMs);
  }

  private async flush() {
    if (this.batch.length === 0) return;

    const payload = { streams: this.batch };

    const json = JSON.stringify(payload);
    let body: Uint8Array;
    try {
      body = gzip(json);
    } catch {
      return;
    }

    try {
      await fetch(this.config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
        body: Buffer.from(body),
      });
    } catch {
    } finally {
      this.batch = [];
      this.currentBatchSize = 0;
      this.currentBatchBytes = 0;
    }
  }

  private getOrCreateStream(labels: Record<string, string>): Stream {
    let stream = this.batch.find((s) => {
      const keys = Object.keys(s.stream);
      if (keys.length !== Object.keys(labels).length) return false;
      return keys.every((k) => s.stream[k] === labels[k]);
    });

    if (!stream) {
      stream = { stream: labels, values: [] };
      this.batch.push(stream);
    }

    return stream;
  }

  log(log: Log): void {
    if (!this.config.enable || !isLevelEnabled(this.config.level, log.level)) return;

    this.format(log);

    const timestampNs = BigInt(log.timestamp.getTime()) * BigInt(1_000_000);
    const ts = timestampNs.toString();

    const labels = { ...this.config.labels, level: levelToString(log.level).toUpperCase() };

    const stream = this.getOrCreateStream(labels);
    stream.values.push([ts, log.message]);

    const entryBytes = ts.length + log.message.length + 10;
    this.currentBatchBytes += entryBytes;
    this.currentBatchSize += 1;

    if (this.currentBatchSize >= this.config.batchSize || this.currentBatchBytes >= this.config.batchMaxBytes) this.flush();
  }

  format(log: Log): void {
    const entry: any = { level: levelToString(log.level).toUpperCase(), message: log.message };

    if (log.data.name && log.data.withName) entry.logger = log.data.name;
    if (Object.keys(log.data.fields).length > 0) entry.fields = { ...log.data.fields };
    if (log.data.error) {
      entry.error = log.data.error.message;
      entry.stack = log.data.error.stack;
    }

    log.message = JSON.stringify(entry);
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.batch.length > 0) await this.flush();
  }
}
