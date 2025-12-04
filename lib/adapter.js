"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LokiAdapter = void 0;
const nelog_1 = require("nelog");
const pako_1 = require("pako");
const thirdparty_1 = require("./thirdparty");
class LokiAdapter {
    config;
    batch = [];
    currentBatchSize = 0;
    currentBatchBytes = 0;
    flushTimer = null;
    constructor(config) {
        this.config = { ...(0, thirdparty_1.setupDefaultLokiAdapterConfig)(config.url, config.labels), ...config };
        this.startFlushTimer();
    }
    async startFlushTimer() {
        if (this.flushTimer)
            clearInterval(this.flushTimer);
        this.flushTimer = setInterval(() => {
            if (this.batch.length > 0)
                this.flush();
        }, this.config.flushIntervalMs);
    }
    async flush() {
        if (this.batch.length === 0)
            return;
        const payload = { streams: this.batch };
        const json = JSON.stringify(payload);
        let body;
        try {
            body = (0, pako_1.gzip)(json);
        }
        catch {
            return;
        }
        try {
            await fetch(this.config.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
                body: Buffer.from(body),
            });
        }
        catch {
        }
        finally {
            this.batch = [];
            this.currentBatchSize = 0;
            this.currentBatchBytes = 0;
        }
    }
    getOrCreateStream(labels) {
        let stream = this.batch.find((s) => {
            const keys = Object.keys(s.stream);
            if (keys.length !== Object.keys(labels).length)
                return false;
            return keys.every((k) => s.stream[k] === labels[k]);
        });
        if (!stream) {
            stream = { stream: labels, values: [] };
            this.batch.push(stream);
        }
        return stream;
    }
    log(log) {
        if (!this.config.enable || !(0, nelog_1.isLevelEnabled)(this.config.level, log.level))
            return;
        this.format(log);
        const timestampNs = BigInt(log.timestamp.getTime()) * BigInt(1_000_000);
        const ts = timestampNs.toString();
        const labels = { ...this.config.labels, level: (0, nelog_1.levelToString)(log.level).toUpperCase() };
        const stream = this.getOrCreateStream(labels);
        stream.values.push([ts, log.message]);
        const entryBytes = ts.length + log.message.length + 10;
        this.currentBatchBytes += entryBytes;
        this.currentBatchSize += 1;
        if (this.currentBatchSize >= this.config.batchSize || this.currentBatchBytes >= this.config.batchMaxBytes)
            this.flush();
    }
    format(log) {
        const entry = { level: (0, nelog_1.levelToString)(log.level).toUpperCase(), message: log.message };
        if (log.data.name && log.data.withName)
            entry.logger = log.data.name;
        if (Object.keys(log.data.fields).length > 0)
            entry.fields = { ...log.data.fields };
        if (log.data.error) {
            entry.error = log.data.error.message;
            entry.stack = log.data.error.stack;
        }
        log.message = JSON.stringify(entry);
    }
    async close() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        if (this.batch.length > 0)
            await this.flush();
    }
}
exports.LokiAdapter = LokiAdapter;
