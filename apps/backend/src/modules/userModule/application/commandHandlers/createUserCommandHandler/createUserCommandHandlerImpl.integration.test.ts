import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { UserRole } from '@common/contracts';

import { type CreateUserCommandHandler } from './createUserCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('CrateUserCommandHandler', () => {
  let createUserCommandHandler: CreateUserCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let hashService: HashService;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    createUserCommandHandler = container.get<CreateUserCommandHandler>(symbols.createUserCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    hashService = container.get<HashService>(symbols.hashService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('creates a User', async () => {
    const user = userTestFactory.create();

    const { user: createdUser } = await createUserCommandHandler.execute({
      email: user.getEmail(),
      password: user.getPassword(),
    });

    const foundUser = await userTestUtils.findByEmail({ email: user.getEmail() });

    expect(createdUser.getEmail()).toEqual(user.getEmail());

    expect(createdUser.getRole()).toEqual(UserRole.user);

    expect(foundUser).toEqual({
      id: createdUser.getId(),
      email: createdUser.getEmail(),
      role: createdUser.getRole(),
      password: expect.any(String),
    });

    const passwordMatches = await hashService.compare({
      plainData: user.getPassword(),
      hashedData: foundUser.password,
    });

    expect(passwordMatches).toBe(true);
  });

  it('throws an error when a User with the same email already exists', async () => {
    const existingUser = await userTestUtils.createAndPersist();

    expect(async () => {
      await createUserCommandHandler.execute({
        email: existingUser.email,
        password: existingUser.password,
      });
    }).toThrowErrorInstance({
      instance: ResourceAlreadyExistsError,
      context: {
        name: 'User',
        email: existingUser.email,
      },
    });
  });

  it('throws an error when password does not meet requirements', async () => {
    const user = userTestFactory.create();

    expect(async () => {
      await createUserCommandHandler.execute({
        email: user.getEmail(),
        password: '123',
      });
    }).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });
});
