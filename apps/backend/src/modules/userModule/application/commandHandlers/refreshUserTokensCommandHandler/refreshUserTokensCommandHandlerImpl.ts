import {
  type RefreshUserTokensCommandHandler,
  type RefreshUserTokensCommandHandlerPayload,
  type RefreshUserTokensCommandHandlerResult,
} from './refreshUserTokensCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type Config } from '../../../../../core/config.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type BlacklistTokenRepository } from '../../../domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';
import { type UserBucketRepository } from '../../../domain/repositories/userBucketRepository/userBucketRepository.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class RefreshUserTokensCommandHandlerImpl implements RefreshUserTokensCommandHandler {
  public constructor(
    private readonly loggerService: LoggerService,
    private readonly tokenService: TokenService,
    private readonly config: Config,
    private readonly userRepository: UserRepository,
    private readonly userBucketRepository: UserBucketRepository,
    private readonly blacklistTokenRepository: BlacklistTokenRepository,
  ) {}

  public async execute(
    payload: RefreshUserTokensCommandHandlerPayload,
  ): Promise<RefreshUserTokensCommandHandlerResult> {
    const { refreshToken } = payload;

    this.loggerService.debug({
      message: 'Refreshing User tokens...',
      refreshToken,
    });

    const isBlacklisted = await this.blacklistTokenRepository.findBlacklistToken({
      token: refreshToken,
    });

    if (isBlacklisted) {
      throw new OperationNotValidError({
        reason: 'Refresh token is blacklisted.',
      });
    }

    const tokenPayload = this.tokenService.verifyToken({ token: refreshToken });

    const userId = tokenPayload['userId'];

    if (!userId) {
      throw new OperationNotValidError({
        reason: 'Refresh token does not contain userId.',
      });
    }

    const user = await this.userRepository.findUser({ id: userId });

    if (!user) {
      throw new ResourceNotFoundError({
        name: 'User',
        userId,
      });
    }

    const userTokens = await this.userBucketRepository.findUserBuckets({ userId });

    if (!userTokens) {
      throw new ResourceNotFoundError({
        name: 'UserTokens',
        userId,
      });
    }

    const accessTokenExpiresIn = this.config.token.access.expiresIn;

    const accessToken = this.tokenService.createToken({
      data: {
        userId: user.getId(),
        role: user.getRole(),
      },
      expiresIn: accessTokenExpiresIn,
    });

    this.loggerService.debug({
      message: 'User tokens refreshed.',
      userId,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
    };
  }
}
