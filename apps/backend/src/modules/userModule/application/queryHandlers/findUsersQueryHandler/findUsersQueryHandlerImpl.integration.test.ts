import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindUsersQueryHandler } from './findUsersQueryHandler.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUsersQueryHandler', () => {
  let findUsersQueryHandler: FindUsersQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = Application.createContainer();

    findUsersQueryHandler = container.get<FindUsersQueryHandler>(symbols.findUsersQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = new UserTestUtils(sqliteDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('finds Users', async () => {
    const user1 = await userTestUtils.createAndPersist();

    const user2 = await userTestUtils.createAndPersist();

    const result = await findUsersQueryHandler.execute({
      page: 1,
      pageSize: 10,
    });

    expect(result.users[0]?.getId()).toEqual(user1.id);

    expect(result.users[1]?.getId()).toEqual(user2.id);

    expect(result.totalUsers).toBe(2);
  });

  it('paginates Users', async () => {
    const user1 = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersist();

    const result = await findUsersQueryHandler.execute({
      page: 1,
      pageSize: 1,
    });

    expect(result.users[0]?.getId()).toEqual(user1.id);

    expect(result.totalUsers).toBe(2);
  });

  it('returns empty array if no Users found', async () => {
    const result = await findUsersQueryHandler.execute({
      page: 1,
      pageSize: 10,
    });

    expect(result.users).toEqual([]);

    expect(result.totalUsers).toBe(0);
  });
});
