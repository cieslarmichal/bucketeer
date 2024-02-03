import { Generator } from '@common/tests';

import { type UserBucketDraft, UserBucket } from '../../../domain/entities/userBucket/userBucket.js';

export class UserBucketTestFactory {
  public create(input: Partial<UserBucketDraft> = {}): UserBucket {
    return new UserBucket({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      bucketName: Generator.word(),
      ...input,
    });
  }
}