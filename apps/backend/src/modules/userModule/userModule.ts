import { AdminUserHttpController } from './api/httpControllers/adminUserHttpController/adminUserHttpController.js';
import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController.js';
import { type CreateUserCommandHandler } from './application/commandHandlers/createUserCommandHandler/createUserCommandHandler.js';
import { CrateUserCommandHandlerImpl } from './application/commandHandlers/createUserCommandHandler/createUserCommandHandlerImpl.js';
import { type DeleteUserCommandHandler } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler.js';
import { DeleteUserCommandHandlerImpl } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandlerImpl.js';
import { type GrantBucketAccessCommandHandler } from './application/commandHandlers/grantBucketAccessCommandHandler/grantBucketAccessCommandHandler.js';
import { GrantBucketAccessCommandHandlerImpl } from './application/commandHandlers/grantBucketAccessCommandHandler/grantBucketAccessCommandHandlerImpl.js';
import { type LoginUserCommandHandler } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler.js';
import { LoginUserCommandHandlerImpl } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandlerImpl.js';
import { type LogoutUserCommandHandler } from './application/commandHandlers/logoutUserCommandHandler/logoutUserCommandHandler.js';
import { LogoutUserCommandHandlerImpl } from './application/commandHandlers/logoutUserCommandHandler/logoutUserCommandHandlerImpl.js';
import { type RefreshUserTokensCommandHandler } from './application/commandHandlers/refreshUserTokensCommandHandler/refreshUserTokensCommandHandler.js';
import { RefreshUserTokensCommandHandlerImpl } from './application/commandHandlers/refreshUserTokensCommandHandler/refreshUserTokensCommandHandlerImpl.js';
import { type RevokeBucketAccessCommandHandler } from './application/commandHandlers/revokeBucketAccessCommandHandler/revokeBucketAccessCommandHandler.js';
import { RevokeBucketAccessCommandHandlerImpl } from './application/commandHandlers/revokeBucketAccessCommandHandler/revokeBucketAccessCommandHandlerImpl.js';
import { type FindUserBucketsQueryHandler } from './application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { FindUserBucketsQueryHandlerImpl } from './application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandlerImpl.js';
import { type FindUserQueryHandler } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { FindUserQueryHandlerImpl } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandlerImpl.js';
import { type FindUsersQueryHandler } from './application/queryHandlers/findUsersQueryHandler/findUsersQueryHandler.js';
import { FindUsersQueryHandlerImpl } from './application/queryHandlers/findUsersQueryHandler/findUsersQueryHandlerImpl.js';
import { type HashService } from './application/services/hashService/hashService.js';
import { HashServiceImpl } from './application/services/hashService/hashServiceImpl.js';
import { type PasswordValidationService } from './application/services/passwordValidationService/passwordValidationService.js';
import { PasswordValidationServiceImpl } from './application/services/passwordValidationService/passwordValidationServiceImpl.js';
import { type BlacklistTokenRepository } from './domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';
import { type UserBucketRepository } from './domain/repositories/userBucketRepository/userBucketRepository.js';
import { type UserRepository } from './domain/repositories/userRepository/userRepository.js';
import { type BlacklistTokenMapper } from './infrastructure/repositories/blacklistTokenRepository/blacklistTokenMapper/blacklistTokenMapper.js';
import { BlacklistTokenMapperImpl } from './infrastructure/repositories/blacklistTokenRepository/blacklistTokenMapper/blacklistTokenMapperImpl.js';
import { BlacklistTokenRepositoryImpl } from './infrastructure/repositories/blacklistTokenRepository/blacklistTokenRepositoryImpl.js';
import { type UserBucketMapper } from './infrastructure/repositories/userBucketRepository/userBucketMapper/userBucketMapper.js';
import { UserBucketMapperImpl } from './infrastructure/repositories/userBucketRepository/userBucketMapper/userBucketMapperImpl.js';
import { UserBucketRepositoryImpl } from './infrastructure/repositories/userBucketRepository/userBucketRepositoryImpl.js';
import { type UserMapper } from './infrastructure/repositories/userRepository/userMapper/userMapper.js';
import { UserMapperImpl } from './infrastructure/repositories/userRepository/userMapper/userMapperImpl.js';
import { UserRepositoryImpl } from './infrastructure/repositories/userRepository/userRepositoryImpl.js';
import { symbols } from './symbols.js';
import { type Config } from '../../core/config.js';
import { type SqliteDatabaseClient } from '../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { type TokenService } from '../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../authModule/symbols.js';

