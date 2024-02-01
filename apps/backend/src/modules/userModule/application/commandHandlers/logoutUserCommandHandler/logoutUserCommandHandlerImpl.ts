import { type LogoutUserCommandHandler, type ExecutePayload } from './logoutUserCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type BlacklistTokenRepository } from '../../../domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class LogoutUserCommandHandlerImpl implements LogoutUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly blacklistTokenRepository: BlacklistTokenRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { userId, refreshToken } = payload;

    this.loggerService.debug({
      message: 'Logging user out...',
      userId,
    });

    this.tokenService.verifyToken({ token: refreshToken });

    const isTokenBlacklisted = await this.blacklistTokenRepository.findBlacklistToken({
      token: refreshToken,
    });

    if (isTokenBlacklisted) {
      this.loggerService.debug({
        message: 'Refresh token is already on blacklist.',
        userId,
        refreshToken,
      });

      return;
    }

    const user = await this.userRepository.findUser({
      id: userId,
    });

    if (!user) {
      throw new OperationNotValidError({
        reason: 'User not found.',
        userId,
      });
    }

    const userTokens = await this.userRepository.findUserTokens({
      userId,
    });

    if (!userTokens) {
      throw new OperationNotValidError({
        reason: 'User tokens not found.',
        userId,
      });
    }

    if (!userTokens.refreshTokens.includes(refreshToken)) {
      throw new OperationNotValidError({
        reason: 'Refresh token is not valid.',
        userId,
        refreshToken,
      });
    }

    const { expiresAt } = this.tokenService.decodeToken({
      token: refreshToken,
    });

    await this.blacklistTokenRepository.createBlacklistToken({
      token: refreshToken,
      expiresAt: new Date(expiresAt),
    });

    this.loggerService.debug({
      message: 'User logged out.',
      userId,
    });
  }
}
