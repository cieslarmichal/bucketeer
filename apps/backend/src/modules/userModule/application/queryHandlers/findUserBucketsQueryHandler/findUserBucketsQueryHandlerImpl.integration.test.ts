import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindUserBucketsQueryHandler } from './findUserBucketsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type S3TestUtils } from '../../../../resourceModule/tests/utils/s3TestUtils.js';
import { symbols } from '../../../symbols.js';
import { type UserBucketTestUtils } from '../../../tests/utils/userBucketTestUtils/userBucketTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUserBucketsQueryHandler', () => {
  let findUserBucketsQueryHandler: FindUserBucketsQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let userBucketTestUtils: UserBucketTestUtils;

  let s3TestUtils: S3TestUtils;

  const bucketName = 'bucketName';

  beforeEach(async () => {
    const container = TestContainer.create();

    findUserBucketsQueryHandler = container.get<FindUserBucketsQueryHandler>(symbols.findUserBucketsQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBucketTestUtils = container.get<UserBucketTestUtils>(testSymbols.userBucketTestUtils);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    await userTestUtils.truncate();

    await userBucketTestUtils.truncate();

    await s3TestUtils.createBucket(bucketName);
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await userBucketTestUtils.truncate();

    await sqliteDatabaseClient.destroy();

    await s3TestUtils.deleteBucket(bucketName);
  });

  it('returns no buckets when UserBucket exists but bucket does not exist in S3', async () => {
    const user = await userTestUtils.createAndPersist();

    const userBucket = await userBucketTestUtils.createAndPersist({ input: { userId: user.id } });

    const { buckets } = await findUserBucketsQueryHandler.execute({ userId: user.id });

    expect(buckets).toEqual([{ name: userBucket.bucketName }]);
  });

  it('returns UserBucket when UserBucket exists and bucketalso exists in S3', async () => {
    const user = await userTestUtils.createAndPersist();

    const userBucket = await userBucketTestUtils.createAndPersist({
      input: {
        userId: user.id,
        bucketName,
      },
    });

    const { buckets } = await findUserBucketsQueryHandler.execute({ userId: user.id });

    expect(buckets).toEqual([{ name: userBucket.bucketName }]);
  });
});
