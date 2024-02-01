import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UserTokens } from '../../../domain/entities/userTokens/userTokens.js';
import { type RefreshTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/refreshTokenTable/refreshTokenRawEntity.js';
import { RefreshTokenTable } from '../../../infrastructure/databases/userDatabase/tables/refreshTokenTable/refreshTokenTable.js';
import { type UserDirectoryRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userDirectoryTable/userDirectoryRawEntity.js';
import { UserDirectoryTable } from '../../../infrastructure/databases/userDatabase/tables/userDirectoryTable/userDirectoryTable.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../../infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { RefreshTokenTestFactory } from '../../factories/refreshTokenTestFactory/refreshTokenTestFactory.js';
import { UserDirectoryTestFactory } from '../../factories/userDirectoryTestFactory/userTestFactory.js';
import { UserEntityTestFactory } from '../../factories/userEntityTestFactory/userEntityTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<UserRawEntity>;
}

interface CreateAndPersistUserDirectoryPayload {
  input?: Partial<UserDirectoryRawEntity>;
}

interface CreateAndPersistRefreshTokenPayload {
  input?: Partial<RefreshTokenRawEntity>;
}

interface PersistPayload {
  user: UserRawEntity;
}

interface FindByEmailPayload {
  email: string;
}

interface FindByIdPayload {
  id: string;
}

interface FindTokensByUserIdPayload {
  userId: string;
}

interface FindDirectoryByUserIdPayload {
  userId: string;
}

export class UserTestUtils {
  private readonly userTable = new UserTable();
  private readonly userDirectoryTable = new UserDirectoryTable();
  private readonly refreshTokenTable = new RefreshTokenTable();
  private readonly userTestFactory = new UserEntityTestFactory();
  private readonly userDirectoryTestFactory = new UserDirectoryTestFactory();
  private readonly refreshTokenTestFactory = new RefreshTokenTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserRawEntity> {
    const { input } = payload;

    const user = this.userTestFactory.create(input);

    const rawEntities = await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).insert(
      {
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
      },
      '*',
    );

    return rawEntities[0] as UserRawEntity;
  }

  public async createAndPersistUserDirectory(
    payload: CreateAndPersistUserDirectoryPayload = {},
  ): Promise<UserDirectoryRawEntity> {
    const { input = {} } = payload;

    const userDirectory = this.userDirectoryTestFactory.create(input);

    const queryBuilder = this.sqliteDatabaseClient<UserDirectoryRawEntity>(this.userDirectoryTable.name);

    const rawEntities = await queryBuilder.insert(
      {
        id: userDirectory.getId(),
        userId: userDirectory.getUserId(),
        directoryName: userDirectory.getDirectoryName(),
      },
      '*',
    );

    return rawEntities[0] as UserDirectoryRawEntity;
  }

  public async createAndPersistRefreshToken(
    payload: CreateAndPersistRefreshTokenPayload,
  ): Promise<RefreshTokenRawEntity> {
    const { input = {} } = payload;

    const refreshToken = this.refreshTokenTestFactory.create(input);

    const queryBuilder = this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name);

    const rawEntities = await queryBuilder.insert(
      {
        id: refreshToken.getId(),
        userId: refreshToken.getUserId(),
        token: refreshToken.getToken(),
        expiresAt: refreshToken.getExpiresAt(),
      },
      '*',
    );

    return rawEntities[0] as RefreshTokenRawEntity;
  }

  public async findTokensByUserId(payload: FindTokensByUserIdPayload): Promise<UserTokens> {
    const { userId } = payload;

    const refreshTokens = await this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name)
      .select('*')
      .where({ userId });

    return {
      refreshTokens: refreshTokens.map((refreshToken) => refreshToken.token),
    };
  }

  public async findDirectoryByUserId(payload: FindDirectoryByUserIdPayload): Promise<UserDirectoryRawEntity> {
    const { userId } = payload;

    const userDirectory = await this.sqliteDatabaseClient<UserDirectoryRawEntity>(this.userDirectoryTable.name)
      .select('*')
      .where({ userId })
      .first();

    return userDirectory as UserDirectoryRawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { user } = payload;

    await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).insert(user, '*');
  }

  public async findByEmail(payload: FindByEmailPayload): Promise<UserRawEntity> {
    const { email: emailInput } = payload;

    const email = emailInput.toLowerCase();

    const userRawEntity = await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name)
      .select('*')
      .where({ email })
      .first();

    return userRawEntity as UserRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserRawEntity> {
    const { id } = payload;

    const userRawEntity = await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name)
      .select('*')
      .where({ id })
      .first();

    return userRawEntity as UserRawEntity;
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient<UserDirectoryRawEntity>(this.userDirectoryTable.name).truncate();

    await this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name).truncate();

    await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).truncate();
  }
}
