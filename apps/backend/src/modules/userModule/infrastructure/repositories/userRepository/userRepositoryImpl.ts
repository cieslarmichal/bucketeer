/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UserMapper } from './userMapper/userMapper.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type User } from '../../../domain/entities/user/user.js';
import {
  type UserRepository,
  type SaveUserPayload,
  type FindUserPayload,
  type DeleteUserPayload,
  type FindUsersPayload,
} from '../../../domain/repositories/userRepository/userRepository.js';
import { type UserRawEntity } from '../../databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../databases/userDatabase/tables/userTable/userTable.js';

export class UserRepositoryImpl implements UserRepository {
  private readonly userTable = new UserTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly userMapper: UserMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async saveUser(payload: SaveUserPayload): Promise<User> {
    const { user } = payload;

    let rawEntities: UserRawEntity[] = [];

    try {
      rawEntities = await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).insert(
        {
          id: this.uuidService.generateUuid(),
          email: user.email,
          password: user.password,
          role: user.role,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.mapToDomain(rawEntity);
  }

  public async findUser(payload: FindUserPayload): Promise<User | null> {
    const { id, email } = payload;

    let whereCondition: Partial<UserRawEntity> = {};

    if (!id && !email) {
      throw new OperationNotValidError({
        reason: 'Either id or email must be provided.',
      });
    }

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (email) {
      whereCondition = {
        ...whereCondition,
        email,
      };
    }

    let rawEntity: UserRawEntity | undefined;

    try {
      rawEntity = await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name)
        .select('*')
        .where(whereCondition)
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.userMapper.mapToDomain(rawEntity);
  }

  public async findUsers(payload: FindUsersPayload): Promise<User[]> {
    const { page, pageSize } = payload;

    let rawEntities: UserRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name)
        .select('*')
        .offset((page - 1) * pageSize)
        .limit(pageSize);
    } catch (error) {
      throw new RepositoryError({
        entity: 'Users',
        operation: 'find',
      });
    }

    return rawEntities.map((rawEntity) => this.userMapper.mapToDomain(rawEntity));
  }

  public async countUsers(): Promise<number> {
    try {
      const result = await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).count('* as count').first();

      if (!result) {
        throw new RepositoryError({
          entity: 'Users',
          operation: 'count',
        });
      }

      return Number((result as any).count);
    } catch (error) {
      throw new RepositoryError({
        entity: 'Users',
        operation: 'count',
      });
    }
  }

  public async deleteUser(payload: DeleteUserPayload): Promise<void> {
    const { id } = payload;

    const existingUser = await this.findUser({ id });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
        id,
      });
    }

    try {
      await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'delete',
      });
    }
  }
}
