import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindUserBucketsQueryHandler } from './findUserBucketsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { type UserBucketTestUtils } from '../../../tests/utils/userBucketTestUtils/userBucketTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUserBucketsQueryHandler', () => {
  let findUserBucketsQueryHandler: FindUserBucketsQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let userBucketTestUtils: UserBucketTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    findUserBucketsQueryHandler = container.get<FindUserBucketsQueryHandler>(symbols.findUserBucketsQueryHandler);

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

  it('finds UserBuckets', async () => {
    const user = await userTestUtils.createAndPersist();

    const userBucket = await userBucketTestUtils.createAndPersist({ input: { userId: user.id } });

    const { buckets } = await findUserBucketsQueryHandler.execute({ userId: user.id });

    expect(buckets).toEqual([userBucket.bucketName]);
  });
});
