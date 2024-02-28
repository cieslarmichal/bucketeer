import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type LoginUserCommandHandler } from './loginUserCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('LoginUserCommandHandler', () => {
  let loginUserCommandHandler: LoginUserCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let tokenService: TokenService;

  let hashService: HashService;

  let configProvider: UserModuleConfigProvider;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    loginUserCommandHandler = container.get<LoginUserCommandHandler>(symbols.loginUserCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    configProvider = container.get<UserModuleConfigProvider>(symbols.userModuleConfigProvider);

    hashService = container.get<HashService>(symbols.hashService);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('returns tokens', async () => {
    const createdUser = userTestFactory.create();

    const hashedPassword = await hashService.hash({ plainData: createdUser.getPassword() });

    await userTestUtils.persist({
      user: {
        id: createdUser.getId(),
        email: createdUser.getEmail(),
        password: hashedPassword,
        role: createdUser.getRole(),
      },
    });

    const { accessToken, refreshToken, accessTokenExpiresIn } = await loginUserCommandHandler.execute({
      email: createdUser.getEmail(),
      password: createdUser.getPassword(),
    });

    const accessTokenPayload = tokenService.verifyToken({ token: accessToken });

    const refreshTokenPayload = tokenService.verifyToken({ token: refreshToken });

    expect(accessTokenPayload['userId']).toBe(createdUser.getId());

    expect(refreshTokenPayload['userId']).toBe(createdUser.getId());

    expect(accessTokenExpiresIn).toBe(configProvider.getAccessTokenExpiresIn());
  });

  it('throws an error if a User with given email does not exist', async () => {
    const nonExistentUser = userTestFactory.create();

    await expect(
      async () =>
        await loginUserCommandHandler.execute({
          email: nonExistentUser.getEmail(),
          password: nonExistentUser.getPassword(),
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'User',
        email: nonExistentUser.getEmail(),
      },
    });
  });

  it(`throws an error if User's password does not match stored password`, async () => {
    const { email, password } = await userTestUtils.createAndPersist();

    await expect(
      async () =>
        await loginUserCommandHandler.execute({
          email,
          password,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'User',
        email,
      },
    });
  });
});
