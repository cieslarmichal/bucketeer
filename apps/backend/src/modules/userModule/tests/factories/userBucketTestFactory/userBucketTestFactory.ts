import { Generator } from '../../../../../../tests/generator.js';
import { type UserBucketDraft, UserBucket } from '../../../domain/entities/userBucket/userBucket.js';
import { type UserBucketRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userBucketTable/userBucketRawEntity.js';

export class UserBucketTestFactory {
  public create(input: Partial<UserBucketDraft> = {}): UserBucket {
    return new UserBucket({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      bucketName: Generator.word(),
      ...input,
    });
  }

  public createRaw(input: Partial<UserBucketRawEntity> = {}): UserBucketRawEntity {
    return {
      id: Generator.uuid(),
      userId: Generator.uuid(),
      bucketName: Generator.word(),
      ...input,
    };
  }
}
