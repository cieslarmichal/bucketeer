import { Generator } from '@common/tests';

import { type UserBucketRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userBucketTable/userBucketRawEntity.js';

export class UserBucketEntityTestFactory {
  public create(input: Partial<UserBucketRawEntity> = {}): UserBucketRawEntity {
    return {
      id: Generator.uuid(),
      userId: Generator.uuid(),
      bucketName: Generator.word(),
      ...input,
    };
  }
}
