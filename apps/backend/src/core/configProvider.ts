import config from 'config';

import { OperationNotValidError } from '../common/errors/common/operationNotValidError.js';
import { type LogLevel } from '../libs/logger/types/logLevel.js';

export class ConfigProvider {
  public getServerHost(): string {
    return '0.0.0.0';
  }

  public getServerPort(): number {
    return 5000;
  }

  public getLogLevel(): LogLevel {
    return this.getValue<LogLevel>('logger.level');
  }

  public getSqliteDatabasePath(): string {
    return this.getValue<string>('database.path');
  }

  public getJwtSecret(): string {
    return this.getValue<string>('auth.jwt.secret');
  }

  public getAccessTokenExpiresIn(): number {
    return this.getValue<number>('auth.accessToken.expiresIn');
  }

  public getRefreshTokenExpiresIn(): number {
    return this.getValue<number>('auth.refreshToken.expiresIn');
  }

  public getHashSaltRounds(): number {
    return this.getValue<number>('auth.hash.saltRounds');
  }

  private getValue<T>(key: string): T {
    const value = config.get(key);

    if (value === null) {
      throw new OperationNotValidError({
        reason: 'Invalid config value.',
        value,
        key,
      });
    }

    return value as T;
  }
}
