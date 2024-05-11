import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type RevokeBucketAccessCommandHandler } from './revokeBucketAccessCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { type UserBucketTestUtils } from '../../../tests/utils/userBucketTestUtils/userBucketTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('RevokeBucketAccessCommandHandlerImpl', () => {
  let commandHandler: RevokeBucketAccessCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let userBucketTestUtils: UserBucketTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<RevokeBucketAccessCommandHandler>(symbols.revokeBucketAccessCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBucketTestUtils = container.get<UserBucketTestUtils>(testSymbols.userBucketTestUtils);

    await userTestUtils.truncate();

    await userBucketTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await userBucketTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('revokes bucket access', async () => {
    const user = await userTestUtils.createAndPersist();

    const userBucket = await userBucketTestUtils.createAndPersist({ input: { userId: user.id } });

    await commandHandler.execute({
      userId: user.id,
      bucketName: userBucket.bucketName,
    });

    const userBuckets = await userBucketTestUtils.findUserBuckets({ userId: user.id });

    expect(userBuckets.length).toBe(0);
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
