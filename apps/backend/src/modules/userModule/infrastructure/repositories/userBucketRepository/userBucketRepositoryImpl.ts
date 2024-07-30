/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UserBucketMapper } from './userBucketMapper/userBucketMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type UserBucket } from '../../../domain/entities/userBucket/userBucket.js';
import {
  type FindUserBucketsPayload,
  type CreateUserBucketPayload,
  type UserBucketRepository,
  type DeleteUserBucketPayload,
} from '../../../domain/repositories/userBucketRepository/userBucketRepository.js';
import { type UserBucketRawEntity } from '../../databases/userDatabase/tables/userBucketTable/userBucketRawEntity.js';
import { UserBucketTable } from '../../databases/userDatabase/tables/userBucketTable/userBucketTable.js';

export class UserBucketRepositoryImpl implements UserBucketRepository {
  private readonly userBucketTable = new UserBucketTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly userBucketMapper: UserBucketMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async createUserBucket(payload: CreateUserBucketPayload): Promise<UserBucket> {
    const { bucketName, userId } = payload;

    let rawEntities: UserBucketRawEntity[] = [];

    try {
      rawEntities = await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name).insert(
        {
          id: this.uuidService.generateUuid(),
          bucketName,
          userId,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBucket',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0] as UserBucketRawEntity;

    return this.userBucketMapper.mapToDomain(rawEntity);
  }

  public async findUserBuckets(payload: FindUserBucketsPayload): Promise<UserBucket[]> {
    const { userId, bucketName } = payload;

    let rawEntities: UserBucketRawEntity[];

    let whereClause = {};

    if (userId) {
      whereClause = {
        ...whereClause,
        userId,
      };
    }

    if (bucketName) {
      whereClause = {
        ...whereClause,
        bucketName,
      };
    }

    try {
      rawEntities = await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name)
        .select('*')
        .where(whereClause);
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBuckets',
        operation: 'find',
      });
    }

    return rawEntities.map((rawEntity) => this.userBucketMapper.mapToDomain(rawEntity));
  }

  public async deleteUserBucket(payload: DeleteUserBucketPayload): Promise<void> {
    const { bucketName, userId } = payload;

    try {
      await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name).delete().where({
        bucketName,
        userId,
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBucket',
        operation: 'delete',
      });
    }
  }
}
