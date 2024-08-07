import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindBucketsQueryHandler } from './findBucketsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { symbols } from '../../../symbols.js';
import { type S3TestUtils } from '../../../tests/utils/s3TestUtils.js';

describe('FindBucketsQueryHandler', () => {
  let queryHandler: FindBucketsQueryHandler;

  let s3TestUtils: S3TestUtils;

  const bucketName1 = 'resources1';

  const bucketName2 = 'resources2';

  const bucketName3 = 'resources3';

  const bucketName4 = 'resources3-previews';

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBucketsQueryHandler>(symbols.findBucketsQueryHandler);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    await Promise.all([
      s3TestUtils.createBucket(bucketName1),
      s3TestUtils.createBucket(bucketName2),
      s3TestUtils.createBucket(bucketName3),
      s3TestUtils.createBucket(bucketName4),
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      s3TestUtils.deleteBucket(bucketName1),
      s3TestUtils.deleteBucket(bucketName2),
      s3TestUtils.deleteBucket(bucketName3),
      s3TestUtils.deleteBucket(bucketName4),
    ]);
  });

  it('finds buckets', async () => {
    const { buckets, totalPages } = await queryHandler.execute({
      page: 1,
      pageSize: 10,
    });

    expect(buckets.length).toEqual(3);

    expect(buckets.find((bucket) => bucket.name === bucketName1)).toBeDefined();

    expect(buckets.find((bucket) => bucket.name === bucketName2)).toBeDefined();

    expect(buckets.find((bucket) => bucket.name === bucketName3)).toBeDefined();

    expect(totalPages).toEqual(1);
  });

  it('finds buckets limited by pagination', async () => {
    const { buckets, totalPages } = await queryHandler.execute({
      page: 1,
      pageSize: 2,
    });

    expect(buckets.length).toEqual(2);

    expect(totalPages).toEqual(2);
  });
});