export class UserModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<UserMapper>(symbols.userMapper, () => new UserMapperImpl());

    container.bind<UserBucketMapper>(symbols.userBucketMapper, () => new UserBucketMapperImpl());

    container.bind<UserRepository>(
      symbols.userRepository,
      () =>
        new UserRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<UserMapper>(symbols.userMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<UserBucketRepository>(
      symbols.userBucketRepository,
      () =>
        new UserBucketRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<UserBucketMapper>(symbols.userBucketMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<BlacklistTokenMapper>(symbols.blacklistTokenMapper, () => new BlacklistTokenMapperImpl());

    container.bind<BlacklistTokenRepository>(
      symbols.blacklistTokenRepository,
      () =>
        new BlacklistTokenRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<BlacklistTokenMapper>(symbols.blacklistTokenMapper),
          container.get<UuidService>(coreSymbols.uuidService),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<HashService>(
      symbols.hashService,
      () => new HashServiceImpl(container.get<Config>(coreSymbols.config)),
    );

    container.bind<PasswordValidationService>(
      symbols.passwordValidationService,
      () => new PasswordValidationServiceImpl(),
    );

    container.bind<CreateUserCommandHandler>(
      symbols.createUserCommandHandler,
      () =>
        new CrateUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<HashService>(symbols.hashService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<PasswordValidationService>(symbols.passwordValidationService),
        ),
    );

    container.bind<GrantBucketAccessCommandHandler>(
      symbols.grantBucketAccessCommandHandler,
      () =>
        new GrantBucketAccessCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<UserBucketRepository>(symbols.userBucketRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<RevokeBucketAccessCommandHandler>(
      symbols.revokeBucketAccessCommandHandler,
      () =>
        new RevokeBucketAccessCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<UserBucketRepository>(symbols.userBucketRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<LoginUserCommandHandler>(
      symbols.loginUserCommandHandler,
      () =>
        new LoginUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<HashService>(symbols.hashService),
          container.get<TokenService>(authSymbols.tokenService),
          container.get<Config>(coreSymbols.config),
        ),
    );

    container.bind<LogoutUserCommandHandler>(
      symbols.logoutUserCommandHandler,
      () =>
        new LogoutUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<TokenService>(authSymbols.tokenService),
          container.get<BlacklistTokenRepository>(symbols.blacklistTokenRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<RefreshUserTokensCommandHandler>(
      symbols.refreshUserTokensCommandHandler,
      () =>
        new RefreshUserTokensCommandHandlerImpl(
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<TokenService>(authSymbols.tokenService),
          container.get<Config>(coreSymbols.config),
          container.get<UserRepository>(symbols.userRepository),
          container.get<UserBucketRepository>(symbols.userBucketRepository),
          container.get<BlacklistTokenRepository>(symbols.blacklistTokenRepository),
        ),
    );

    container.bind<DeleteUserCommandHandler>(
      symbols.deleteUserCommandHandler,
      () =>
        new DeleteUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<FindUserQueryHandler>(
      symbols.findUserQueryHandler,
      () => new FindUserQueryHandlerImpl(container.get<UserRepository>(symbols.userRepository)),
    );

    container.bind<FindUsersQueryHandler>(
      symbols.findUsersQueryHandler,
      () => new FindUsersQueryHandlerImpl(container.get<UserRepository>(symbols.userRepository)),
    );

    container.bind<FindUserBucketsQueryHandler>(
      symbols.findUserBucketsQueryHandler,
      () => new FindUserBucketsQueryHandlerImpl(container.get<UserBucketRepository>(symbols.userBucketRepository)),
    );

    container.bind<UserHttpController>(
      symbols.userHttpController,
      () =>
        new UserHttpController(
          container.get<LoginUserCommandHandler>(symbols.loginUserCommandHandler),
          container.get<FindUserQueryHandler>(symbols.findUserQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
          container.get<LogoutUserCommandHandler>(symbols.logoutUserCommandHandler),
          container.get<RefreshUserTokensCommandHandler>(symbols.refreshUserTokensCommandHandler),
        ),
    );

    container.bind<AdminUserHttpController>(
      symbols.adminUserHttpController,
      () =>
        new AdminUserHttpController(
          container.get<CreateUserCommandHandler>(symbols.createUserCommandHandler),
          container.get<DeleteUserCommandHandler>(symbols.deleteUserCommandHandler),
          container.get<FindUserQueryHandler>(symbols.findUserQueryHandler),
          container.get<FindUsersQueryHandler>(symbols.findUsersQueryHandler),
          container.get<GrantBucketAccessCommandHandler>(symbols.grantBucketAccessCommandHandler),
          container.get<RevokeBucketAccessCommandHandler>(symbols.revokeBucketAccessCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }
}
