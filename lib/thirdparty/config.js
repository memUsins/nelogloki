"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDefaultLokiAdapterConfig = void 0;
const nelog_1 = require("nelog");
const setupDefaultLokiAdapterConfig = (url, labels = {}) => ({
    enable: true,
    level: nelog_1.Level.DebugLevel,
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
exports.setupDefaultLokiAdapterConfig = setupDefaultLokiAdapterConfig;
