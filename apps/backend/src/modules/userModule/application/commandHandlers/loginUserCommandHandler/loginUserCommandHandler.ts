import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface LoginUserCommandHandlerPayload {
  readonly email: string;
  readonly password: string;
}

export interface LoginUserCommandHandlerResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresIn: number;
}

export type LoginUserCommandHandler = CommandHandler<LoginUserCommandHandlerPayload, LoginUserCommandHandlerResult>;
