import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '@common/tests';

import { type FindUserDirectoryQueryHandler } from './findUserDirectoryQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUserDirectoryQueryHandler', () => {
  let findUserDirectoryQueryHandler: FindUserDirectoryQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = Application.createContainer();

    findUserDirectoryQueryHandler = container.get<FindUserDirectoryQueryHandler>(symbols.findUserDirectoryQueryHandler);

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

    await userTestUtils.createAndPersistUserDirectory({
      input: {
        userId: user.id,
        directoryName,
      },
    });

    const { directoryName: actualDirectoryName } = await findUserDirectoryQueryHandler.execute({ userId: user.id });

    expect(actualDirectoryName).toEqual(directoryName);
  });

  it('throws an error - when a User does not have directory', async () => {
    const user = await userTestUtils.createAndPersist();

    expect(async () => {
      await findUserDirectoryQueryHandler.execute({ userId: user.id });
    }).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'UserDirectory',
        userId: user.id,
      },
    });
  });
});
