import { UserRole } from '@common/contracts';

import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config, ConfigFactory } from './config.js';
import { type SqliteDatabaseClient } from './database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { SqliteDatabaseClientFactory } from './database/sqliteDatabaseClient/sqliteDatabaseClientFactory.js';
import { HttpServer } from './httpServer.js';
import { coreSymbols, symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { type S3Client } from '../libs/s3/clients/s3Client/s3Client.js';
import { S3ClientFactory, type S3Config } from '../libs/s3/factories/s3ClientFactory/s3ClientFactory.js';
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

      loggerService.debug({
        message: 'Migrations run success.',
        source: Application.name,
      });
    } catch (error) {
      loggerService.error({
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

    const config = container.get<Config>(coreSymbols.config);

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    const hashService = container.get<HashService>(userSymbols.hashService);

    const userTable = new UserTable();

    const { email, password } = config.admin;

    const userExists = await sqliteDatabaseClient<UserRawEntity>(userTable.name).where({ email }).first();

    if (userExists) {
      loggerService.debug({
        message: 'Admin user already exists.',
        email,
        source: Application.name,
      });

      return;
    }

    const id = uuidService.generateUuid();

    const hashedPassword = await hashService.hash({ plainData: password });

    await sqliteDatabaseClient<UserRawEntity>(userTable.name).insert({
      id,
      email,
      password: hashedPassword,
      role: UserRole.admin,
    });

    loggerService.debug({
      message: 'Admin user created.',
      email,
      source: Application.name,
    });
  }

  public static createContainer(): DependencyInjectionContainer {
    const config = ConfigFactory.create();

    const modules: DependencyInjectionModule[] = [new UserModule(), new AuthModule(), new ResourceModule()];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({
        logLevel: config.logLevel,
      }),
    );

    container.bind<Config>(symbols.config, () => config);

    container.bind<UuidService>(symbols.uuidService, () => new UuidServiceImpl());

    container.bind<SqliteDatabaseClient>(symbols.sqliteDatabaseClient, () =>
      SqliteDatabaseClientFactory.create({ databasePath: config.databasePath }),
    );

    const s3Config: S3Config = {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
      endpoint: config.aws.endpoint ?? undefined,
    };

    container.bind<S3Client>(symbols.s3Client, () => S3ClientFactory.create(s3Config));

    container.bind<ApplicationHttpController>(
      symbols.applicationHttpController,
      () => new ApplicationHttpController(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    return container;
  }

  public static async start(): Promise<void> {
    const container = Application.createContainer();

    await this.setupDatabase(container);

    await this.createAdminUser(container);

    const server = new HttpServer(container);

    await server.start();
  }
}
