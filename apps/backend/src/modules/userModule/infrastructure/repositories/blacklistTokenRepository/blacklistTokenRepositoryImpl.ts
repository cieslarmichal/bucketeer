import { type BlacklistTokenMapper } from './blacklistTokenMapper/blacklistTokenMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type BlacklistToken } from '../../../domain/entities/blacklistToken/blacklistToken.js';
import {
  type BlacklistTokenRepository,
  type CreateBlacklistTokenPayload,
  type FindBlacklistTokenPayload,
} from '../../../domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';
import { type BlacklistTokenRawEntity } from '../../databases/userDatabase/tables/blacklistTokenTable/blacklistTokenRawEntity.js';
import { BlacklistTokenTable } from '../../databases/userDatabase/tables/blacklistTokenTable/blacklistTokenTable.js';

export class BlacklistTokenRepositoryImpl implements BlacklistTokenRepository {
  private readonly blacklistTokenDatabaseTable = new BlacklistTokenTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly blacklistTokenMapper: BlacklistTokenMapper,
    private readonly uuidService: UuidService,
    private readonly loggerService: LoggerService,
  ) {}

  private createBlacklistTokenQueryBuilder(): QueryBuilder<BlacklistTokenRawEntity> {
    return this.sqliteDatabaseClient<BlacklistTokenRawEntity>(this.blacklistTokenDatabaseTable.name);
  }

  public async createBlacklistToken(payload: CreateBlacklistTokenPayload): Promise<BlacklistToken> {
    const { token, expiresAt } = payload;

    const queryBuilder = this.createBlacklistTokenQueryBuilder();

    let rawEntities: BlacklistTokenRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await queryBuilder.insert(
        {
          id,
          token,
          expiresAt,
        },
        '*',
      );
    } catch (error) {
      if (error instanceof Error) {
        this.loggerService.error({
          message: 'Error while creating BlacklistToken.',
          errorMessage: error.message,
        });
      }

      throw new RepositoryError({
        entity: 'BlacklistToken',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0] as BlacklistTokenRawEntity;

    return this.blacklistTokenMapper.mapToDomain(rawEntity);
  }

  public async findBlacklistToken(payload: FindBlacklistTokenPayload): Promise<BlacklistToken | null> {
    const { token } = payload;

    const queryBuilder = this.createBlacklistTokenQueryBuilder();

    let rawEntity: BlacklistTokenRawEntity | undefined;

    try {
      rawEntity = await queryBuilder.select('*').where({ token }).first();
    } catch (error) {
      if (error instanceof Error) {
        this.loggerService.error({
          message: 'Error while finding BlacklistToken.',
          errorMessage: error.message,
        });
      }

      throw new RepositoryError({
        entity: 'BlacklistToken',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.blacklistTokenMapper.mapToDomain(rawEntity);
  }
}
