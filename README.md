# NeLogLoki

nelogloki — loki adapter for [nelog](https://github.com/memUsins/nelog)

## Installation

  ```shell
$ npm install nelog nelogloki
```

## Usage

  ```ts
import { Logger } from 'nelog'
import { LokiAdapter } from 'nelogloki'

// simple
const logger = new Logger([
    new LokiAdapter({
        enable: true,
        level: Level.DebugLevel,
        
        url: 'http://localhost:3100/loki/api/v1/push',
        labels: { app: 'dev-loki', env: 'DEVELOPMENT' }
    }),
]);

// advanced
const logger = new Logger([
    new LokiAdapter({
        enable: true,
        level: Level.DebugLevel,
        
        url: 'http://localhost:3100/loki/api/v1/push',
        labels: { app: 'dev-loki', env: 'DEVELOPMENT' },

        batchSize: 100,
        batchMaxBytes: 4 * 1024 * 1024,
        flushIntervalMs: 2000,
    }),
]);
```
