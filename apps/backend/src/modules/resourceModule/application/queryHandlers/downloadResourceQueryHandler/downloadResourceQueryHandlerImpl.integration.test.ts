import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { type DownloadResourceQueryHandler } from './downloadResourceQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type UserBucketTestUtils } from '../../../../userModule/tests/utils/userBucketTestUtils/userBucketTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type S3TestUtils } from '../../../tests/utils/s3TestUtils.js';

describe('FindResourcesMetadataQueryHandlerImpl', () => {
  let queryHandler: DownloadResourceQueryHandler;

  let s3TestUtils: S3TestUtils;

  let container: DependencyInjectionContainer;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let userBucketTestUtils: UserBucketTestUtils;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName1 = 'sample_video1.mp4';

  const bucketName = 'resources';

  beforeEach(async () => {
    container = TestContainer.create();

    queryHandler = container.get<DownloadResourceQueryHandler>(symbols.downloadResourceQueryHandler);

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

  it('throws an error - when user does not exist', async () => {
    const userId = Generator.uuid();

    try {
      await queryHandler.execute({
        userId,
        resourceId: sampleFileName1,
        bucketName,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when user does not have access to the bucket', async () => {
    const user = await userTestUtils.createAndPersist();

    try {
      await queryHandler.execute({
        userId: user.id,
        resourceId: sampleFileName1,
        bucketName,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when Resource does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    await userBucketTestUtils.createAndPersist({
      input: {
        userId: user.id,
        bucketName,
      },
    });

    try {
      await queryHandler.execute({
        userId: user.id,
        resourceId: sampleFileName1,
        bucketName,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('downloads a Resource', async () => {
    const user = await userTestUtils.createAndPersist();

    await userBucketTestUtils.createAndPersist({
      input: {
        userId: user.id,
        bucketName,
      },
    });

    await s3TestUtils.uploadObject(bucketName, sampleFileName1, path.join(resourcesDirectory, sampleFileName1));

    const { resource } = await queryHandler.execute({
      userId: user.id,
      resourceId: sampleFileName1,
      bucketName,
    });

    expect(resource).toEqual({
      name: sampleFileName1,
      updatedAt: expect.any(Date),
      contentSize: 17839845,
      contentType: 'application/octet-stream',
      data: expect.any(Object),
    });
  });
});
