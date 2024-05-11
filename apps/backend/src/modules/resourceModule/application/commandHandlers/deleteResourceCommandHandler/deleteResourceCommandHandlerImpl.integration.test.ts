import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { type DeleteResourceCommandHandler } from './deleteResourceCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type UserBucketTestUtils } from '../../../../userModule/tests/utils/userBucketTestUtils/userBucketTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type S3TestUtils } from '../../../tests/utils/s3TestUtils.js';

describe('DeleteResourceCommandHandlerImpl', () => {
  let commandHandler: DeleteResourceCommandHandler;

  let s3TestUtils: S3TestUtils;

  let container: DependencyInjectionContainer;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let userBucketTestUtils: UserBucketTestUtils;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName = 'sample_video1.mp4';

  const bucketName = 'resources';

  beforeEach(async () => {
    container = TestContainer.create();

    commandHandler = container.get<DeleteResourceCommandHandler>(symbols.deleteResourceCommandHandler);

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
      await commandHandler.execute({
        userId,
        resourceId: sampleFileName,
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
      await commandHandler.execute({
        userId: user.id,
        resourceId: sampleFileName,
        bucketName,
      });
    } catch (error) {
      expect(error instanceof OperationNotValidError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when resource does not exist', async () => {
    const nonExistingResourceName = Generator.word();

    const user = await userTestUtils.createAndPersist();

    await userBucketTestUtils.createAndPersist({
      input: {
        userId: user.id,
        bucketName,
      },
    });

    try {
      await commandHandler.execute({
        userId: user.id,
        resourceId: nonExistingResourceName,
        bucketName,
      });
    } catch (error) {
      expect(error instanceof OperationNotValidError);

      return;
    }

    expect.fail();
  });

  it('deletes a resource', async () => {
    const user = await userTestUtils.createAndPersist();

    await userBucketTestUtils.createAndPersist({
      input: {
        userId: user.id,
        bucketName,
      },
    });

    await s3TestUtils.uploadObject(bucketName, sampleFileName, path.join(resourcesDirectory, sampleFileName));

    const existsBefore = await s3TestUtils.objectExists(bucketName, sampleFileName);

    expect(existsBefore).toBe(true);

    await commandHandler.execute({
      userId: user.id,
      resourceId: sampleFileName,
      bucketName,
    });

    const existsAfter = await s3TestUtils.objectExists(bucketName, sampleFileName);

    expect(existsAfter).toBe(false);
  });
});
