import { setTimeout as wait } from 'timers/promises';
import { Level, Logger } from 'nelog';

import { LokiAdapter } from '../src';

const logger = new Logger([
  new LokiAdapter({ enable: true, level: Level.DebugLevel, url: 'http://localhost:3100/loki/api/v1/push', labels: { app: 'dev-loki', env: 'DEVELOPMENT' } }),
]);

const main = async () => {
  for (let i = 0; i <= 100; i++) {
    logger.debug('debug log');
    logger.info('info log');
    logger.warn('warn log');
    logger.error('error log');
    logger.fatal('fatal log');

    logger.withName('mock name').debug('debug log');
    logger.withName('mock name').info('info log');
    logger.withName('mock name').warn('warn log');
    logger.withName('mock name').error('error log');
    logger.withName('mock name').fatal('fatal log');

    logger.withName('mock name').withField('foo', 'bar').debug('debug log');
    logger.withName('mock name').withField('foo', 'bar').info('info log');
    logger.withName('mock name').withField('foo', 'bar').warn('warn log');
    logger.withName('mock name').withField('foo', 'bar').error('error log');
    logger.withName('mock name').withField('foo', 'bar').fatal('fatal log');

    logger.withName('mock name').withField('foo', 'bar').withError(new Error('Mock Error')).debug('debug log');
    logger.withName('mock name').withField('foo', 'bar').withError(new Error('Mock Error')).info('info log');
    logger.withName('mock name').withField('foo', 'bar').withError(new Error('Mock Error')).warn('warn log');
    logger.withName('mock name').withField('foo', 'bar').withError(new Error('Mock Error')).error('error log');
    logger.withName('mock name').withField('foo', 'bar').withError(new Error('Mock Error')).fatal('fatal log');

    logger.withName('mock name').withFields({ foo: 'bar' }).withError(new Error('Mock Error')).debug('debug log');
    logger.withName('mock name').withFields({ foo: 'bar' }).withError(new Error('Mock Error')).info('info log');
    logger.withName('mock name').withFields({ foo: 'bar' }).withError(new Error('Mock Error')).warn('warn log');
    logger.withName('mock name').withFields({ foo: 'bar' }).withError(new Error('Mock Error')).error('error log');
    logger.withName('mock name').withFields({ foo: 'bar' }).withError(new Error('Mock Error')).fatal('fatal log');

    await wait(1000);
  }
};

main();
