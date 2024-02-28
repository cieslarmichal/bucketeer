import { type S3Client } from '@aws-sdk/client-s3';

import { testSymbols } from './symbols.js';
import { Application } from '../../src/core/application.js';
import { type SqliteDatabaseClient } from '../../src/core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../src/core/symbols.js';
import { type DependencyInjectionContainer } from '../../src/libs/dependencyInjection/dependencyInjectionContainer.js';
import { S3TestUtils } from '../../src/modules/resourceModule/tests/utils/s3TestUtils.js';
import { BlacklistTokenTestUtils } from '../../src/modules/userModule/tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { UserBucketTestUtils } from '../../src/modules/userModule/tests/utils/userBucketTestUtils/userBucketTestUtils.js';
import { UserTestUtils } from '../../src/modules/userModule/tests/utils/userTestUtils/userTestUtils.js';

export class TestContainer {
  public static create(): DependencyInjectionContainer {
    const container = Application.createContainer();

    container.bind<UserTestUtils>(
      testSymbols.userTestUtils,
      () => new UserTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<UserBucketTestUtils>(
      testSymbols.userBucketTestUtils,
      () => new UserBucketTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<BlacklistTokenTestUtils>(
      testSymbols.blacklistTokenTestUtils,
      () => new BlacklistTokenTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<S3TestUtils>(
      testSymbols.s3TestUtils,
      () => new S3TestUtils(container.get<S3Client>(coreSymbols.s3Client)),
    );

    return container;
  }
}
