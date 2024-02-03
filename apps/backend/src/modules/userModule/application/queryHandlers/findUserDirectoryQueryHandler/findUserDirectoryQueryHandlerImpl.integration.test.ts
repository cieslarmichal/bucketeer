import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '@common/tests';

import { type FindUserBucketQueryHandler } from './findUserBucketQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUserBucketQueryHandler', () => {
  let findUserBucketQueryHandler: FindUserBucketQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = Application.createContainer();

    findUserBucketQueryHandler = container.get<FindUserBucketQueryHandler>(symbols.findUserBucketQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = new UserTestUtils(sqliteDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('finds User directory by userId', async () => {
    const user = await userTestUtils.createAndPersist();

    const directoryName = Generator.word();

    await userTestUtils.createAndPersistUserBucket({
      input: {
        userId: user.id,
        directoryName,
      },
    });

    const { directoryName: actualDirectoryName } = await findUserBucketQueryHandler.execute({ userId: user.id });

    expect(actualDirectoryName).toEqual(directoryName);
  });

  it('throws an error - when a User does not have directory', async () => {
    const user = await userTestUtils.createAndPersist();

    expect(async () => {
      await findUserBucketQueryHandler.execute({ userId: user.id });
    }).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'UserBucket',
        userId: user.id,
      },
    });
  });
});
