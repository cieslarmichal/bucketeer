import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { type FindResourcesMetadataQueryHandler } from './findResourcesMetadataQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type S3TestUtils } from '../../../tests/utils/s3TestUtils.js';

describe('FindResourcesMetadataQueryHandlerImpl', () => {
  let queryHandler: FindResourcesMetadataQueryHandler;

  let s3TestUtils: S3TestUtils;

  let container: DependencyInjectionContainer;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName1 = 'sample_video1.mp4';

  const sampleFileName2 = 'sample_image2.jpeg';

  const bucketName = 'resources';

  beforeEach(async () => {
    container = TestContainer.create();

    queryHandler = container.get<FindResourcesMetadataQueryHandler>(symbols.findResourcesMetadataQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    await userTestUtils.truncate();

    await s3TestUtils.createBucket(bucketName);
  });

  afterEach(async () => {
    await userTestUtils.truncate();

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
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when user does not have any directory', async () => {
    const user = await userTestUtils.createAndPersist();

    try {
      await queryHandler.execute({
        userId: user.id,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('finds resources metadata', async () => {
    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserDirectory({
      input: {
        userId: user.id,
        directoryName: bucketName,
      },
    });

    await s3TestUtils.uploadObject(
      bucketName,
      sampleFileName1,
      path.join(resourcesDirectory, sampleFileName1),
      'video/mp4',
    );

    await s3TestUtils.uploadObject(
      bucketName,
      sampleFileName2,
      path.join(resourcesDirectory, sampleFileName2),
      'image/jpeg',
    );

    const { resourcesMetadata, totalPages } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
    });

    expect(totalPages).toEqual(1);

    expect(resourcesMetadata.length).toEqual(2);

    const file1Index = resourcesMetadata.findIndex((resourceMetadata) => resourceMetadata.name === sampleFileName1);

    const file2Index = resourcesMetadata.findIndex((resourceMetadata) => resourceMetadata.name === sampleFileName2);

    expect(resourcesMetadata[file1Index]).toEqual({
      name: sampleFileName1,
      updatedAt: expect.any(String),
      contentSize: 17839845,
      contentType: 'video/mp4',
    });

    expect(resourcesMetadata[file2Index]).toEqual({
      name: sampleFileName2,
      updatedAt: expect.any(String),
      contentSize: 7735619,
      contentType: 'image/jpeg',
    });
  });
});
