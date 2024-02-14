import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateBucketCommandHandler } from './createBucketCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { symbols } from '../../../symbols.js';
import { type S3TestUtils } from '../../../tests/utils/s3TestUtils.js';

describe('CreateBucketCommandHandler', () => {
  let commandHandler: CreateBucketCommandHandler;

  let s3TestUtils: S3TestUtils;

  const bucketName1 = 'resources1';

  const bucketName2 = 'resources2';

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBucketCommandHandler>(symbols.createBucketCommandHandler);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);
  });

  afterEach(async () => {
    await Promise.all([s3TestUtils.deleteBucket(bucketName1), s3TestUtils.deleteBucket(bucketName2)]);
  });

  it('create a bucket', async () => {
    await commandHandler.execute({ bucketName: bucketName1 });

    const createdBuckets = await s3TestUtils.getBuckets();

    expect(createdBuckets.includes(bucketName1)).toBe(true);
  });

  it('throws an error - when a bucket with the same name already exists', async () => {
    await s3TestUtils.createBucket(bucketName2);

    try {
      await commandHandler.execute({ bucketName: bucketName2 });
    } catch (error) {
      expect(error instanceof OperationNotValidError);

      return;
    }

    expect.fail();
  });
});
