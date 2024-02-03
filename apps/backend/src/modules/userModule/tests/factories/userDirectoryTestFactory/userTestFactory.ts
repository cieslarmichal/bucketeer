import { Generator } from '@common/tests';

import { UserBucket, type UserBucketDraft } from '../../../domain/entities/userBucket/userBucket.js';

export class UserBucketTestFactory {
  public create(input: Partial<UserBucketDraft> = {}): UserBucket {
    return new UserBucket({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      directoryName: Generator.word(),
      ...input,
    });
  }
}
