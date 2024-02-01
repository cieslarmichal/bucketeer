import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface RefreshUserTokensCommandHandlerPayload {
  readonly refreshToken: string;
}

export interface RefreshUserTokensCommandHandlerResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresIn: number;
}

export type RefreshUserTokensCommandHandler = CommandHandler<
  RefreshUserTokensCommandHandlerPayload,
  RefreshUserTokensCommandHandlerResult
>;
