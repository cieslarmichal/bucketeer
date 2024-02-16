import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type DeleteBucketCommandHandler } from './deleteBucketCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { symbols } from '../../../symbols.js';
import { type S3TestUtils } from '../../../tests/utils/s3TestUtils.js';

describe('DeleteBucketCommandHandler', () => {
  let commandHandler: DeleteBucketCommandHandler;

  let s3TestUtils: S3TestUtils;

  const bucketName = 'resources';

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<DeleteBucketCommandHandler>(symbols.deleteBucketCommandHandler);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    await s3TestUtils.deleteBucket(bucketName);
  });

  afterEach(async () => {
    await s3TestUtils.deleteBucket(bucketName);
  });

  it('deletes a bucket', async () => {
    await s3TestUtils.createBucket(bucketName);

    await commandHandler.execute({ bucketName });

    const buckets = await s3TestUtils.getBuckets();

    expect(buckets.includes(bucketName)).toBe(false);
  });

  it('throws an error - when a bucket does not exist', async () => {
    try {
      await commandHandler.execute({ bucketName });
    } catch (error) {
      expect(error instanceof OperationNotValidError);

      return;
    }

    expect.fail();
  });
});
