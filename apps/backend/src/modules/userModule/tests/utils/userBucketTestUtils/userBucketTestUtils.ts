import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UserBucketRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userBucketTable/userBucketRawEntity.js';
import { UserBucketTable } from '../../../infrastructure/databases/userDatabase/tables/userBucketTable/userBucketTable.js';
import { UserBucketTestFactory } from '../../factories/userBucketTestFactory/userBucketTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<UserBucketRawEntity>;
}

interface FindUserBucketsPayload {
  readonly userId: string;
}

interface FindUserBucketPayload {
  readonly bucketName: string;
}

export class UserBucketTestUtils {
  private readonly userBucketTable = new UserBucketTable();
  private readonly userBucketTestFactory = new UserBucketTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserBucketRawEntity> {
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

  public async findUserBuckets(payload: FindUserBucketsPayload): Promise<UserBucketRawEntity[]> {
    const { userId } = payload;

    const userBuckets = await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name)
      .select('*')
      .where({ userId });

    return userBuckets;
  }

  public async findUserBucket(payload: FindUserBucketPayload): Promise<UserBucketRawEntity> {
    const { bucketName } = payload;

    const userBucketRawEntity = await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name)
      .select('*')
      .where({ bucketName })
      .first();

    return userBucketRawEntity as UserBucketRawEntity;
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient<UserBucketRawEntity>(this.userBucketTable.name).truncate();
  }
}
