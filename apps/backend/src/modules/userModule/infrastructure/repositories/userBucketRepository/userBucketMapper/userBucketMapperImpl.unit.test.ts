import { expect, describe, it } from 'vitest';

import { UserBucketMapperImpl } from './userBucketMapperImpl.js';
import { UserBucketTestFactory } from '../../../../tests/factories/userBucketTestFactory/userBucketTestFactory.js';

describe('UserBucketMapperImpl', () => {
  const userBucketMapperImpl = new UserBucketMapperImpl();

  const userBucketTestFactory = new UserBucketTestFactory();

  it('maps from UserBucketRawEntity to UserBucket', async () => {
    const userBucketEntity = userBucketTestFactory.createRaw();

    const userBucket = userBucketMapperImpl.mapToDomain(userBucketEntity);

    expect(userBucket).toEqual({
      id: userBucketEntity.id,
      userId: userBucketEntity.userId,
      bucketName: userBucketEntity.bucketName,
    });
  });
});
