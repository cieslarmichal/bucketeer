import { type LogPayload, type LoggerService } from './loggerService.js';
import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerClient: LoggerClient) {}

  public fatal(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.fatal({ context }, message);
  }

  public error(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.error({ context }, message);
  }

  public warn(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.warn({ context }, message);
  }

  public info(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.info({ context }, message);
  }

  public debug(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.debug({ context }, message);
  }

  public log(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.info({ context }, message);
  }
}
