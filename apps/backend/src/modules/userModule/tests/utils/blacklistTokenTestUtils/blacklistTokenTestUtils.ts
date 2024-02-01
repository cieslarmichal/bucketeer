import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type BlacklistTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/blacklistTokenTable/blacklistTokenRawEntity.js';
import { BlacklistTokenTable } from '../../../infrastructure/databases/userDatabase/tables/blacklistTokenTable/blacklistTokenTable.js';
import { BlacklistTokenTestFactory } from '../../factories/blacklistTokenTestFactory/blacklistTokenTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<BlacklistTokenRawEntity>;
}

interface PersistPayload {
  blacklistToken: BlacklistTokenRawEntity;
}

interface FindByTokenPayload {
  token: string;
}

export class BlacklistTokenTestUtils {
  private readonly databaseTable = new BlacklistTokenTable();
  private readonly blacklistTokenTestFactory = new BlacklistTokenTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private createQueryBuilder(): QueryBuilder<BlacklistTokenRawEntity> {
    return this.sqliteDatabaseClient<BlacklistTokenRawEntity>(this.databaseTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BlacklistTokenRawEntity> {
    const { input } = payload;

    const blacklistToken = this.blacklistTokenTestFactory.create(input);

    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(
      {
        id: blacklistToken.getId(),
        token: blacklistToken.getToken(),
        expiresAt: blacklistToken.getExpiresAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BlacklistTokenRawEntity;

    return {
      id: rawEntity.id,
      token: rawEntity.token,
      expiresAt: new Date(rawEntity.expiresAt),
    };
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { blacklistToken } = payload;

    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.insert(blacklistToken, '*');
  }

  public async findByToken(payload: FindByTokenPayload): Promise<BlacklistTokenRawEntity> {
    const { token } = payload;

    const queryBuilder = this.createQueryBuilder();

    const blacklistTokenRawEntity = (await queryBuilder
      .select('*')
      .where({ token })
      .first()) as BlacklistTokenRawEntity;

    return {
      id: blacklistTokenRawEntity.id,
      token: blacklistTokenRawEntity.token,
      expiresAt: new Date(blacklistTokenRawEntity.expiresAt),
    };
  }

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
