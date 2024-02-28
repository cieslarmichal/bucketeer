import { type UserBucket } from '../../../../domain/entities/userBucket/userBucket.js';
import { type UserBucketRawEntity } from '../../../databases/userDatabase/tables/userBucketTable/userBucketRawEntity.js';

export interface UserBucketMapper {
  mapToDomain(rawEntity: UserBucketRawEntity): UserBucket;
}
