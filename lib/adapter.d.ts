import { Log } from 'nelog';
import { LokiAdapterConfig, ILokiAdapter } from './thirdparty';
export declare class LokiAdapter implements ILokiAdapter {
    private readonly config;
    private batch;
    private currentBatchSize;
    private currentBatchBytes;
    private flushTimer;
    constructor(config: Partial<LokiAdapterConfig> & {
        url: string;
        labels?: Record<string, string>;
    });
    private startFlushTimer;
    private flush;
    private getOrCreateStream;
    log(log: Log): void;
    format(log: Log): void;
    close(): Promise<void>;
}
