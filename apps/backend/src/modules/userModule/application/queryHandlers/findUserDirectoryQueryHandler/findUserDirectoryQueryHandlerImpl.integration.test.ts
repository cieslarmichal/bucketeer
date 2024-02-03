import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '@common/tests';

import { type FindUserBucketsQueryHandler } from './findUserDirectoryQueryHandler.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUserBucketsQueryHandler', () => {
  let findUserBucketsQueryHandler: FindUserBucketsQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = Application.createContainer();

    findUserBucketsQueryHandler = container.get<FindUserBucketsQueryHandler>(symbols.findUserBucketsQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = new UserTestUtils(sqliteDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('finds User buckets', async () => {
    const user = await userTestUtils.createAndPersist();

    const bucketName = Generator.word();

    await userTestUtils.createAndPersistUserBucket({
      input: {
        userId: user.id,
        bucketName,
      },
    });

    const { buckets } = await findUserBucketsQueryHandler.execute({ userId: user.id });

    expect(buckets).toEqual([bucketName]);
  });
});
