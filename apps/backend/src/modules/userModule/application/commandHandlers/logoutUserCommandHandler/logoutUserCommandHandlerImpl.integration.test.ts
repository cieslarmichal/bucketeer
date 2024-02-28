import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type LogoutUserCommandHandler } from './logoutUserCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { type BlacklistTokenTestUtils } from '../../../tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('LogoutUserCommandHandlerImpl', () => {
  let commandHandler: LogoutUserCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let tokenService: TokenService;

  let userTestUtils: UserTestUtils;

  let blacklistTokenTestUtils: BlacklistTokenTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<LogoutUserCommandHandler>(symbols.logoutUserCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    blacklistTokenTestUtils = container.get<BlacklistTokenTestUtils>(testSymbols.blacklistTokenTestUtils);
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await blacklistTokenTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('logs user out', async () => {
    const refreshToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const user = await userTestUtils.createAndPersist();

    await commandHandler.execute({
      userId: user.id,
      refreshToken,
    });

    const blacklistToken = await blacklistTokenTestUtils.findByToken({
      token: refreshToken,
    });

    expect(blacklistToken.token).toEqual(refreshToken);
  });

  it('throws an error - when a User with given id not found', async () => {
    const refreshToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const userId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          userId,
          refreshToken,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User not found.',
        userId,
      },
    });
  });
});
