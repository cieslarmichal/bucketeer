import { type UserMapper } from './userMapper/userMapper.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type UserDomainAction } from '../../../domain/entities/user/domainActions/userDomainAction.js';
import { UserDomainActionType } from '../../../domain/entities/user/domainActions/userDomainActionType.js';
import { type User } from '../../../domain/entities/user/user.js';
import { type UserTokens } from '../../../domain/entities/userTokens/userTokens.js';
import {
  type UserRepository,
  type CreateUserPayload,
  type FindUserPayload,
  type UpdateUserPayload,
  type DeleteUserPayload,
  type FindUserTokensPayload,
  type FindUserDirectoryPayload,
} from '../../../domain/repositories/userRepository/userRepository.js';
import { type RefreshTokenRawEntity } from '../../databases/userDatabase/tables/refreshTokenTable/refreshTokenRawEntity.js';
import { RefreshTokenTable } from '../../databases/userDatabase/tables/refreshTokenTable/refreshTokenTable.js';
import { type UserDirectoryRawEntity } from '../../databases/userDatabase/tables/userDirectoryTable/userDirectoryRawEntity.js';
import { UserDirectoryTable } from '../../databases/userDatabase/tables/userDirectoryTable/userDirectoryTable.js';
import { type UserRawEntity } from '../../databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../databases/userDatabase/tables/userTable/userTable.js';

interface TokenValue {
  readonly token: string;
  readonly expiresAt: Date;
}

interface DirectoryValue {
  readonly directoryName: string;
}

export interface MappedUserUpdate {
  readonly refreshTokenCreatePayloads: TokenValue[];
  readonly directoryUpdatePayload?: DirectoryValue | undefined;
}

export interface FindRefreshTokensPayload {
  readonly userId: string;
}

export class UserRepositoryImpl implements UserRepository {
  private readonly userTable = new UserTable();
  private readonly userDirectoryTable = new UserDirectoryTable();
  private readonly refreshTokenTable = new RefreshTokenTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly userMapper: UserMapper,
    private readonly uuidService: UuidService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createUser(payload: CreateUserPayload): Promise<User> {
    const { email, password, role, directoryName } = payload;

    let rawEntities: UserRawEntity[] = [];

    const id = this.uuidService.generateUuid();

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        rawEntities = await transaction<UserRawEntity>(this.userTable.name).insert(
          {
            id,
            email,
            password,
            role,
          },
          '*',
        );

        if (directoryName) {
          const userDirectoryId = this.uuidService.generateUuid();

          await transaction<UserDirectoryRawEntity>(this.userDirectoryTable.name).insert({
            id: userDirectoryId,
            userId: id,
            directoryName,
          });
        }
      });
    } catch (error) {
      this.loggerService.error({
        message: 'Error while creating User.',
        error,
      });

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
      this.loggerService.error({
        message: 'Error while finding User.',
        error,
      });

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

  public async findUserDirectory(payload: FindUserDirectoryPayload): Promise<string | null> {
    const { userId } = payload;

    let rawEntity: UserDirectoryRawEntity | undefined;

    try {
      rawEntity = await this.sqliteDatabaseClient<UserDirectoryRawEntity>(this.userDirectoryTable.name)
        .select('*')
        .where({ userId })
        .first();
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding UserDirectory.',
        error,
      });

      throw new RepositoryError({
        entity: 'UserDirectory',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return rawEntity.directoryName;
  }

  public async findUserTokens(payload: FindUserTokensPayload): Promise<UserTokens | null> {
    const { userId } = payload;

    const refreshTokens = await this.findRefreshTokens({ userId });

    if (!refreshTokens.length) {
      return null;
    }

    return {
      refreshTokens: refreshTokens.map((refreshToken) => refreshToken.token),
    };
  }

  private async findRefreshTokens(payload: FindRefreshTokensPayload): Promise<RefreshTokenRawEntity[]> {
    const { userId } = payload;

    let rawEntities: RefreshTokenRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name)
        .select('*')
        .where({ userId });
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding RefreshToken.',
        error,
      });

      throw new RepositoryError({
        entity: 'RefreshToken',
        operation: 'find',
      });
    }

    return rawEntities;
  }

  public async updateUser(payload: UpdateUserPayload): Promise<void> {
    const { id, domainActions } = payload;

    const existingUser = await this.findUser({ id });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
        id,
      });
    }

    const { refreshTokenCreatePayloads, directoryUpdatePayload } = this.mapDomainActionsToUpdatePayload(domainActions);

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        if (refreshTokenCreatePayloads.length) {
          await transaction<RefreshTokenRawEntity>(this.refreshTokenTable.name).insert(
            refreshTokenCreatePayloads.map((refreshTokenCreatePayload) => ({
              id: this.uuidService.generateUuid(),
              userId: id,
              ...refreshTokenCreatePayload,
            })),
          );
        }

        if (directoryUpdatePayload) {
          await transaction<UserDirectoryRawEntity>(this.userDirectoryTable.name).update({
            userId: id,
            directoryName: directoryUpdatePayload.directoryName,
          });
        }
      });
    } catch (error) {
      const errorContext =
        error instanceof Error
          ? {
              errorMessage: error.message,
              errorName: error.name,
            }
          : {};

      this.loggerService.error({
        message: 'Error while updating User.',
        error: errorContext,
      });

      throw new RepositoryError({
        entity: 'User',
        operation: 'update',
      });
    }
  }

  private mapDomainActionsToUpdatePayload(domainActions: UserDomainAction[]): MappedUserUpdate {
    const refreshTokenCreatePayloads: TokenValue[] = [];

    let directoryUpdatePayload: DirectoryValue | undefined = undefined;

    domainActions.forEach((domainAction) => {
      switch (domainAction.actionName) {
        case UserDomainActionType.createRefreshToken:
          refreshTokenCreatePayloads.push({
            token: domainAction.payload.token,
            expiresAt: domainAction.payload.expiresAt,
          });

          break;

        case UserDomainActionType.updateDirectory:
          directoryUpdatePayload = {
            directoryName: domainAction.payload.directoryName,
          };

          break;

        default:
          this.loggerService.error({
            message: 'Error mapping domain actions.',
          });

          throw new RepositoryError({
            entity: 'User',
            operation: 'update',
          });
      }
    });

    return {
      refreshTokenCreatePayloads,
      directoryUpdatePayload,
    };
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
      this.loggerService.error({
        message: 'Error while deleting User.',
        error,
      });

      throw new RepositoryError({
        entity: 'User',
        operation: 'delete',
      });
    }
  }
}
