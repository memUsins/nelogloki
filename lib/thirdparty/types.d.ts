import { IAdapter, Level } from 'nelog';
export interface ILokiAdapter extends IAdapter {
}
export interface LokiAdapterConfig {
    enable: boolean;
    level: Level;
    url: string;
    labels: Record<string, string>;
    batchSize: number;
    batchMaxBytes: number;
    flushIntervalMs: number;
}
