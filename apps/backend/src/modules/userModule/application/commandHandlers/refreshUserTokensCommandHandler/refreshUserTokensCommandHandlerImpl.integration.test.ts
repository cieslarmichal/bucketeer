import { beforeEach, expect, it, describe, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { type RefreshUserTokensCommandHandler } from './refreshUserTokensCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { type BlacklistTokenTestUtils } from '../../../tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';

describe('RefreshUserTokensCommandHandler', () => {
  let refreshUserTokensCommandHandler: RefreshUserTokensCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let blacklistTokenTestUtils: BlacklistTokenTestUtils;

  let tokenService: TokenService;

  let configProvider: UserModuleConfigProvider;

  beforeEach(async () => {
    const container = TestContainer.create();

    refreshUserTokensCommandHandler = container.get<RefreshUserTokensCommandHandler>(
      symbols.refreshUserTokensCommandHandler,
    );

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    configProvider = container.get<UserModuleConfigProvider>(symbols.userModuleConfigProvider);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    blacklistTokenTestUtils = container.get<BlacklistTokenTestUtils>(testSymbols.blacklistTokenTestUtils);

    await userTestUtils.truncate();

    await blacklistTokenTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await blacklistTokenTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('returns new access token', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistRefreshToken({
      input: {
        userId: user.id,
        token: refreshToken,
      },
    });

    const result = await refreshUserTokensCommandHandler.execute({
      refreshToken,
    });

    const accessTokenPayload = tokenService.verifyToken({ token: result.accessToken });

    const refreshTokenPayload = tokenService.verifyToken({ token: result.refreshToken });

    expect(accessTokenPayload['userId']).toBe(user.id);

    expect(refreshTokenPayload['userId']).toBe(user.id);

    expect(result.accessTokenExpiresIn).toBe(configProvider.getAccessTokenExpiresIn());
  });

  it('throws an error if User does not exist', async () => {
    const userId = Generator.uuid();

    const refreshToken = tokenService.createToken({
      data: { userId },
      expiresIn: Generator.number(10000, 100000),
    });

    await expect(async () =>
      refreshUserTokensCommandHandler.execute({
        refreshToken,
      }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'User',
        userId,
      },
    });
  });

  it('throws an error if User tokens do not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await expect(async () =>
      refreshUserTokensCommandHandler.execute({
        refreshToken,
      }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'UserTokens',
        userId: user.id,
      },
    });
  });

  it('throws an error if refresh token userId does not match userId from User tokens', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistRefreshToken({
      input: {
        userId: user.id,
        token: tokenService.createToken({
          data: { userId: user.id },
          expiresIn: Generator.number(10000, 100000),
        }),
      },
    });

    await expect(async () =>
      refreshUserTokensCommandHandler.execute({
        refreshToken,
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Refresh token does not match the one from User tokens.',
      },
    });
  });

  it('throws an error if refresh token does not contain userId', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistRefreshToken({
      input: {
        userId: user.id,
        token: refreshToken,
      },
    });

    await expect(async () =>
      refreshUserTokensCommandHandler.execute({
        refreshToken,
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Refresh token does not contain userId.',
      },
    });
  });

  it('throws an error if refresh token is blacklisted', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistRefreshToken({
      input: {
        userId: user.id,
        token: refreshToken,
      },
    });

    await blacklistTokenTestUtils.createAndPersist({ input: { token: refreshToken } });

    await expect(async () =>
      refreshUserTokensCommandHandler.execute({
        refreshToken,
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Refresh token is blacklisted.',
      },
    });
  });
});
