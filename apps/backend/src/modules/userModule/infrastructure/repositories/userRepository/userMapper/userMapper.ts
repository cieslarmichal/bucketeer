import { type UserWithBuckets, type User } from '../../../../domain/entities/user/user.js';
import {
  type UserWithBucketsJoinRawEntity,
  type UserRawEntity,
} from '../../../databases/userDatabase/tables/userTable/userRawEntity.js';

export interface UserMapper {
  mapToDomain(rawEntity: UserRawEntity): User;
  mapToDomainWithBuckets(rawEntities: UserWithBucketsJoinRawEntity[]): UserWithBuckets[];
}
