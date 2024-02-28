import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../../infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { UserTestFactory } from '../../factories/userTestFactory/userTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<UserRawEntity>;
}

interface PersistPayload {
  readonly user: UserRawEntity;
}

interface FindByEmailPayload {
  readonly email: string;
}

interface FindByIdPayload {
  readonly id: string;
}

export class UserTestUtils {
  private readonly userTable = new UserTable();
  private readonly userTestFactory = new UserTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserRawEntity> {
    const { input } = payload;

    const user = this.userTestFactory.createRaw(input);

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
    await this.sqliteDatabaseClient<UserRawEntity>(this.userTable.name).truncate();
  }
}
