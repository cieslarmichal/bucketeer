import { type AccessControlService } from './application/services/accessControlService/accessControlService.js';
import { AccessControlServiceImpl } from './application/services/accessControlService/accessControlServiceImpl.js';
import { type TokenService } from './application/services/tokenService/tokenService.js';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl.js';
import { symbols } from './symbols.js';
import { type Config } from '../../core/config.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';

export class AuthModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<TokenService>(
      symbols.tokenService,
      () => new TokenServiceImpl(container.get<Config>(coreSymbols.config)),
    );

    container.bind<AccessControlService>(
      symbols.accessControlService,
      () => new AccessControlServiceImpl(container.get<TokenService>(symbols.tokenService)),
    );
  }
}
