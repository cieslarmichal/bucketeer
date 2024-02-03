import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UserTokens } from '../../../domain/entities/userTokens/userTokens.js';
import { type RefreshTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/refreshTokenTable/refreshTokenRawEntity.js';
import { RefreshTokenTable } from '../../../infrastructure/databases/userDatabase/tables/refreshTokenTable/refreshTokenTable.js';
import { type UserBucketRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userBucketTable/userBucketRawEntity.js';
import { UserBucketTable } from '../../../infrastructure/databases/userDatabase/tables/userBucketTable/userBucketTable.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../../infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { RefreshTokenTestFactory } from '../../factories/refreshTokenTestFactory/refreshTokenTestFactory.js';
import { UserBucketTestFactory } from '../../factories/userBucketTestFactory/userBucketTestFactory.js';
import { UserEntityTestFactory } from '../../factories/userEntityTestFactory/userEntityTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<UserRawEntity>;
}

interface CreateAndPersistUserBucketPayload {
  input?: Partial<UserBucketRawEntity>;
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

interface FindBucketsByUserIdPayload {
  userId: string;
}

export class UserTestUtils {
  private readonly userTable = new UserTable();
  private readonly userBucketTable = new UserBucketTable();
  private readonly refreshTokenTable = new RefreshTokenTable();
  private readonly userTestFactory = new UserEntityTestFactory();
  private readonly userBucketTestFactory = new UserBucketTestFactory();
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

  public async createAndPersistUserBucket(
    payload: CreateAndPersistUserBucketPayload = {},
  ): Promise<UserBucketRawEntity> {
    const { input = {} } = payload;

    const userBucket = this.userBucketTestFactory.create(input);

    const queryBuilder = this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name);

    const rawEntities = await queryBuilder.insert(
      {
        id: userBucket.getId(),
        userId: userBucket.getUserId(),
        bucketName: userBucket.getBucketName(),
      },
      '*',
    );

    return rawEntities[0] as UserBucketRawEntity;
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

  public async findBucketsByUserId(payload: FindBucketsByUserIdPayload): Promise<UserBucketRawEntity[]> {
    const { userId } = payload;

    const userBuckets = await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name)
      .select('*')
      .where({ userId });

    return userBuckets;
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
    await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name).truncate();

    await this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name).truncate();

    await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).truncate();
  }
}
