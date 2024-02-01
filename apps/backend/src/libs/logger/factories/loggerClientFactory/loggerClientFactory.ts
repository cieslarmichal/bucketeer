import { pino } from 'pino';

import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';
import { type LoggerConfig } from '../../types/loggerConfig.js';

export class LoggerClientFactory {
  public static create(config: LoggerConfig): LoggerClient {
    const loggerClient = pino({
      name: 'Logger',
      level: config.logLevel,
    });

    return loggerClient;
  }
}
