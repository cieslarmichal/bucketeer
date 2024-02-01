import { testSymbols } from './symbols.js';
import { Application } from '../../src/core/application.js';
import { type ConfigProvider } from '../../src/core/configProvider.js';
import { type SqliteDatabaseClient } from '../../src/core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../src/core/symbols.js';
import { type DependencyInjectionContainer } from '../../src/libs/dependencyInjection/dependencyInjectionContainer.js';
import { HttpServiceFactory } from '../../src/libs/httpService/factories/httpServiceFactory/httpServiceFactory.js';
import { type HttpService } from '../../src/libs/httpService/services/httpService/httpService.js';
import { type LoggerService } from '../../src/libs/logger/services/loggerService/loggerService.js';
import { BlacklistTokenTestUtils } from '../../src/modules/userModule/tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { UserTestUtils } from '../../src/modules/userModule/tests/utils/userTestUtils/userTestUtils.js';
import { AzuriteService } from '../azurite/azuriteService.js';
import { ApplicationService } from '../e2e/application/applicationService.js';
import { UserService } from '../e2e/user/userService.js';

export class TestContainer {
  public static create(): DependencyInjectionContainer {
    const container = Application.createContainer();

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    container.bind<HttpService>(testSymbols.httpService, () => new HttpServiceFactory(loggerService).create());

    container.bind<UserService>(
      testSymbols.userService,
      () =>
        new UserService(
          container.get<HttpService>(testSymbols.httpService),
          container.get<ConfigProvider>(coreSymbols.configProvider),
        ),
    );

    container.bind<ApplicationService>(
      testSymbols.applicationService,
      () =>
        new ApplicationService(
          container.get<HttpService>(testSymbols.httpService),
          container.get<ConfigProvider>(coreSymbols.configProvider),
        ),
    );

    container.bind<UserTestUtils>(
      testSymbols.userTestUtils,
      () => new UserTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<BlacklistTokenTestUtils>(
      testSymbols.blacklistTokenTestUtils,
      () => new BlacklistTokenTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<AzuriteService>(testSymbols.azuriteService, () => new AzuriteService());

    return container;
  }
}
