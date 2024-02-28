import { type UserBucketMapper } from './userBucketMapper.js';
import { UserBucket } from '../../../../domain/entities/userBucket/userBucket.js';
import { type UserBucketRawEntity } from '../../../databases/userDatabase/tables/userBucketTable/userBucketRawEntity.js';

export class UserBucketMapperImpl implements UserBucketMapper {
  public mapToDomain(entity: UserBucketRawEntity): UserBucket {
    const { id, userId, bucketName } = entity;

    return new UserBucket({
      id,
      userId,
      bucketName,
    });
  }
}
