import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { type FindResourcesMetadataQueryHandler } from './findResourcesMetadataQueryHandler.js';
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
  let queryHandler: FindResourcesMetadataQueryHandler;

  let s3TestUtils: S3TestUtils;

  let container: DependencyInjectionContainer;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let userBucketTestUtils: UserBucketTestUtils;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName1 = 'sample_video1.mp4';

  const sampleFileName2 = 'sample_image2.jpeg';

  const bucketName = 'resources';

  beforeEach(async () => {
    container = TestContainer.create();

    queryHandler = container.get<FindResourcesMetadataQueryHandler>(symbols.findResourcesMetadataQueryHandler);

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
        page: 1,
        pageSize: 10,
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
        page: 1,
        pageSize: 10,
        bucketName,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('finds resources metadata', async () => {
    const user = await userTestUtils.createAndPersist();

    await userBucketTestUtils.createAndPersist({
      input: {
        userId: user.id,
        bucketName,
      },
    });

    await s3TestUtils.uploadObject(bucketName, sampleFileName1, path.join(resourcesDirectory, sampleFileName1));

    await s3TestUtils.uploadObject(bucketName, sampleFileName2, path.join(resourcesDirectory, sampleFileName2));

    const { resourcesMetadata, totalPages } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
      bucketName,
    });

    expect(totalPages).toEqual(1);

    expect(resourcesMetadata.length).toEqual(2);

    const file1Index = resourcesMetadata.findIndex((resourceMetadata) => resourceMetadata.name === sampleFileName1);

    const file2Index = resourcesMetadata.findIndex((resourceMetadata) => resourceMetadata.name === sampleFileName2);

    expect(resourcesMetadata[file1Index]).toEqual({
      name: sampleFileName1,
      updatedAt: expect.any(Date),
      contentSize: 17839845,
    });

    expect(resourcesMetadata[file2Index]).toEqual({
      name: sampleFileName2,
      updatedAt: expect.any(Date),
      contentSize: 7735619,
    });
  });
});
