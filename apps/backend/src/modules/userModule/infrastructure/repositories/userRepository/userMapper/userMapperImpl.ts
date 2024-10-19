import { type UserMapper } from './userMapper.js';
import { User, UserWithBuckets } from '../../../../domain/entities/user/user.js';
import {
  type UserWithBucketsJoinRawEntity,
  type UserRawEntity,
} from '../../../databases/userDatabase/tables/userTable/userRawEntity.js';

export class UserMapperImpl implements UserMapper {
  public mapToDomainWithBuckets(rawEntities: Array<UserWithBucketsJoinRawEntity>): UserWithBuckets[] {
    const usersWithBucketsMap = rawEntities.reduce((agg, entity) => {
      const existingUser = agg.get(entity.userId);

      if (existingUser) {
        if (entity.bucketId !== null) {
          const updatedUser = new UserWithBuckets({
            id: existingUser.getId(),
            email: existingUser.getEmail(),
            password: existingUser.getPassword(),
            role: existingUser.getRole(),
            buckets: [
              ...existingUser.getBuckets(),
              {
                bucketName: entity.bucketName,
                id: entity.bucketId,
                userId: entity.userId,
              },
            ],
          });

          agg.set(entity.userId, updatedUser);
        }
      } else {
        const newUser = new UserWithBuckets({
          id: entity.userId,
          email: entity.email,
          password: entity.password,
          role: entity.role,
          buckets: entity.bucketId
            ? [
                {
                  bucketName: entity.bucketName,
                  id: entity.bucketId,
                  userId: entity.userId,
                },
              ]
            : [],
        });

        agg.set(entity.userId, newUser);
      }

      return agg;
    }, new Map<string, UserWithBuckets>());

    return Array.from(usersWithBucketsMap.values());
  }

  public mapToDomain(entity: UserRawEntity): User {
    const { id, email, password, role } = entity;

    return new User({
      id,
      email,
      password,
      role,
    });
  }
}
