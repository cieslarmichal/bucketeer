import { UserRole } from '@common/contracts';

import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { ConfigProvider } from './configProvider.js';
import { type SqliteDatabaseClient } from './database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { SqliteDatabaseClientFactory } from './database/sqliteDatabaseClient/sqliteDatabaseClientFactory.js';
import { HttpServer } from './httpServer.js';
import { coreSymbols, symbols } from './symbols.js';
import { AzureBlobServiceFactory } from '../libs/azureBlob/factories/azureBlobServiceFactory/azureBlobServiceFactory.js';
import { type AzureBlobService } from '../libs/azureBlob/services/azureBlobService/azureBlobService.js';
import { type AzureBlobConfig } from '../libs/azureBlob/types/azureBlobConfig.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../libs/uuid/services/uuidService/uuidService.js';
import { UuidServiceImpl } from '../libs/uuid/services/uuidService/uuidServiceImpl.js';
import { AuthModule } from '../modules/authModule/authModule.js';
import { ResourceModule } from '../modules/resourceModule/resourceModule.js';
import { type HashService } from '../modules/userModule/application/services/hashService/hashService.js';
import { type UserRawEntity } from '../modules/userModule/infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../modules/userModule/infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { UserDatabaseManager } from '../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { userSymbols } from '../modules/userModule/symbols.js';
import { UserModule } from '../modules/userModule/userModule.js';

export class Application {
  private static async setupDatabase(container: DependencyInjectionContainer): Promise<void> {
    const databaseManagers = [UserDatabaseManager];

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    try {
      for (const databaseManager of databaseManagers) {
        await databaseManager.bootstrapDatabase(container);
      }

      loggerService.info({
        message: 'Migrations run success.',
        source: Application.name,
      });
    } catch (error) {
      loggerService.info({
        message: 'Migrations run error.',
        source: Application.name,
      });

      const sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

      await sqliteDatabaseClient.raw('PRAGMA journal_mode = WAL');
    }
  }

  private static async createAdminUser(container: DependencyInjectionContainer): Promise<void> {
    const sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    const uuidService = container.get<UuidService>(coreSymbols.uuidService);

    const configProvider = container.get<ConfigProvider>(coreSymbols.configProvider);

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    const hashService = container.get<HashService>(userSymbols.hashService);

    const email = configProvider.getAdminEmail();

    const userTable = new UserTable();

    const userExists = await sqliteDatabaseClient<UserRawEntity>(userTable.name).where({ email }).first();

    if (userExists) {
      loggerService.info({
        message: 'Admin user already exists.',
        email,
        source: Application.name,
      });

      return;
    }

    const id = uuidService.generateUuid();

    const password = configProvider.getAdminPassword();

    const hashedPassword = await hashService.hash({ plainData: password });

    await sqliteDatabaseClient<UserRawEntity>(userTable.name).insert({
      id,
      email,
      password: hashedPassword,
      role: UserRole.admin,
    });

    loggerService.info({
      message: 'Admin user created.',
      email,
      source: Application.name,
    });
  }

  public static createContainer(): DependencyInjectionContainer {
    const configProvider = new ConfigProvider();

    const modules: DependencyInjectionModule[] = [new UserModule(), new AuthModule(), new ResourceModule()];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({
        logLevel: configProvider.getLogLevel(),
      }),
    );

    container.bind<UuidService>(symbols.uuidService, () => new UuidServiceImpl());

    container.bind<ConfigProvider>(symbols.configProvider, () => configProvider);

    container.bind<SqliteDatabaseClient>(symbols.sqliteDatabaseClient, () =>
      SqliteDatabaseClientFactory.create({ databasePath: configProvider.getSqliteDatabasePath() }),
    );

    const azureStorageConnectionString = configProvider.getAzureStorageConnectionString();

    const azureBlobConfig: AzureBlobConfig = azureStorageConnectionString
      ? { connectionString: azureStorageConnectionString }
      : {
          accountName: configProvider.getAzureStorageAccountName(),
          accountKey: configProvider.getAzureStorageAccountKey(),
        };

    container.bind<AzureBlobService>(symbols.azureBlobService, () => AzureBlobServiceFactory.create(azureBlobConfig));

    container.bind<ApplicationHttpController>(
      symbols.applicationHttpController,
      () => new ApplicationHttpController(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    return container;
  }

  public static async start(): Promise<void> {
    const container = Application.createContainer();

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    await this.setupDatabase(container);

    await this.createAdminUser(container);

    const server = new HttpServer(container);

    await server.start();

    loggerService.log({
      message: `Application started.`,
      source: Application.name,
    });
  }
}
