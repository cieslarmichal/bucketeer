import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '@common/tests';

import { type GrantBucketAccessCommandHandler } from './grantBucketAccessCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('GrantBucketAccessCommandHandlerImpl', () => {
  let commandHandler: GrantBucketAccessCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<GrantBucketAccessCommandHandler>(symbols.grantBucketAccessCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('grants bucket access', async () => {
    const user = await userTestUtils.createAndPersist();

    const bucketName = Generator.bucketName();

    await commandHandler.execute({
      userId: user.id,
      bucketName,
    });

    const userBuckets = await userTestUtils.findBucketsByUserId({ userId: user.id });

    expect(userBuckets.find((userBucket) => userBucket.bucketName === bucketName)).toBeDefined();
  });

  it('throws an error when User does not exist', async () => {
    const userId = Generator.uuid();

    const bucketName = Generator.bucketName();

    expect(async () => {
      await commandHandler.execute({
        userId,
        bucketName,
      });
    }).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User not found.',
        userId,
      },
    });
  });
});
