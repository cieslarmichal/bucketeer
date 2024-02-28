import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type BlacklistTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/blacklistTokenTable/blacklistTokenRawEntity.js';
import { BlacklistTokenTable } from '../../../infrastructure/databases/userDatabase/tables/blacklistTokenTable/blacklistTokenTable.js';
import { BlacklistTokenTestFactory } from '../../factories/blacklistTokenTestFactory/blacklistTokenTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BlacklistTokenRawEntity>;
}

interface PersistPayload {
  readonly blacklistToken: BlacklistTokenRawEntity;
}

interface FindByTokenPayload {
  readonly token: string;
}

export class BlacklistTokenTestUtils {
  private readonly databaseTable = new BlacklistTokenTable();
  private readonly blacklistTokenTestFactory = new BlacklistTokenTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BlacklistTokenRawEntity> {
    const { input } = payload;

    const blacklistToken = this.blacklistTokenTestFactory.create(input);

    const rawEntities = await this.sqliteDatabaseClient<BlacklistTokenRawEntity>(this.databaseTable.name).insert(
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

    await this.sqliteDatabaseClient<BlacklistTokenRawEntity>(this.databaseTable.name).insert(blacklistToken, '*');
  }

  public async findByToken(payload: FindByTokenPayload): Promise<BlacklistTokenRawEntity> {
    const { token } = payload;

    const blacklistTokenRawEntity = (await this.sqliteDatabaseClient<BlacklistTokenRawEntity>(this.databaseTable.name)
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
    await this.sqliteDatabaseClient<BlacklistTokenRawEntity>(this.databaseTable.name).truncate();
  }
}
