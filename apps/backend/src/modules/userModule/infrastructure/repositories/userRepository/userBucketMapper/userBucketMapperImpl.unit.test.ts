import { expect, describe, it } from 'vitest';

import { UserBucketMapperImpl } from './userBucketMapperImpl.js';
import { UserBucketEntityTestFactory } from '../../../../tests/factories/userBucketEntityTestFactory/userBucketEntityTestFactory.js';

describe('UserBucketMapperImpl', () => {
  const userBucketMapperImpl = new UserBucketMapperImpl();

  const userBucketEntityTestFactory = new UserBucketEntityTestFactory();

  it('maps from UserBucketRawEntity to UserBucket', async () => {
    const userBucketEntity = userBucketEntityTestFactory.create();

    const userBucket = userBucketMapperImpl.mapToDomain(userBucketEntity);

    expect(userBucket).toEqual({
      id: userBucketEntity.id,
      userId: userBucketEntity.userId,
      bucketName: userBucketEntity.bucketName,
    });
  });
});
