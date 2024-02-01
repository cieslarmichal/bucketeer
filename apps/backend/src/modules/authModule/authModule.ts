import { type AccessControlService } from './application/services/accessControlService/accessControlService.js';
import { AccessControlServiceImpl } from './application/services/accessControlService/accessControlServiceImpl.js';
import { type TokenService } from './application/services/tokenService/tokenService.js';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl.js';
import { type AuthModuleConfigProvider } from './authModuleConfigProvider.js';
import { symbols } from './symbols.js';
import { type ConfigProvider } from '../../core/configProvider.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';

export class AuthModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<AuthModuleConfigProvider>(symbols.authModuleConfigProvider, () =>
      container.get<ConfigProvider>(coreSymbols.configProvider),
    );

    container.bind<TokenService>(
      symbols.tokenService,
      () => new TokenServiceImpl(container.get<AuthModuleConfigProvider>(symbols.authModuleConfigProvider)),
    );

    container.bind<AccessControlService>(
      symbols.accessControlService,
      () => new AccessControlServiceImpl(container.get<TokenService>(symbols.tokenService)),
    );
  }
}
