import { type LoggerService } from '../../services/loggerService/loggerService.js';
import { LoggerServiceImpl } from '../../services/loggerService/loggerServiceImpl.js';
import { type LoggerConfig } from '../../types/loggerConfig.js';
import { LoggerClientFactory } from '../loggerClientFactory/loggerClientFactory.js';

export class LoggerServiceFactory {
  public static create(config: LoggerConfig): LoggerService {
    const loggerClient = LoggerClientFactory.create(config);

    return new LoggerServiceImpl(loggerClient);
  }
}
