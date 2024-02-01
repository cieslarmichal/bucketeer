import {
  type LoginUserCommandHandler,
  type LoginUserCommandHandlerPayload,
  type LoginUserCommandHandlerResult,
} from './loginUserCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type HashService } from '../../services/hashService/hashService.js';

export class LoginUserCommandHandlerImpl implements LoginUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly configProvider: UserModuleConfigProvider,
  ) {}

  public async execute(payload: LoginUserCommandHandlerPayload): Promise<LoginUserCommandHandlerResult> {
    const { email: emailInput, password } = payload;

    const email = emailInput.toLowerCase();

    this.loggerService.debug({
      message: 'Logging User in...',
      email,
    });

    const user = await this.userRepository.findUser({ email });

    if (!user) {
      throw new ResourceNotFoundError({
        name: 'User',
        email,
      });
    }

    const passwordIsValid = await this.hashService.compare({
      plainData: password,
      hashedData: user.getPassword(),
    });

    if (!passwordIsValid) {
      throw new ResourceNotFoundError({
        name: 'User',
        email,
      });
    }

    const accessTokenExpiresIn = this.configProvider.getAccessTokenExpiresIn();

    const accessToken = this.tokenService.createToken({
      data: {
        userId: user.getId(),
        role: user.getRole(),
      },
      expiresIn: accessTokenExpiresIn,
    });

    const refreshTokenExpiresIn = this.configProvider.getRefreshTokenExpiresIn();

    const refreshToken = this.tokenService.createToken({
      data: {
        userId: user.getId(),
        role: user.getRole(),
      },
      expiresIn: refreshTokenExpiresIn,
    });

    const expiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);

    user.addCreateRefreshTokenAction({
      token: refreshToken,
      expiresAt,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    this.loggerService.info({
      message: 'User logged in.',
      email,
      userId: user.getId(),
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
    };
  }
}
